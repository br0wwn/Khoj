import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import adminApi from '../../services/adminApiService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const AdminViewAlertPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        setLoading(true);
        const response = await adminApi.get(`/api/alerts/${id}`);
        setAlert(response.data.data);
      } catch (error) {
        console.error('Error fetching alert:', error);
        alert('Failed to load alert');
        navigate('/admin/alerts');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAlert();
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete alert "${alert.title}"? This action cannot be undone!`)) {
      return;
    }

    try {
      await adminApi.delete(`/api/admin/alerts/${id}`);
      alert('Alert deleted successfully');
      navigate('/admin/alerts');
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert(error.response?.data?.message || 'Failed to delete alert');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await adminApi.put(`/api/alerts/${id}`, { status: newStatus });
      alert('Alert status updated successfully');
      setAlert({ ...alert, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 text-lg">Loading alert details...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!alert) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 text-lg">Alert not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/alerts')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <span className="mr-2">←</span> Back to Alerts
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{alert.title}</h1>
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                {alert.type}
              </span>
              <select
                value={alert.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`px-3 py-1 rounded text-sm font-medium border cursor-pointer ${
                  alert.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' :
                  alert.status === 'resolved' ? 'bg-gray-100 text-gray-800 border-gray-300' :
                  'bg-yellow-100 text-yellow-800 border-yellow-300'
                }`}
              >
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="investigating">Investigating</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 text-gray-600 text-sm">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {alert.location}
              </span>
              {alert.district && alert.upazila && (
                <span className="ml-5">{alert.upazila}, {alert.district}</span>
              )}
              <span className="ml-5">
                {new Date(alert.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Alert
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content - Left */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{alert.description || 'No description provided'}</p>
            </div>

            {/* Contact Info */}
            {alert.contact_info && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact Information</h2>
                <p className="text-gray-700">{alert.contact_info}</p>
              </div>
            )}

            {/* Location Map */}
            {alert.geo && alert.geo.latitude && alert.geo.longitude && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Location on Map</h2>
                <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={[alert.geo.latitude, alert.geo.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[alert.geo.latitude, alert.geo.longitude]}>
                      <Popup>
                        <div className="text-sm">
                          <strong>{alert.title}</strong><br />
                          {alert.location}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Coordinates: {alert.geo.latitude.toFixed(6)}, {alert.geo.longitude.toFixed(6)}
                </div>
              </div>
            )}

            {/* Media */}
            {alert.media && alert.media.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Media ({alert.media.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {alert.media.map((item, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
                      {item.media_type === 'image' ? (
                        <img
                          src={item.media_url}
                          alt={`Alert media ${index + 1}`}
                          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(item.media_url, '_blank')}
                        />
                      ) : (
                        <video
                          src={item.media_url}
                          controls
                          className="w-full h-48 object-cover bg-black"
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Right */}
        <div className="w-80 flex-shrink-0 space-y-4">
          {/* Creator Info */}
          {alert.createdBy && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Posted By</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.createdBy.userType === 'police' 
                      ? alert.createdBy.userId?.name || 'Police Officer'
                      : alert.createdBy.userId?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {alert.createdBy.userType === 'police' ? 'Police' : 'Citizen'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Police Log */}
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Police Log</h2>
            
            {/* Logs List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alert?.logs && alert.logs.length > 0 ? (
                [...alert.logs].reverse().map((log, index) => (
                  <div key={index} className="pb-3 border-b border-gray-200 last:border-0">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-sm text-gray-800 whitespace-nowrap">
                        [{log.createdBy?.policeName || 'Police'}]:
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{log.title}</p>
                        <p className="text-sm text-gray-700 mt-1">{log.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {log.location}, {log.upazila}, {log.district}
                        </p>
                        {log.media && log.media.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {log.media.map((item, idx) => (
                              <img 
                                key={idx} 
                                src={item.media_url} 
                                alt="Log media" 
                                className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-90"
                                onClick={() => window.open(item.media_url, '_blank')}
                              />
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-gray-500 mt-2 block">
                          {new Date(log.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No logs yet</p>
              )}
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium text-gray-800">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-800">
                  {new Date(alert.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Alert ID</p>
                <p className="font-mono text-xs text-gray-600 break-all">{alert._id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminViewAlertPage;
