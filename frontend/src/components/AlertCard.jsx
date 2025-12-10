import React from 'react';
import { Link } from 'react-router-dom';

const AlertCard = ({ alert, variant = 'grid' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
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

  if (variant === 'list') {
    // List view for profile page (1 per row)
    return (
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
                  {alert.location}
                </span>
                <span>{formatDate(alert.createdAt)}</span>
              </div>
            </div>
            <span className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium inline-block">
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
    );
  }

  // Grid view for feed page (2 columns)
  return (
    <Link to={`/alerts/${alert._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {alert.media && alert.media.length > 0 && (
          <div className="h-48 bg-gray-200 relative">
            {alert.media[0].media_type === 'image' ? (
              <img 
                src={alert.media[0].media_url} 
                alt={alert.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
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
          </div>
        )}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 flex-1">{alert.title}</h3>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
              {alert.status}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{alert.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{alert.location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{formatDate(alert.createdAt)}</span>
            <span className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium inline-block">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AlertCard;
