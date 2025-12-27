import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import alertService from '../services/alertService';
import reportService from '../services/reportService';
import reportToAdminService from '../services/reportToAdminService';
import AlertCard from '../components/AlertCard';
import ReportCard from '../components/ReportCard';

const ViewProfile = () => {
  const { id, type } = useParams(); // type is 'user' or 'police'
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Content data
  const [alerts, setAlerts] = useState([]);
  const [reports, setReports] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  
  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

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

    if (currentUser) {
      fetchProfile();
    } else {
      setError('Please login to view profiles');
      setLoading(false);
    }
  }, [id, type, currentUser]);

  // Fetch user's alerts when alerts tab is active
  useEffect(() => {
    if (activeTab === 'alerts' && profile) {
      fetchUserAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, profile]);

  // Fetch user's reports when reports tab is active
  useEffect(() => {
    if (activeTab === 'reports' && profile) {
      fetchUserReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, profile]);

  const fetchUserAlerts = async () => {
    setAlertsLoading(true);
    try {
      const response = await alertService.getAllAlerts();
      if (response.success) {
        // Filter alerts created by this user
        const userAlerts = response.data.filter(alert => {
          const creatorId = alert.createdBy?.userId?._id || alert.createdBy?.userId;
          return String(creatorId) === String(profile._id || profile.id);
        });
        setAlerts(userAlerts);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching user alerts:', err);
      }
    } finally {
      setAlertsLoading(false);
    }
  };

  const fetchUserReports = async () => {
    setReportsLoading(true);
    try {
      const response = await reportService.getAllReports();
      if (response.success) {
        // Filter reports created by this user
        const userReports = response.data.filter(report => {
          const creatorId = report.userId?._id || report.userId;
          return String(creatorId) === String(profile._id || profile.id);
        });
        setReports(userReports);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching user reports:', err);
      }
    } finally {
      setReportsLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Navigate to chat with this user
    navigate('/chat', { 
      state: { 
        recipientId: profile._id || profile.id,
        recipientName: profile.name,
        recipientType: type
      } 
    });
  };

  const handleReportUser = () => {
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportReason || !reportDescription.trim()) {
      alert('Please provide both reason and description');
      return;
    }

    setReportSubmitting(true);
    try {
      await reportToAdminService.createReport({
        reportid: profile._id || profile.id,
        reportModel: type === 'police' ? 'Police' : 'User',
        category: reportReason,
        details: reportDescription
      });
      
      alert('Report submitted successfully. Our admin team will review it.');
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    } catch (err) {
      alert(err.error || 'Failed to submit report. Please try again.');
    } finally {
      setReportSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOwnProfile = currentUser && profile && (
    String(currentUser._id || currentUser.id) === String(profile._id || profile.id)
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
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

  if (isOwnProfile) {
    navigate('/profile');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSendMessage}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>
              <button
                onClick={handleReportUser}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 bg-white rounded-t-lg px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'alerts'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'reports'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Reports ({reports.length})
          </button>
        </div>
      </div>

      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {type === 'user' && profile.bio && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Bio</h2>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {alertsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading alerts...</div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No alerts yet</h3>
              <p className="text-gray-600">This user hasn't posted any alerts.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <AlertCard key={alert._id} alert={alert} variant="list" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-b-lg shadow-lg p-6">
          {reportsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading reports...</div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No reports yet</h3>
              <p className="text-gray-600">This user hasn't posted any reports.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report User Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Report User</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Report *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a reason</option>
                  <option value="spam">Spam or misleading content</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="impersonation">Impersonation</option>
                  <option value="false_information">False information</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  required
                  rows="4"
                  placeholder="Please provide details about why you're reporting this user..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                >
                  {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProfile;
