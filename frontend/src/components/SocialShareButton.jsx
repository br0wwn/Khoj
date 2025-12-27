import React, { useState, useEffect, useRef } from 'react';
import socialShareService from '../services/socialShareService';
import alertService from '../services/alertService';

const SocialShareButton = ({ alertId, compact = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch alert data for rich sharing
  useEffect(() => {
    const fetchAlertData = async () => {
      try {
        const response = await alertService.getAlertById(alertId);
        if (response.success) {
          setAlertData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch alert data:', error);
      }
    };
    
    if (alertId) {
      fetchAlertData();
    }
  }, [alertId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const shareOptions = [
    { platform: 'x', label: 'X (Twitter)', color: 'bg-black hover:bg-gray-800' },
    { platform: 'whatsapp', label: 'WhatsApp', color: 'bg-green-500 hover:bg-green-600' },
    { platform: 'telegram', label: 'Telegram', color: 'bg-blue-500 hover:bg-blue-600' },
    { platform: 'email', label: 'Email', color: 'bg-gray-600 hover:bg-gray-700' },
    { platform: 'copy_link', label: 'Copy Link', color: 'bg-gray-700 hover:bg-gray-800' }
  ];

  const getShareIcon = (platform) => {
    switch (platform) {
      case 'x':
        return (
          <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        );
      case 'whatsapp':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        );
      case 'telegram':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'copy_link':
        return (
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleShare = async (platform) => {
    try {
      setSharing(true);

      // Get current alert URL
      const baseUrl = window.location.origin;
      const alertUrl = `${baseUrl}/alerts/${alertId}`;
      const encodedUrl = encodeURIComponent(alertUrl);
      
      // Use fetched alert data or fallback to document title
      const alertTitle = alertData?.title || document.title || 'Safety Alert';
      const alertLocation = alertData?.location || '';
      const firstMedia = alertData?.media?.[0]?.media_url || '';
      
      // Create rich share text
      let shareText = alertTitle;
      if (alertLocation) {
        shareText += ` - ${alertLocation}`;
      }
      
      const encodedTitle = encodeURIComponent(shareText);
      const encodedMedia = encodeURIComponent(firstMedia);

      if (platform === 'copy_link') {
        // Copy full details to clipboard
        let clipboardText = `${alertTitle}\n`;
        if (alertLocation) {
          clipboardText += `Location: ${alertLocation}\n`;
        }
        if (firstMedia) {
          clipboardText += `Media: ${firstMedia}\n`;
        }
        clipboardText += `Link: ${alertUrl}`;
        
        try {
          await navigator.clipboard.writeText(clipboardText);
          alert('Alert details copied to clipboard!');
          
          // Track the share (non-blocking)
          socialShareService.trackShare(alertId, 'copy_link', alertUrl).catch(err => 
            console.log('Tracking failed:', err)
          );
        } catch (clipboardError) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = clipboardText;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            alert('Alert details copied to clipboard!');
          } catch (err) {
            alert('Failed to copy. Please copy manually: ' + alertUrl);
          }
          document.body.removeChild(textArea);
        }
      } else {
        // Generate platform-specific share URLs
        let shareUrl = '';
        
        switch (platform) {
          case 'x':
          case 'twitter':
            // X/Twitter with rich text
            let tweetText = shareText;
            if (firstMedia) {
              tweetText += ` ${firstMedia}`;
            }
            const encodedTweet = encodeURIComponent(tweetText);
            shareUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}&url=${encodedUrl}`;
            break;
          case 'whatsapp':
            // WhatsApp with full details
            let whatsappText = `*${alertTitle}*`;
            if (alertLocation) {
              whatsappText += `\n📍 ${alertLocation}`;
            }
            if (firstMedia) {
              whatsappText += `\n🖼️ ${firstMedia}`;
            }
            whatsappText += `\n🔗 ${alertUrl}`;
            shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
            break;
          case 'telegram':
            // Telegram with formatted text
            let telegramText = alertTitle;
            if (alertLocation) {
              telegramText += `\n📍 ${alertLocation}`;
            }
            if (firstMedia) {
              telegramText += `\n🖼️ Media: ${firstMedia}`;
            }
            shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(telegramText)}`;
            break;
          case 'email':
            // Email with formatted body
            let emailBody = `${alertTitle}\n\n`;
            if (alertLocation) {
              emailBody += `Location: ${alertLocation}\n`;
            }
            if (firstMedia) {
              emailBody += `Media: ${firstMedia}\n`;
            }
            emailBody += `\nView full alert: ${alertUrl}`;
            shareUrl = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(emailBody)}`;
            break;
          default:
            throw new Error('Unknown platform');
        }

        // Open share URL in new window
        const windowFeatures = platform === 'facebook' 
          ? 'width=600,height=400,scrollbars=yes,resizable=yes'
          : 'noopener,noreferrer';
        const newWindow = window.open(shareUrl, '_blank', windowFeatures);
        
        if (!newWindow) {
          alert('Please allow popups to share this alert');
        } else {
          // Track the share (non-blocking)
          socialShareService.trackShare(alertId, platform, shareUrl).catch(err => 
            console.log('Tracking failed:', err)
          );
        }
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
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={sharing}
          className="flex items-center justify-center p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 backdrop-blur-sm border border-white/40"
          title="Share this alert"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-[9999] border border-gray-200 overflow-hidden">
            {shareOptions.map((option) => (
              <button
                key={option.platform}
                onClick={() => handleShare(option.platform)}
                disabled={sharing}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 text-left border-b border-gray-100 last:border-0"
              >
                {getShareIcon(option.platform)}
                <span className="text-gray-700 text-sm font-medium">{option.label}</span>
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
            <span className="text-white w-8 h-8 flex items-center justify-center">{getShareIcon(option.platform)}</span>
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
