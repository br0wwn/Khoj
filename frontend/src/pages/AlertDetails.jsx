import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import alertService from '../services/alertService';
import EditAlertModal from '../components/EditAlertModal';

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
  const { user, isAuthenticated } = useAuth();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
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

    fetchAlertDetails();
  }, [id]);

  useEffect(() => {
    // Debug ownership check
    if (alert && user) {
      console.log('Ownership check:', {
        alertCreatedBy: alert.createdBy,
        userId: user.id,
        userType: user,
        isOwner: alert.createdBy?.userId === user.id || 
                 alert.createdBy?.userId?._id === user.id ||
                 String(alert.createdBy?.userId) === String(user.id)
      });
    }
  }, [alert, user]);

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
    alert.createdBy?.userId === user.id || 
    alert.createdBy?.userId?._id === user.id ||
    String(alert.createdBy?.userId) === String(user.id)
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading alert details...</div>
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Feed
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{alert.title}</h1>
              <div className="flex flex-col gap-2 text-blue-100">
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
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(alert.status)}`}>
              {alert.status}
            </span>
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

          {/* Location Map */}
          {alert.geo && alert.geo.latitude && alert.geo.longitude && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Location on Map</h2>
              <div className="h-80 rounded-lg overflow-hidden border border-gray-300">
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
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Media</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {alert.media.map((item, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 group">
                    {item.media_type === 'image' ? (
                      <img 
                        src={item.media_url} 
                        alt={`Alert media ${index + 1}`}
                        className="w-full h-48 object-cover"
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
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteMedia(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
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

          {/* Owner Actions */}
          {isOwner && (
            <div className="border-t border-gray-200 pt-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Manage Alert</h2>
              
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
  );
};

export default AlertDetails;
