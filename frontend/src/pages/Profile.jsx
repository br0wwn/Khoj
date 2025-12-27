import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import alertService from '../services/alertService';
import AlertCard from '../components/AlertCard';
import SettingsModal from '../components/SettingsModal';
import { useUserColors } from '../hooks/useUserColors';
import { ProfileInfoSkeleton, AlertCardSkeleton } from '../components/SkeletonLoader';

const Profile = () => {
  const { user, userType, setUser } = useAuth();
  const colors = useUserColors();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [myAlerts, setMyAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'alerts'
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [inAppNotifications, setInAppNotifications] = useState(user?.inAppNotifications ?? true);

  // Date dropdowns for Date of Birth
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  // Date dropdowns for Joining Date (police)
  const [joiningDay, setJoiningDay] = useState('');
  const [joiningMonth, setJoiningMonth] = useState('');
  const [joiningYear, setJoiningYear] = useState('');

  // Generate date options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1924 + 1 }, (_, i) => currentYear - 13 - i);
  const joiningYears = Array.from({ length: 50 }, (_, i) => currentYear - i);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    // Police-specific fields
    rank: user?.rank || '',
    department: user?.department || '',
    station: user?.station || '',
    district: user?.district || '',
    phoneNumber: user?.phoneNumber || '',
    joiningDate: user?.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profilePicture?.url || null);

  // Sync imagePreview with user.profilePicture when user data updates
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(user?.profilePicture?.url || null);
    }
    setEmailNotifications(user?.emailNotifications ?? true);
    setInAppNotifications(user?.inAppNotifications ?? true);
  }, [user?.profilePicture?.url, selectedImage, user?.emailNotifications, user?.inAppNotifications]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle Date of Birth dropdown changes
  const handleDobChange = (field, value) => {
    let newDay = dobDay;
    let newMonth = dobMonth;
    let newYear = dobYear;

    if (field === 'day') {
      newDay = value;
      setDobDay(value);
    } else if (field === 'month') {
      newMonth = value;
      setDobMonth(value);
    } else if (field === 'year') {
      newYear = value;
      setDobYear(value);
    }

    if (newDay && newMonth && newYear) {
      const dateString = `${newYear}-${newMonth}-${newDay}`;
      setFormData({
        ...formData,
        dateOfBirth: dateString
      });
    }
  };

  // Handle Joining Date dropdown changes
  const handleJoiningDateChange = (field, value) => {
    let newDay = joiningDay;
    let newMonth = joiningMonth;
    let newYear = joiningYear;

    if (field === 'day') {
      newDay = value;
      setJoiningDay(value);
    } else if (field === 'month') {
      newMonth = value;
      setJoiningMonth(value);
    } else if (field === 'year') {
      newYear = value;
      setJoiningYear(value);
    }

    if (newDay && newMonth && newYear) {
      const dateString = `${newYear}-${newMonth}-${newDay}`;
      setFormData({
        ...formData,
        joiningDate: dateString
      });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = userType === 'police'
        ? '/api/profile/police/update'
        : '/api/profile/update';

      const response = await axios.put(endpoint, formData, {
        withCredentials: true
      });

      if (response.data.success) {
        // Update user with correct key (police or user)
        const updatedUser = userType === 'police' ? response.data.police : response.data.user;
        setUser(updatedUser);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      const endpoint = userType === 'police'
        ? '/api/profile/police/change-password'
        : '/api/profile/change-password';

      const response = await axios.put(endpoint, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPicture = async () => {
    if (!selectedImage) {
      setMessage({ type: 'error', text: 'Please select an image' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const formDataImage = new FormData();
    formDataImage.append('profilePicture', selectedImage);

    try {
      const endpoint = userType === 'police'
        ? '/api/profile/police/upload-picture'
        : '/api/profile/upload-picture';

      const response = await axios.post(endpoint, formDataImage, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (response.data.success) {
        setUser({ ...user, profilePicture: response.data.profilePicture });
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        setSelectedImage(null);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload picture'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = userType === 'police'
        ? '/api/profile/police/delete-picture'
        : '/api/profile/delete-picture';

      const response = await axios.delete(endpoint, {
        withCredentials: true
      });

      if (response.data.success) {
        setUser({ ...user, profilePicture: { url: null, publicId: null } });
        setImagePreview(null);
        setMessage({ type: 'success', text: 'Profile picture deleted successfully!' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete picture'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmailNotifications = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = userType === 'police'
        ? '/api/profile/police/email-notifications'
        : '/api/profile/email-notifications';

      const response = await axios.put(endpoint,
        { emailNotifications: !emailNotifications },
        { withCredentials: true }
      );

      if (response.data.success) {
        setEmailNotifications(!emailNotifications);
        setUser({ ...user, emailNotifications: !emailNotifications });
        setMessage({
          type: 'success',
          text: `Email notifications ${!emailNotifications ? 'enabled' : 'disabled'} successfully!`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update email notification settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInAppNotifications = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = userType === 'police'
        ? '/api/profile/police/inapp-notifications'
        : '/api/profile/inapp-notifications';

      const response = await axios.put(endpoint,
        { inAppNotifications: !inAppNotifications },
        { withCredentials: true }
      );

      if (response.data.success) {
        setInAppNotifications(!inAppNotifications);
        setUser({ ...user, inAppNotifications: !inAppNotifications });
        setMessage({
          type: 'success',
          text: `In-app notifications ${!inAppNotifications ? 'enabled' : 'disabled'} successfully!`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update in-app notification settings'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's alerts
  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchMyAlerts();
    }
  }, [activeTab]);

  const fetchMyAlerts = async () => {
    setAlertsLoading(true);
    try {
      const response = await alertService.getMyAlerts();
      if (response.success) {
        setMyAlerts(response.data);
      }
    } catch (err) {
      console.error('Error fetching my alerts:', err);
    } finally {
      setAlertsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Settings Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">Settings</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'profile'
              ? `${colors.text} ${colors.border}`
              : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'alerts'
              ? `${colors.text} ${colors.border}`
              : 'text-gray-600 border-transparent hover:text-gray-800'
              }`}
          >
            My Alerts ({myAlerts.length})
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
                  src={imagePreview || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>

              {/* Profile Information */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-gray-900">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
                  </p>
                </div>

                {/* Conditional display based on user type */}
                {userType === 'police' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Police ID</label>
                      <p className="mt-1 text-gray-900">{user?.policeId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Badge Number</label>
                      <p className="mt-1 text-gray-900">{user?.badgeNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rank</label>
                      <p className="mt-1 text-gray-900">{user?.rank || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Department</label>
                      <p className="mt-1 text-gray-900">{user?.department || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Station</label>
                      <p className="mt-1 text-gray-900">{user?.station || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">District</label>
                      <p className="mt-1 text-gray-900">{user?.district || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <p className="mt-1 text-gray-900">{user?.phoneNumber || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                      <p className="mt-1 text-gray-900">
                        {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <p className="mt-1 text-gray-900 text-sm">{user?.bio || 'No bio yet'}</p>
                  </div>
                )}
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`w-full px-4 py-2 text-white rounded-md transition-colors ${colors.bg} ${colors.hoverBgLight}`}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {isEditing && (
              <>
                {/* Edit Profile Picture Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Profile Picture</h2>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full"
                      id="profilePicture"
                    />
                    <div className="flex space-x-2">
                      {selectedImage && (
                        <button
                          onClick={handleUploadPicture}
                          disabled={loading}
                          className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${colors.bg} ${colors.hoverBgLight}`}
                        >
                          Upload
                        </button>
                      )}
                      {user?.profilePicture?.url && (
                        <button
                          onClick={handleDeletePicture}
                          disabled={loading}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
                        >
                          Delete Picture
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Profile Information Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile Information</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={dobDay}
                          onChange={(e) => handleDobChange('day', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Day</option>
                          {days.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <select
                          value={dobMonth}
                          onChange={(e) => handleDobChange('month', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Month</option>
                          {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                          ))}
                        </select>
                        <select
                          value={dobYear}
                          onChange={(e) => handleDobChange('year', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Year</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Conditional fields based on user type */}
                    {userType === 'police' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
                          <select
                            name="rank"
                            value={formData.rank}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Rank</option>
                            <option value="Constable">Constable</option>
                            <option value="Assistant Sub-Inspector">Assistant Sub-Inspector</option>
                            <option value="Sub-Inspector">Sub-Inspector</option>
                            <option value="Inspector">Inspector</option>
                            <option value="Deputy Superintendent">Deputy Superintendent</option>
                            <option value="Superintendent">Superintendent</option>
                            <option value="Additional Deputy Inspector General">Additional Deputy Inspector General</option>
                            <option value="Deputy Inspector General">Deputy Inspector General</option>
                            <option value="Inspector General">Inspector General</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
                          <input
                            type="text"
                            name="station"
                            value={formData.station}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={joiningDay}
                              onChange={(e) => handleJoiningDateChange('day', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Day</option>
                              {days.map(day => (
                                <option key={day} value={day}>{day}</option>
                              ))}
                            </select>
                            <select
                              value={joiningMonth}
                              onChange={(e) => handleJoiningDateChange('month', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Month</option>
                              {months.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                              ))}
                            </select>
                            <select
                              value={joiningYear}
                              onChange={(e) => handleJoiningDateChange('year', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Year</option>
                              {joiningYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>

                {/* Change Password Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
                    <button
                      onClick={() => setIsChangingPassword(!isChangingPassword)}
                      className="px-4 py-2 text-blue-600 hover:text-blue-800"
                    >
                      {isChangingPassword ? 'Cancel' : 'Change'}
                    </button>
                  </div>

                  {isChangingPassword && (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}

            {!isEditing && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to your profile!</h2>
                <p className="text-gray-600">Click "Edit Profile" to update your information, or click the Settings button at the top to manage your notification preferences.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Alerts Tab */}
      {activeTab === 'alerts' && (
        <div>
          {alertsLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <AlertCardSkeleton key={i} variant="list" />
              ))}
            </div>
          ) : myAlerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No alerts yet</h2>
              <p className="text-gray-600 mb-4">You haven't created any alerts yet.</p>
              <a
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Alert
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {myAlerts.map((alert) => (
                <AlertCard key={alert._id} alert={alert} variant="list" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        emailNotifications={emailNotifications}
        inAppNotifications={inAppNotifications}
        onToggleEmail={handleToggleEmailNotifications}
        onToggleInApp={handleToggleInAppNotifications}
        loading={loading}
      />
    </div>
  );
};

export default Profile;
