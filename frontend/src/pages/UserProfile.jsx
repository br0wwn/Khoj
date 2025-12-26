import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReportButton from '../components/ReportButton';

const UserProfile = () => {
  const { id, type } = useParams(); // type is 'user' or 'police'
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        
        const endpoint = type === 'police' 
          ? `/api/profile/police/${id}`
          : `/api/profile/user/${id}`;
        
        const response = await axios.get(endpoint, {
          withCredentials: true
        });

        if (response.data.success) {
          setProfile(type === 'police' ? response.data.police : response.data.user);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is logged in
    if (currentUser) {
      fetchProfile();
    } else {
      setError('Please login to view profiles');
      setLoading(false);
    }
  }, [id, type, currentUser]);

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if viewing own profile
  const isOwnProfile = currentUser && profile && (
    currentUser._id === profile.id || currentUser.id === profile.id
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Profile not found'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img
                src={profile.profilePicture?.url || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                <p className="text-blue-100">
                  {type === 'police' ? '👮 Police Officer' : '👤 Citizen'}
                </p>
                {type === 'police' && profile.badgeNumber && (
                  <p className="text-blue-100 text-sm mt-1">
                    Badge: {profile.badgeNumber}
                  </p>
                )}
              </div>
            </div>
            {!isOwnProfile && (
              <ReportButton 
                reportid={profile.id} 
                reportModel={type === 'police' ? 'Police' : 'User'}
                className="bg-white/20 hover:bg-white/30"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bio Section */}
          {type === 'user' && profile.bio && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Bio</h2>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-gray-800 font-medium">{profile.email}</p>
              </div>
              
              {type === 'user' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                  <p className="text-gray-800 font-medium">{formatDate(profile.dateOfBirth)}</p>
                </div>
              )}

              {type === 'police' && (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Rank</p>
                    <p className="text-gray-800 font-medium">{profile.rank || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="text-gray-800 font-medium">{profile.department || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Station</p>
                    <p className="text-gray-800 font-medium">{profile.station || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">District</p>
                    <p className="text-gray-800 font-medium">{profile.district || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="text-gray-800 font-medium">{profile.phoneNumber || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Joining Date</p>
                    <p className="text-gray-800 font-medium">{formatDate(profile.joiningDate)}</p>
                  </div>
                </>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Member Since</p>
                <p className="text-gray-800 font-medium">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
