import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserColors } from '../hooks/useUserColors';
import EditReportModal from './EditReportModal';

const ReportDetailModal = ({ report, isOpen, onClose, onReportUpdated, onReportDeleted }) => {
  const { user } = useAuth();
  const colors = useUserColors();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isOpen || !report) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = () => {
    if (!user || !report.createdBy) return false;
    
    if (report.createdBy.userId) {
      return report.createdBy.userId._id === user._id || report.createdBy.userId === user._id;
    }
    
    return false;
  };

  const handleEditComplete = (updatedReport) => {
    setIsEditModalOpen(false);
    if (onReportUpdated) {
      onReportUpdated(updatedReport);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Report Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title and Badges */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-800">{report.title}</h3>
                {!report.createdBy && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Anonymous
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Posted on {formatDate(report.createdAt)}
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
            </div>

            {/* Location Information */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Location</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">District</p>
                    <p className="text-gray-800 font-medium">{report.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Upazila / Thana</p>
                    <p className="text-gray-800 font-medium">{report.upazila}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Specific Location</p>
                    <p className="text-gray-800 font-medium">{report.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Gallery */}
            {report.media && report.media.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Media</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {report.media.map((item, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
                      {item.media_type === 'image' ? (
                        <img 
                          src={item.media_url} 
                          alt={`Report media ${index + 1}`}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(item.media_url, '_blank')}
                        />
                      ) : (
                        <video 
                          src={item.media_url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info (only if not anonymous) */}
            {report.createdBy && report.createdBy.userId && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Reported By</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {user ? (
                    <a
                      href={`/profile/${report.createdBy.userId._id || report.createdBy.userId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.text} font-medium hover:underline block`}
                    >
                      {report.createdBy.userId?.name || 'Unknown'}
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        if (window.confirm('You need to sign in to view profiles. Would you like to sign in now?')) {
                          window.location.href = '/login';
                        }
                      }}
                      className={`${colors.text} font-medium hover:underline text-left`}
                    >
                      {report.createdBy.userId?.name || 'Unknown'}
                    </button>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {report.createdBy.userId?.email || ''}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isOwner() && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className={`flex-1 px-6 py-3 ${colors.bg} text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Report
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this report?')) {
                      onReportDeleted(report._id);
                      onClose();
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Report Modal */}
      {isEditModalOpen && (
        <EditReportModal
          report={report}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onReportUpdated={handleEditComplete}
        />
      )}
    </>
  );
};

export default ReportDetailModal;
