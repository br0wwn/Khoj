import React, { useState, useEffect } from 'react';
import reportService from '../services/reportService';
import areaData from '../data/area.json';
import { useUserColors } from '../hooks/useUserColors';

const EditReportModal = ({ report, isOpen, onClose, onReportUpdated }) => {
  const colors = useUserColors();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [districts] = useState([...areaData].sort((a, b) => a.district.localeCompare(b.district)));
  const [upazilas, setUpazilas] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    district: '',
    upazila: '',
    location: ''
  });

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        description: report.description || '',
        district: report.district || '',
        upazila: report.upazila || '',
        location: report.location || ''
      });
    }
  }, [report]);

  useEffect(() => {
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
    setError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    setError('');
  };

  const handleRemoveNewFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingMedia = async (mediaIndex) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        await reportService.deleteReportMedia(report._id, mediaIndex);
        // Update the local report object
        const updatedReport = {
          ...report,
          media: report.media.filter((_, idx) => idx !== mediaIndex)
        };
        onReportUpdated(updatedReport);
      } catch (err) {
        setError('Failed to delete media');
      }
    }
  };

  const getFilePreview = (file) => {
    return URL.createObjectURL(file);
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
      const reportData = {
        title: formData.title,
        description: formData.description,
        district: formData.district,
        upazila: formData.upazila,
        location: formData.location
      };

      const response = await reportService.updateReport(report._id, reportData);

      if (response.success) {
        // Upload new media if files selected
        if (selectedFiles.length > 0) {
          try {
            await reportService.uploadReportMedia(response.data._id, selectedFiles);
            // Fetch updated report with new media
            const updatedReport = await reportService.getReportById(response.data._id);
            onReportUpdated(updatedReport);
          } catch (uploadError) {
            console.error('Media upload error:', uploadError);
            onReportUpdated(response.data);
          }
        } else {
          onReportUpdated(response.data);
        }

        setSelectedFiles([]);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update report');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Edit Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Enter report title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="Describe the issue in detail"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  required
                >
                  <option value="">Select District</option>
                  {districts.map((district) => (
                    <option key={district.district} value={district.district}>
                      {district.district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thana/Upazila <span className="text-red-500">*</span>
                </label>
                <select
                  name="upazila"
                  value={formData.upazila}
                  onChange={handleChange}
                  disabled={!formData.district}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder="e.g., Street name, landmark"
                required
              />
            </div>

            {/* Existing Media */}
            {report.media && report.media.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Media
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {report.media.map((item, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        {item.media_type === 'image' ? (
                          <img src={item.media_url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <video src={item.media_url} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingMedia(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Media (Optional)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,video/*"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        {file.type.startsWith('image/') ? (
                          <img src={getFilePreview(file)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <video src={getFilePreview(file)} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 ${colors.bg} text-white rounded-lg hover:opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReportModal;
