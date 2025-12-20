import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import alertService from '../services/alertService';
import areaData from '../data/area.json';
import { useUserColors } from '../hooks/useUserColors';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map clicks and place marker
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;}

const EditAlertModal = ({ isOpen, onClose, alert, onAlertUpdated }) => {
  const colors = useUserColors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapPosition, setMapPosition] = useState(null); // For map marker
  const [districts] = useState([...areaData].sort((a, b) => a.district.localeCompare(b.district)));
  const [upazilas, setUpazilas] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    district: '',
    upazila: '',
    location: '',
    contact_info: ''
  });

  useEffect(() => {
    if (alert) {
      setFormData({
        title: alert.title || '',
        description: alert.description || '',
        district: alert.district || '',
        upazila: alert.upazila || '',
        location: alert.location || '',
        contact_info: alert.contact_info || ''
      });
      
      // Set map position if geo data exists
      if (alert.geo && alert.geo.latitude && alert.geo.longitude) {
        setMapPosition({
          lat: alert.geo.latitude,
          lng: alert.geo.longitude
        });
      } else {
        setMapPosition(null);
      }
    }
  }, [alert]);

  useEffect(() => {
    // Update upazilas when district changes
    if (formData.district) {
      const selectedDistrict = districts.find(d => d.district === formData.district);
      setUpazilas(selectedDistrict ? [...selectedDistrict.upazilas].sort() : []);
    } else {
      setUpazilas([]);
    }
  }, [formData.district, districts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Reset upazila when district changes
    if (name === 'district') {
      setFormData(prev => ({ ...prev, upazila: '' }));
    }
    
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.district || !formData.upazila || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Prepare form data with geo location if marker is placed
      const updatedData = { ...formData };
      if (mapPosition) {
        updatedData.geo = {
          latitude: mapPosition.lat,
          longitude: mapPosition.lng
        };
      }
      
      const response = await alertService.updateAlertDetails(alert._id, updatedData);
      if (response.success) {
        onAlertUpdated(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update alert');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Edit Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter alert title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the alert in detail"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select District</option>
                  {districts.map((dist) => (
                    <option key={dist.district} value={dist.district}>
                      {dist.district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="upazila" className="block text-sm font-medium text-gray-700 mb-1">
                  Thana/Upazila <span className="text-red-500">*</span>
                </label>
                <select
                  id="upazila"
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.district}
                >
                  <option value="">Select Upazila</option>
                  {upazilas.map((upazila) => (
                    <option key={upazila} value={upazila}>
                      {upazila}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., House 10, Road 5, Block A"
                required
              />
            </div>

            <div>
              <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Information (Optional)
              </label>
              <input
                type="text"
                id="contact_info"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pin Location on Map (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">Click on the map to place a marker</p>
              <div className="h-64 rounded-md overflow-hidden border border-gray-300">
                <MapContainer
                  center={mapPosition || [23.8103, 90.4125]} // Use existing position or Dhaka
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                </MapContainer>
              </div>
              {mapPosition && (
                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                  <span>
                    Latitude: {mapPosition.lat.toFixed(6)}, Longitude: {mapPosition.lng.toFixed(6)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapPosition(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors.bg} ${colors.hoverBgLight}`}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAlertModal;
