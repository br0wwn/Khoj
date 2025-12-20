import React, { useState } from 'react';
import socialShareService from '../services/socialShareService';

const SocialShareButton = ({ alertId, compact = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [sharing, setSharing] = useState(false);

  const shareOptions = [
    { platform: 'facebook', label: 'Facebook', icon: '📘', color: 'bg-blue-600 hover:bg-blue-700' },
    { platform: 'twitter', label: 'Twitter', icon: '🐦', color: 'bg-sky-500 hover:bg-sky-600' },
    { platform: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'bg-green-500 hover:bg-green-600' },
    { platform: 'telegram', label: 'Telegram', icon: '✈️', color: 'bg-blue-500 hover:bg-blue-600' },
    { platform: 'email', label: 'Email', icon: '📧', color: 'bg-gray-600 hover:bg-gray-700' },
    { platform: 'copy_link', label: 'Copy Link', icon: '🔗', color: 'bg-gray-700 hover:bg-gray-800' }
  ];

  const handleShare = async (platform) => {
    try {
      setSharing(true);
      
      if (platform === 'copy_link') {
        await socialShareService.copyLink(alertId);
        alert('Link copied to clipboard!');
      } else {
        await socialShareService.shareToSocial(alertId, platform);
      }
      
      setShareCount(prev => prev + 1);
      setShowMenu(false);
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  if (compact) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={sharing}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
        >
          <span>🔗</span>
          <span>Share</span>
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
            {shareOptions.map((option) => (
              <button
                key={option.platform}
                onClick={() => handleShare(option.platform)}
                disabled={sharing}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50 first:rounded-t-lg last:rounded-b-lg"
              >
                <span className="text-xl">{option.icon}</span>
                <span className="text-gray-700 text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Share this Alert</h3>
      <p className="text-sm text-gray-600">Help spread awareness by sharing this alert on social media</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {shareOptions.map((option) => (
          <button
            key={option.platform}
            onClick={() => handleShare(option.platform)}
            disabled={sharing}
            className={`flex flex-col items-center gap-2 p-4 ${option.color} text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm`}
          >
            <span className="text-3xl">{option.icon}</span>
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
      
      {shareCount > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 text-center">
            Thank you for sharing! You've helped spread awareness.
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialShareButton;
