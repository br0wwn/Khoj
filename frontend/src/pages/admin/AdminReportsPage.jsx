import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import reportToAdminService from '../../services/reportToAdminService';
import adminApi from '../../services/adminApiService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportedItem, setReportedItem] = useState(null);
  const [itemLoading, setItemLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (modelFilter) filters.reportModel = modelFilter;
      
      const response = await reportToAdminService.getAllReports(filters);
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, modelFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await reportToAdminService.updateStatus(id, newStatus);
      fetchReports();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await reportToAdminService.deleteReport(id);
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const handleResolveAndDelete = async (report) => {
    if (!window.confirm(`Are you sure you want to resolve this report and DELETE the reported ${report.reportModel}? This action cannot be undone!`)) {
      return;
    }

    try {
      // First, update the report status to resolved
      await reportToAdminService.updateStatus(report._id, 'resolved');
      
      // Then, delete the actual reported item using admin-specific endpoints
      const reportid = report.reportid._id || report.reportid;
      
      switch (report.reportModel) {
        case 'User':
          await adminApi.delete(`/api/admin/users/${reportid}`);
          break;
        case 'Police':
          await adminApi.delete(`/api/admin/police/${reportid}`);
          break;
        case 'Alert':
          await adminApi.delete(`/api/admin/alerts/${reportid}`);
          break;
        case 'Report':
          await adminApi.delete(`/api/admin/reports/${reportid}`);
          break;
        default:
          throw new Error('Unknown report type');
      }

      // Close modal and refresh
      setSelectedReport(null);
      setReportedItem(null);
      fetchReports();
      alert(`${report.reportModel} has been deleted successfully.`);
    } catch (error) {
      console.error('Error resolving and deleting:', error);
      alert(error.response?.data?.message || 'Failed to delete the reported item');
    }
  };

  const fetchReportedItem = async (report) => {
    setItemLoading(true);
    setReportedItem(null);
    
    try {
      let response;
      const reportid = report.reportid._id || report.reportid;
      
      switch (report.reportModel) {
        case 'User':
          response = await adminApi.get(`/api/profile/user/${reportid}`, {
            withCredentials: true
          });
          setReportedItem({ type: 'User', data: response.data.user });
          break;
        case 'Police':
          response = await adminApi.get(`/api/profile/police/${reportid}`, {
            withCredentials: true
          });
          setReportedItem({ type: 'Police', data: response.data.police });
          break;
        case 'Alert':
          response = await adminApi.get(`/api/alerts/${reportid}`, {
            withCredentials: true
          });
          setReportedItem({ type: 'Alert', data: response.data.data });
          break;
        case 'Report':
          response = await adminApi.get(`/api/reports/${reportid}`, {
            withCredentials: true
          });
          setReportedItem({ type: 'Report', data: response.data.data });
          break;
        default:
          setReportedItem({ type: 'Unknown', data: null });
      }
    } catch (error) {
      console.error('Error fetching reported item:', error);
      setReportedItem({ type: 'Error', data: null, error: error.response?.data?.message || 'Failed to load item' });
    } finally {
      setItemLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    fetchReportedItem(report);
    
    // Auto-update status to 'reviewed' if it's pending
    if (report.status === 'pending') {
      handleStatusUpdate(report._id, 'reviewed');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = reports.filter(report => {
    if (!searchTerm) return true;
    return report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           report.reportModel.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports to Admin</h1>
        <p className="text-gray-600">View and manage reports from users</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search by category or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
            >
              <option value="">All Types</option>
              <option value="User">User</option>
              <option value="Police">Police</option>
              <option value="Alert">Alert</option>
              <option value="Report">Report</option>
              <option value="Group">Group</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading reports...</p>
          ) : filteredReports.length === 0 ? (
            <p className="text-center text-gray-600">No reports found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {report.reportModel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {report.details || 'No details provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button
                          onClick={() => handleDelete(report._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedReport(null);
            setReportedItem(null);
          }}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">Report Details</h3>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setReportedItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Report Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Report Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Report Category</label>
                  <p className="text-gray-900">{selectedReport.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Report Details</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedReport.details || 'No details provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reported At</label>
                  <p className="text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Reported Item */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-4">Reported {selectedReport.reportModel}</h4>
              
              {itemLoading ? (
                <p className="text-center text-gray-600 py-8">Loading reported item...</p>
              ) : reportedItem?.error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {reportedItem.error}
                </div>
              ) : reportedItem?.type === 'User' || reportedItem?.type === 'Police' ? (
                <div className="bg-white border rounded-lg p-6">
                  <div className="flex items-start gap-6 mb-4">
                    <img
                      src={reportedItem.data?.profilePicture?.url || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <h5 className="text-xl font-semibold text-gray-800 mb-1">{reportedItem.data?.name}</h5>
                      <p className="text-gray-600 mb-2">{reportedItem.data?.email}</p>
                      {reportedItem.type === 'Police' && reportedItem.data?.badgeNumber && (
                        <p className="text-gray-600">Badge: {reportedItem.data.badgeNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  {reportedItem.data?.bio && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-500">Bio</label>
                      <p className="text-gray-900">{reportedItem.data.bio}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {reportedItem.type === 'Police' && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Rank</label>
                          <p className="text-gray-900">{reportedItem.data?.rank || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Department</label>
                          <p className="text-gray-900">{reportedItem.data?.department || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Station</label>
                          <p className="text-gray-900">{reportedItem.data?.station || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">District</label>
                          <p className="text-gray-900">{reportedItem.data?.district || 'N/A'}</p>
                        </div>
                      </>
                    )}
                    {reportedItem.type === 'User' && reportedItem.data?.dateOfBirth && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                        <p className="text-gray-900">{new Date(reportedItem.data.dateOfBirth).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : reportedItem?.type === 'Alert' ? (
                <div className="bg-white border rounded-lg p-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-4">{reportedItem.data?.title}</h5>
                  
                  {reportedItem.data?.media && reportedItem.data.media.length > 0 && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Media</label>
                      <div className="flex gap-2 flex-wrap">
                        {reportedItem.data.media.map((item, index) => (
                          <div key={index} className="w-40 h-40 rounded overflow-hidden border">
                            {item.media_type === 'image' ? (
                              <img
                                src={item.media_url}
                                alt="Alert media"
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                onClick={() => window.open(item.media_url, '_blank')}
                              />
                            ) : (
                              <video
                                src={item.media_url}
                                className="w-full h-full object-cover"
                                controls
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{reportedItem.data?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900">{reportedItem.data?.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">District / Upazila</label>
                      <p className="text-gray-900">{reportedItem.data?.district}, {reportedItem.data?.upazila}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-900 capitalize">{reportedItem.data?.status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p className="text-gray-900">{formatDate(reportedItem.data?.createdAt)}</p>
                    </div>
                  </div>

                  {reportedItem.data?.coordinates?.lat && reportedItem.data?.coordinates?.lng && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Location on Map</label>
                      <div className="h-64 rounded-lg overflow-hidden border">
                        <MapContainer
                          center={[reportedItem.data.coordinates.lat, reportedItem.data.coordinates.lng]}
                          zoom={15}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[reportedItem.data.coordinates.lat, reportedItem.data.coordinates.lng]}>
                            <Popup>{reportedItem.data?.location}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    </div>
                  )}
                </div>
              ) : reportedItem?.type === 'Report' ? (
                <div className="bg-white border rounded-lg p-6">
                  <h5 className="text-xl font-semibold text-gray-800 mb-4">{reportedItem.data?.title}</h5>
                  
                  {reportedItem.data?.media && reportedItem.data.media.length > 0 && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Media</label>
                      <div className="flex gap-2 flex-wrap">
                        {reportedItem.data.media.map((item, index) => (
                          <div key={index} className="w-40 h-40 rounded overflow-hidden border">
                            {item.media_type === 'image' ? (
                              <img
                                src={item.media_url}
                                alt="Report media"
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                onClick={() => window.open(item.media_url, '_blank')}
                              />
                            ) : (
                              <video
                                src={item.media_url}
                                className="w-full h-full object-cover"
                                controls
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{reportedItem.data?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900">{reportedItem.data?.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">District / Upazila</label>
                      <p className="text-gray-900">{reportedItem.data?.district}, {reportedItem.data?.upazila}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Anonymous</label>
                      <p className="text-gray-900">{reportedItem.data?.is_anonymous ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p className="text-gray-900">{formatDate(reportedItem.data?.createdAt)}</p>
                    </div>
                  </div>

                  {reportedItem.data?.coordinates?.lat && reportedItem.data?.coordinates?.lng && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Location on Map</label>
                      <div className="h-64 rounded-lg overflow-hidden border">
                        <MapContainer
                          center={[reportedItem.data.coordinates.lat, reportedItem.data.coordinates.lng]}
                          zoom={15}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <Marker position={[reportedItem.data.coordinates.lat, reportedItem.data.coordinates.lng]}>
                            <Popup>{reportedItem.data?.location}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">Unable to load reported item</p>
              )}
            </div>

            <div className="mt-6 flex gap-3 border-t pt-6">
              <button
                onClick={() => handleResolveAndDelete(selectedReport)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Resolve & Delete Item
              </button>
              <button
                onClick={() => {
                  handleStatusUpdate(selectedReport._id, 'rejected');
                  setSelectedReport(null);
                  setReportedItem(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject Report
              </button>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setReportedItem(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReportsPage;
