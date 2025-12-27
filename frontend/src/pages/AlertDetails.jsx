import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import alertService from '../services/alertService';
import { startConversation } from '../services/chatService';
import EditAlertModal from '../components/EditAlertModal';
import SocialShareButton from '../components/SocialShareButton';
import ReportButton from '../components/ReportButton';
import { AlertDetailsSkeleton, Skeleton } from '../components/SkeletonLoader';
import areaData from '../data/area.json';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});


const AlertDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userType, isAuthenticated } = useAuth();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [logMessage, setLogMessage] = useState('');
  const [addingLog, setAddingLog] = useState(false);
  const [showLogInput, setShowLogInput] = useState(false);
  const [logFiles, setLogFiles] = useState([]);
  const [logTitle, setLogTitle] = useState('');
  const [logLocation, setLogLocation] = useState('');
  const [logDistrict, setLogDistrict] = useState('');
  const [logUpazila, setLogUpazila] = useState('');
  const [districts] = useState([...areaData].sort((a, b) => a.district.localeCompare(b.district)));
  const [availableUpazilas, setAvailableUpazilas] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [nearbyAlerts, setNearbyAlerts] = useState([]);

  useEffect(() => {
    const fetchAlertDetails = async () => {
      try {
        const response = await alertService.getAlertById(id);
        if (response.success) {
          setAlert(response.data);
          // Fetch nearby alerts
          if (response.data.district && response.data.upazila) {
            fetchNearbyAlerts(response.data.district, response.data.upazila, id);
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load alert details');
      } finally {
        setLoading(false);
      }
    };

    fetchAlertDetails();
  }, [id]);

  // Update available upazilas when log district changes
  useEffect(() => {
    if (logDistrict && logDistrict !== '') {
      const district = districts.find(d => d.district === logDistrict);
      setAvailableUpazilas(district ? [...district.upazilas].sort() : []);
    } else {
      setAvailableUpazilas([]);
    }
  }, [logDistrict, districts]);

  const fetchAlertDetails = async () => {
    try {
      const response = await alertService.getAlertById(id);
      if (response.success) {
        setAlert(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load alert details');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyAlerts = async (district, upazila, currentAlertId) => {
    try {
      const response = await alertService.getAllAlerts({ district, upazila, status: 'active' });
      if (response.success) {
        // Filter out current alert and get 5 most recent
        const filtered = response.data
          .filter(a => a._id !== currentAlertId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setNearbyAlerts(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch nearby alerts:', err);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this alert as ${newStatus}?`)) {
      return;
    }

    setUpdating(true);
    try {
      const response = await alertService.updateAlertStatus(id, newStatus);
      if (response.success) {
        setAlert(response.data);
      }
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      return;
    }

    setUpdating(true);
    try {
      const response = await alertService.deleteAlert(id);
      if (response.success) {
        window.alert('Alert deleted successfully');
        navigate('/');
      }
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to delete alert');
      setUpdating(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUploadMedia = async () => {
    if (selectedFiles.length === 0) {
      window.alert('Please select files to upload');
      return;
    }

    setUploadingMedia(true);
    try {
      const response = await alertService.uploadAlertMedia(id, selectedFiles);
      if (response.success) {
        setAlert(response.data);
        setSelectedFiles([]);
        // Reset file input
        const fileInput = document.getElementById('mediaUpload');
        if (fileInput) fileInput.value = '';
        window.alert('Media uploaded successfully');
      }
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (mediaIndex) => {
    if (!window.confirm('Are you sure you want to delete this media?')) {
      return;
    }

    setUpdating(true);
    try {
      const response = await alertService.deleteAlertMedia(id, mediaIndex);
      if (response.success) {
        setAlert(response.data);
        window.alert('Media deleted successfully');
      }
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to delete media');
    } finally {
      setUpdating(false);
    }
  };

  const handleAlertUpdated = (updatedAlert) => {
    setAlert(updatedAlert);
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!logMessage.trim()) {
      window.alert('Please enter a log message');
      return;
    }

    setAddingLog(true);
    try {
      const formData = new FormData();
      formData.append('title', logTitle.trim() || `Log Entry - ${new Date().toLocaleDateString()}`);
      formData.append('description', logMessage.trim());
      formData.append('location', logLocation.trim());
      formData.append('district', logDistrict);
      formData.append('upazila', logUpazila);

      // Add files
      logFiles.forEach(file => {
        formData.append('media', file);
      });

      const response = await alertService.addLog(id, formData);
      if (response.success) {
        // Refresh alert to get updated logs
        await fetchAlertDetails();
        setLogMessage('');
        setLogTitle('');
        setLogLocation('');
        setLogDistrict('');
        setLogUpazila('');
        setLogFiles([]);
        setShowLogInput(false);
      }
    } catch (err) {
      window.alert(err.response?.data?.error || 'Failed to add log');
    } finally {
      setAddingLog(false);
    }
  };

  const handleContactCreator = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // If viewing own alert, redirect to chat list
    if (isOwner) {
      navigate('/chat');
      return;
    }

    // Check if createdBy exists
    if (!alert.createdBy || !alert.createdBy.userId) {
      console.error('Alert does not have creator information');
      return;
    }

    try {
      const creatorId = alert.createdBy.userId._id || alert.createdBy.userId;
      const data = await startConversation(
        alert._id,
        creatorId,
        alert.createdBy.userType
      );
      navigate(`/chat/${data.conversation._id}`, {
        state: {
          conversation: {
            _id: data.conversation._id,
            otherUser: alert.createdBy.userId,
            alert: { title: alert.title, _id: alert._id }
          }
        }
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check ownership - handle both populated and unpopulated userId
  const isOwner = isAuthenticated && alert && user && (
    String(alert.createdBy?.userId) === String(user.id) ||
    String(alert.createdBy?.userId?._id) === String(user.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1800px] mx-auto px-6">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="flex gap-8">
            <div className="w-[400px] flex-shrink-0 space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <Skeleton className="h-6 w-48 mb-5" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <Skeleton className="h-32 w-full mb-3 rounded" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <AlertDetailsSkeleton />
            </div>
            <div className="w-[400px] flex-shrink-0 space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <Skeleton className="h-8 w-40 mb-5" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="pb-4 border-b border-gray-200">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Alert not found'}
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Feed
        </button>
      </div>
    );
  }

  const isPolice = userType === 'police';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1800px] mx-auto px-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/feed')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Feed
        </button>

        <div className="flex gap-8">
          {/* Nearby Alerts - Left Sidebar */}
          <div className="w-[400px] flex-shrink-0 space-y-6">
            {nearbyAlerts.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-5">
                  More Alerts around {alert.upazila}, {alert.district}
                </h2>
                <div className="space-y-4 max-h-[900px] overflow-y-auto">
                  {nearbyAlerts.map((nearbyAlert) => (
                    <div
                      key={nearbyAlert._id}
                      onClick={() => navigate(`/alerts/${nearbyAlert._id}`)}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                    >
                      {nearbyAlert.media && nearbyAlert.media.length > 0 && (
                        <img
                          src={nearbyAlert.media[0].media_url}
                          alt={nearbyAlert.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">{nearbyAlert.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{nearbyAlert.description}</p>
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {nearbyAlert.location}
                        </span>
                        <span>{new Date(nearbyAlert.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alert Details - Center (Bigger) */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#8E1616] to-[#6B0F0F] px-6 py-4 text-white">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold">{alert.title}</h1>
                      {alert.createdBy && (
                        <span className="text-sm text-white/80 ml-2">
                          • posted by{' '}
                          {alert.createdBy.userId ? (
                            <a
                              href={`/view-profile/${alert.createdBy.userType === 'police' ? 'police' : 'user'}/${typeof alert.createdBy.userId === 'object'
                                ? alert.createdBy.userId._id || alert.createdBy.userId.id
                                : alert.createdBy.userId
                                }`}
                              className="text-white hover:underline font-medium"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {alert.createdBy.userType === 'police'
                                ? alert.createdBy.userId?.name || 'Police Officer'
                                : alert.createdBy.userId?.name || 'User'}
                            </a>
                          ) : (
                            <span className="font-medium">
                              {alert.createdBy.userType === 'police' ? 'Police Officer' : 'User'}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 text-white/90">
                      <span className="flex items-center gap-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {alert.location}
                      </span>
                      {alert.district && alert.upazila && (
                        <span className="text-sm ml-6">
                          {alert.upazila}, {alert.district}
                        </span>
                      )}
                      <span className="text-sm ml-6">{formatDate(alert.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {!isOwner && (
                        <ReportButton reportid={alert._id} reportModel="Alert" className="bg-gray-800 hover:bg-gray-900 text-white border border-gray-700" />
                      )}
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border bg-white/20 text-white border-white/40`}>
                        {alert.status}
                      </span>
                    </div>
                    {isAuthenticated && !isOwner && alert.status !== 'resolved' && (
                      <button
                        onClick={handleContactCreator}
                        className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/40"
                        title="Message creator"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    )}
                    <SocialShareButton alertId={id} compact={true} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{alert.description}</p>
                </div>

                {/* Contact Info */}
                {alert.contact_info && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h2>
                    <p className="text-gray-700">{alert.contact_info}</p>
                  </div>
                )}

                {/* Media */}
                {alert.media && alert.media.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Media</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {alert.media.map((item, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 group cursor-pointer shadow-md hover:shadow-lg transition-shadow" onClick={() => {
                          setSelectedMedia(item);
                          setIsMediaModalOpen(true);
                        }}>
                          {item.media_type === 'image' ? (
                            <img
                              src={item.media_url}
                              alt={`Alert media ${index + 1}`}
                              className="w-full h-96 object-cover hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <div className="relative">
                              <video
                                src={item.media_url}
                                className="w-full h-96 object-cover bg-black"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          )}
                          {isOwner && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMedia(index);
                              }}
                              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                              title="Delete media"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Map */}
                {alert.geo && alert.geo.latitude && alert.geo.longitude && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">Location on Map</h2>
                    <div className="h-80 rounded-lg overflow-hidden border border-gray-300 relative z-0">
                      <MapContainer
                        center={[alert.geo.latitude, alert.geo.longitude]}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
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

                {/* Owner Actions */}
                {isOwner && (
                  <div className="border-t border-gray-200 pt-6 space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800">Manage Alert</h2>

                    {/* Message Center Button */}
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-2">Messages</h3>
                      <button
                        onClick={handleContactCreator}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        View Messages
                      </button>
                    </div>

                    {/* Edit Alert Details */}
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-2">Alert Details</h3>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Edit Alert
                      </button>
                    </div>

                    {/* Upload Media */}
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-2">Upload Media</h3>
                      <div className="flex flex-col sm:flex-row gap-3 items-start">
                        <input
                          id="mediaUpload"
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          onChange={handleFileSelect}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <button
                          onClick={handleUploadMedia}
                          disabled={!selectedFiles || selectedFiles.length === 0 || uploadingMedia}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {uploadingMedia ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                      {selectedFiles && selectedFiles.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                          {selectedFiles.length} file(s) selected
                        </p>
                      )}
                    </div>

                    {/* Status Management */}
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-2">Alert Status</h3>
                      <div className="flex flex-wrap gap-3">
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate('resolved')}
                              disabled={updating}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                            >
                              Mark as Resolved
                            </button>
                            <button
                              onClick={() => handleStatusUpdate('archived')}
                              disabled={updating}
                              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                            >
                              Archive
                            </button>
                          </>
                        )}
                        {alert.status === 'resolved' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate('active')}
                              disabled={updating}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
                            >
                              Reopen
                            </button>
                            <button
                              onClick={() => handleStatusUpdate('archived')}
                              disabled={updating}
                              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                            >
                              Archive
                            </button>
                          </>
                        )}
                        {alert.status === 'archived' && (
                          <button
                            onClick={() => handleStatusUpdate('active')}
                            disabled={updating}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Delete Alert */}
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-md font-medium text-gray-700 mb-2">Danger Zone</h3>
                      <button
                        onClick={handleDelete}
                        disabled={updating}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
                      >
                        Delete Alert
                      </button>
                    </div>
                  </div>
                )}
              </div>


            </div>
          </div>

          {/* Logs Sidebar - Right */}
          <div className="w-[400px] flex-shrink-0 space-y-6">
            {/* Police Log */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold text-gray-800">Police Log</h2>
                {isPolice && !showLogInput && (
                  <button
                    onClick={() => setShowLogInput(true)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Log
                  </button>
                )}
              </div>

              {/* Log Input - Police Only */}
              {isPolice && showLogInput && (
                <form onSubmit={handleAddLog} className="mb-4 space-y-2">
                  <input
                    type="text"
                    value={logTitle}
                    onChange={(e) => setLogTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={addingLog}
                  />
                  <textarea
                    value={logMessage}
                    onChange={(e) => setLogMessage(e.target.value)}
                    placeholder="Description*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    rows="3"
                    disabled={addingLog}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={logLocation}
                    onChange={(e) => setLogLocation(e.target.value)}
                    placeholder={`Location (default: ${alert.location})`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={addingLog}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={logDistrict}
                      onChange={(e) => {
                        setLogDistrict(e.target.value);
                        setLogUpazila('');
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={addingLog}
                    >
                      <option value="">Select District (default: {alert.district})</option>
                      {districts.map((d) => (
                        <option key={d.district} value={d.district}>
                          {d.district}
                        </option>
                      ))}
                    </select>
                    <select
                      value={logUpazila}
                      onChange={(e) => setLogUpazila(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={addingLog || !logDistrict}
                    >
                      <option value="">Select Upazila (default: {alert.upazila})</option>
                      {availableUpazilas.map((upazila) => (
                        <option key={upazila} value={upazila}>
                          {upazila}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => setLogFiles(Array.from(e.target.files))}
                      disabled={addingLog}
                      className="w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {logFiles.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">{logFiles.length} file(s) selected</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={addingLog || !logMessage.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      {addingLog ? 'Posting...' : 'Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLogInput(false);
                        setLogMessage('');
                        setLogTitle('');
                        setLogLocation('');
                        setLogDistrict('');
                        setLogUpazila('');
                        setLogFiles([]);
                      }}
                      disabled={addingLog}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:bg-gray-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Logs List */}
              <div className="space-y-4 max-h-[900px] overflow-y-auto">
                {alert?.logs && alert.logs.length > 0 ? (
                  [...alert.logs].reverse().map((log, index) => (
                    <div key={index} className="pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-base text-gray-800 whitespace-nowrap">
                          [{log.createdBy?.policeName || 'Police'}]:
                        </span>
                        <div className="flex-1">
                          <p className="text-base font-medium text-gray-800">{log.title}</p>
                          <p className="text-base text-gray-700 mt-1">{log.description}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            📍 {log.location}, {log.upazila}, {log.district}
                          </p>
                          {log.media && log.media.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {log.media.map((item, idx) => (
                                <img key={idx} src={item.media_url} alt="Log media" className="w-full h-16 object-cover rounded" />
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
                  <p className="text-sm text-gray-500 text-center py-8">Empty</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Media Modal */}
        {isMediaModalOpen && selectedMedia && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4"
            onClick={() => setIsMediaModalOpen(false)}
          >
            <div className="relative max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {selectedMedia.media_type === 'image' ? (
                <img
                  src={selectedMedia.media_url}
                  alt="Alert media"
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedMedia.media_url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        )}

        {/* Edit Alert Modal */}
        {isEditModalOpen && (
          <EditAlertModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            alert={alert}
            onAlertUpdated={handleAlertUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default AlertDetails;
