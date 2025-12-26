import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import alertService from '../../services/alertService';
import AlertCard from '../../components/AlertCard';
import axios from 'axios';

// Create adminApi instance
const adminApi = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true
});

// Add request interceptor to include JWT token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const AdminUserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userAlerts, setUserAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'alerts'

  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'alerts' && user) {
      fetchUserAlerts();
    }
  }, [activeTab, user]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get(`/api/admin/users/${id}`);
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch user data'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAlerts = async () => {
    setAlertsLoading(true);
    try {
      const response = await adminApi.get(`/api/admin/users/${id}/alerts`);
      if (response.data.success) {
        setUserAlerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user alerts:', error);
    } finally {
      setAlertsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to delete user ${user?.name}? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await adminApi.delete(`/api/admin/users/${id}`);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        setTimeout(() => {
          navigate('/admin/users');
        }, 1500);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete user'
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading user profile...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">User not found</div>
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
              onClick={() => navigate('/admin/users')}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
            >
              ← Back to Users
            </button>
            <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
          </div>
          <button
            onClick={handleDeleteUser}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
          >
            Delete User
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
              User's Alerts ({userAlerts.length})
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
                    src={user.profilePicture?.url || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mb-4"
                  />
                  <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>

                {/* Profile Information */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-gray-900">
                      {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <p className="mt-1 text-gray-900 text-sm">{user.bio || 'No bio yet'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Created</label>
                    <p className="mt-1 text-gray-900 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">User Profile</h2>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <p className="mt-1 text-gray-900">{user.bio || 'No bio'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-gray-900">
                      {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User's Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            {alertsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading user's alerts...</div>
              </div>
            ) : userAlerts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">No alerts</h2>
                <p className="text-gray-600">This user hasn't created any alerts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userAlerts.map((alert) => (
                  <AlertCard key={alert._id} alert={alert} variant="list" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserProfile;
