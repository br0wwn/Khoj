import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserColors } from '../hooks/useUserColors';
import { useAuth } from '../context/AuthContext';
import { startConversation } from '../services/chatService';
import ReportButton from './ReportButton';

const AlertCard = ({ alert, variant = 'grid', showContactButton = false }) => {
  const colors = useUserColors();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return `bg-${colors.accent}/10 text-${colors.accent}`;
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleContactCreator = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Message button clicked');
    console.log('Alert data:', alert);
    console.log('User data:', user);

    if (!user) {
      console.log('No user logged in, redirecting to login');
      navigate('/login');
      return;
    }

    // Check if createdBy exists
    if (!alert.createdBy || !alert.createdBy.userId) {
      console.error('Alert does not have creator information:', alert);
      return;
    }

    // If user clicks message on their own alert, redirect to chat list
    const creatorId = alert.createdBy.userId?._id || alert.createdBy.userId;
    if (String(creatorId) === String(user.id)) {
      console.log('Redirecting to chat list (own alert)');
      navigate('/chat');
      return;
    }

    console.log('Starting conversation...');
    try {
      const data = await startConversation(
        alert._id,
        alert.createdBy.userId,
        alert.createdBy.userType
      );
      console.log('Conversation created:', data);
      navigate(`/chat/${data.conversation._id}`, {
        state: {
          conversation: {
            _id: data.conversation._id,
            otherUser: alert.createdBy,
            alert: { title: alert.title, _id: alert._id }
          }
        }
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  if (variant === 'list') {
    // List view for profile page (1 per row)
    return (
      <div className="relative">
        <Link to={`/alerts/${alert._id}`} className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{alert.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
              <p className="text-gray-600 mb-3 line-clamp-2">{alert.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {alert.location}{alert.district && alert.upazila && ` • ${alert.upazila}, ${alert.district}`}
                </span>
                <span>{formatDate(alert.createdAt)}</span>
              </div>
            </div>
            <span className={`ml-4 px-4 py-2 text-white rounded-md transition-colors text-sm font-medium inline-block ${colors.bg} ${colors.hoverBgLight}`}>
              View Details
            </span>
          </div>
          {alert.media && alert.media.length > 0 && (
            <div className="mt-4 flex gap-2">
              {alert.media.slice(0, 3).map((item, index) => (
                <div key={index} className="w-20 h-20 rounded overflow-hidden">
                  {item.media_type === 'image' ? (
                    <img src={item.media_url} alt="Alert media" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              {alert.media.length > 3 && (
                <div className="w-20 h-20 rounded bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                  +{alert.media.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
      <div className="absolute top-6 right-6">
        <ReportButton reportid={alert._id} reportModel="Alert" />
      </div>
    </div>
    );
  }

  // Grid view for feed page (2 columns)
  return (
    <div className="relative h-full">
      <Link to={`/alerts/${alert._id}`} className="block h-full">
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {/* Media Section - Always present with fixed height */}
        <div className="h-48 bg-gray-200 relative flex-shrink-0">
          {alert.media && alert.media.length > 0 ? (
            <>
              {alert.media[0].media_type === 'image' ? (
                <img
                  src={alert.media[0].media_url}
                  alt={alert.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                </div>
              )}
              {alert.media.length > 1 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                  +{alert.media.length - 1}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          )}
        </div>

        {/* Content Section - Grows to fill remaining space */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 flex-1">{alert.title}</h3>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(alert.status)}`}>
              {alert.status}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{alert.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{alert.location}{alert.district && alert.upazila && ` • ${alert.upazila}, ${alert.district}`}</span>
          </div>

          {/* Footer - Pinned to bottom */}
          <div className="flex justify-between items-center mt-auto pt-2">
            <span className="text-xs text-gray-500">{formatDate(alert.createdAt)}</span>
            <div className="flex gap-2">
              {showContactButton && user && (
                <button
                  onClick={alert.status === 'resolved' ? null : handleContactCreator}
                  disabled={alert.status === 'resolved'}
                  className={`px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${alert.status === 'resolved'
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  title={alert.status === 'resolved' ? 'This alert has been resolved' : 'Send a message'}
                >
                  Message
                </button>
              )}
              <span className={`px-3 py-1.5 text-white rounded-md transition-colors text-sm font-medium inline-block ${colors.bg} ${colors.hoverBgLight}`}>
                View Details
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
    <div className="absolute top-2 right-2 z-10">
      <ReportButton reportid={alert._id} reportModel="Alert" />
    </div>
  </div>
  );
};

export default AlertCard;
