import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAdminAuth } from '../../context/AdminAuthContext';
import adminApi from '../../services/adminApiService';

const AdminSettingsPage = () => {
  const { admin } = useAdminAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (admin?.emailNotifications !== undefined) {
      setEmailNotifications(admin.emailNotifications);
    }
  }, [admin]);

  const handleToggleNotifications = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const newValue = !emailNotifications;
      const response = await adminApi.put('/api/admin/settings', {
        emailNotifications: newValue
      });

      if (response.data.success) {
        setEmailNotifications(newValue);
        setMessage({ 
          type: 'success', 
          text: `Email notifications ${newValue ? 'enabled' : 'disabled'} successfully` 
        });
        
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update settings'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your admin account settings</p>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                defaultValue={admin?.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                defaultValue={admin?.email}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                defaultValue={admin?.phoneNumber}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              />
            </div>

            <button className="w-full bg-[#8E1616] text-white py-2 rounded-lg hover:bg-[#6E0E0E] transition-colors">
              Update Profile
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Change Password</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
              />
            </div>

            <button className="w-full bg-[#8E1616] text-white py-2 rounded-lg hover:bg-[#6E0E0E] transition-colors">
              Change Password
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">System Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">Email Notifications</span>
                <p className="text-sm text-gray-500">Receive email alerts for new reports to admin</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={emailNotifications}
                  onChange={handleToggleNotifications}
                  disabled={loading}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8E1616]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8E1616] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-700">Auto-refresh Dashboard</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8E1616]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8E1616]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Account Created:</span>
              <span className="font-medium">
                {admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Referred By:</span>
              <span className="font-medium">{admin?.referredBy || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Type:</span>
              <span className="font-medium text-[#8E1616]">Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
