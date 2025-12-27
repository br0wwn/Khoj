import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import adminApi from '../../services/adminApiService';

const AdminAlertsPage = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/api/alerts');
      setAlerts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (alertId, alertTitle) => {
    if (!window.confirm(`Are you sure you want to delete alert "${alertTitle}"? This action cannot be undone!`)) {
      return;
    }

    try {
      await adminApi.delete(`/api/admin/alerts/${alertId}`);
      alert('Alert deleted successfully');
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert(error.response?.data?.message || 'Failed to delete alert');
    }
  };

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      await adminApi.put(`/api/alerts/${alertId}`, { status: newStatus });
      alert('Alert status updated successfully');
      fetchAlerts();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || alert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Alerts Management</h1>
        <p className="text-gray-600">View and manage all alerts</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="investigating">Investigating</option>
            </select>
            <span className="text-gray-600 whitespace-nowrap">{filteredAlerts.length} alerts</span>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading alerts...</p>
          ) : filteredAlerts.length === 0 ? (
            <p className="text-center text-gray-600">{searchTerm || statusFilter ? 'No alerts found matching your criteria' : 'No alerts found'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Title</th>
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Created By</th>
                    <th className="text-left py-3 px-4">Created At</th>
                    <th className="text-left py-3 px-4">View</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert) => (
                    <tr key={alert._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{alert.title}</td>
                      <td className="py-3 px-4">{alert.location?.address || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <select
                          value={alert.status}
                          onChange={(e) => handleStatusChange(alert._id, e.target.value)}
                          className={`px-2 py-1 rounded text-sm border ${
                            alert.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' :
                            alert.status === 'resolved' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                            'bg-yellow-100 text-yellow-800 border-yellow-300'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="resolved">Resolved</option>
                          <option value="investigating">Investigating</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {alert.createdBy?.name || alert.createdByPolice?.name || 'Anonymous'}
                      </td>
                      <td className="py-3 px-4">{new Date(alert.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigate(`/admin/alerts/${alert._id}`)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          View
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(alert._id, alert.title)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
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
    </AdminLayout>
  );
};

export default AdminAlertsPage;
