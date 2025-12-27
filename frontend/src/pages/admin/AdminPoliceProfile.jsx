import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import adminApi from '../../services/adminApiService';

const AdminPoliceProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [police, setPolice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [policeAlerts, setPoliceAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'alerts'

  useEffect(() => {
    fetchPolice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (activeTab === 'alerts' && police) {
      fetchPoliceAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, police]);

  const fetchPolice = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get(`/api/admin/police/${id}`);
      if (response.data.success) {
        setPolice(response.data.data);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch police data'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPoliceAlerts = async () => {
    setAlertsLoading(true);
    try {
      const response = await adminApi.get(`/api/admin/police/${id}/alerts`);
      if (response.data.success) {
        setPoliceAlerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching police alerts:', error);
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleDeletePolice = async () => {
    if (!window.confirm(`Are you sure you want to delete police officer ${police?.name}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminApi.delete(`/api/admin/police/${id}`);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Police officer deleted successfully!' });
        setTimeout(() => {
          navigate('/admin/police');
        }, 1500);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete police officer'
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading police profile...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!police) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Police officer not found</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => navigate('/admin/police')}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
            >
              ← Back to Police
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Police Officer Profile</h1>
          </div>
          <button
            onClick={handleDeletePolice}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
          >
            Delete Police Officer
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'alerts'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
            >
              Officer's Alerts ({policeAlerts.length})
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <div className="flex gap-6">
            {/* Left Sidebar - Profile Information */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-6">
                  <img
                    src={police.profilePicture?.url || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mb-4"
                  />
                  <h2 className="text-xl font-semibold text-gray-800">{police.name}</h2>
                  <p className="text-gray-600 text-sm">{police.email}</p>
                </div>

                {/* Profile Information */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Police ID</label>
                    <p className="mt-1 text-gray-900">{police.policeId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Badge Number</label>
                    <p className="mt-1 text-gray-900">{police.badgeNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rank</label>
                    <p className="mt-1 text-gray-900">{police.rank || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1 text-gray-900">{police.department || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Station</label>
                    <p className="mt-1 text-gray-900">{police.station || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <p className="mt-1 text-gray-900">{police.district || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-gray-900">{police.phoneNumber || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-gray-900">
                      {police.dateOfBirth ? new Date(police.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                    <p className="mt-1 text-gray-900">
                      {police.joiningDate ? new Date(police.joiningDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Created</label>
                    <p className="mt-1 text-gray-900 text-sm">
                      {new Date(police.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Police Officer Profile</h2>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{police.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{police.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Police ID</label>
                    <p className="mt-1 text-gray-900">{police.policeId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Badge Number</label>
                    <p className="mt-1 text-gray-900">{police.badgeNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rank</label>
                    <p className="mt-1 text-gray-900">{police.rank || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="mt-1 text-gray-900">{police.department || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Station</label>
                    <p className="mt-1 text-gray-900">{police.station || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <p className="mt-1 text-gray-900">{police.district || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-gray-900">{police.phoneNumber || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-gray-900">
                      {police.dateOfBirth ? new Date(police.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                    <p className="mt-1 text-gray-900">
                      {police.joiningDate ? new Date(police.joiningDate).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Officer's Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            {alertsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading officer's alerts...</div>
              </div>
            ) : policeAlerts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No alerts</h2>
                <p className="text-gray-600">This police officer hasn't created any alerts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {policeAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    onClick={() => navigate(`/admin/alerts/${alert._id}`)}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">{alert.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              alert.status === 'active' ? 'bg-green-100 text-green-800' :
                              alert.status === 'resolved' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {alert.location}{alert.district && alert.upazila && ` • ${alert.upazila}, ${alert.district}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(alert.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                          View Details
                        </button>
                      </div>
                      {alert.media && alert.media.length > 0 && (
                        <div className="mt-4 flex gap-2">
                          {alert.media.slice(0, 4).map((item, index) => (
                            <div key={index} className="w-24 h-24 rounded overflow-hidden">
                              {item.media_type === 'image' ? (
                                <img src={item.media_url} alt="Alert media" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                          {alert.media.length > 4 && (
                            <div className="w-24 h-24 rounded bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                              +{alert.media.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPoliceProfile;
