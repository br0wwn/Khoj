import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/chatService';
import { getUnreadCount as getNotificationUnreadCount } from '../services/notificationService';
import { useSocket } from '../context/SocketContext';
import SettingsModal from './SettingsModal';
import axios from 'axios';

const Navbar = () => {
  const { user, userType, isAuthenticated, logout, setUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [inAppNotifications, setInAppNotifications] = useState(user?.inAppNotifications ?? true);
  const [soundNotifications, setSoundNotifications] = useState(user?.soundNotifications ?? true);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const { socket } = useSocket();

  // Helper function to check if link is active
  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load unread count
  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      loadNotificationUnreadCount();
      setEmailNotifications(user?.emailNotifications ?? true);
      setInAppNotifications(user?.inAppNotifications ?? true);
      setSoundNotifications(user?.soundNotifications ?? true);
    } else {
      // Reset counts when logged out
      setUnreadCount(0);
      setNotificationUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.emailNotifications, user?.inAppNotifications, user?.soundNotifications]);

  // Listen for new message notifications
  useEffect(() => {
    if (!socket) return;

    const handleNotificationUpdate = () => {
      loadUnreadCount();
    };

    const handleNewNotification = () => {
      loadNotificationUnreadCount();

      // Play notification sound if enabled
      if (soundNotifications) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5; // Set volume to 50%
          audio.play().catch(err => {
            console.log('Could not play notification sound:', err);
          });
        } catch (error) {
          console.log('Error playing notification sound:', error);
        }
      }
    };

    const handleNotificationRead = () => {
      loadNotificationUnreadCount();
    };

    socket.on('message-notification', handleNotificationUpdate);
    socket.on('new-message', handleNotificationUpdate);
    socket.on('unread-count-updated', handleNotificationUpdate);
    socket.on('new-notification', handleNewNotification);
    socket.on('notification-read', handleNotificationRead);
    socket.on('notifications-read-all', handleNotificationRead);

    return () => {
      socket.off('message-notification', handleNotificationUpdate);
      socket.off('new-message', handleNotificationUpdate);
      socket.off('unread-count-updated', handleNotificationUpdate);
      socket.off('new-notification', handleNewNotification);
      socket.off('notification-read', handleNotificationRead);
      socket.off('notifications-read-all', handleNotificationRead);
    };
  }, [socket, soundNotifications]);

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadNotificationUnreadCount = async () => {
    try {
      const data = await getNotificationUnreadCount();
      setNotificationUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load notification unread count:', error);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setDropdownOpen(false);
      navigate('/login');
    }
  };

  const handleToggleEmailNotifications = async () => {
    setLoading(true);

    try {
      const endpoint = userType === 'police'
        ? '/api/profile/police/email-notifications'
        : '/api/profile/email-notifications';

      const response = await axios.put(endpoint,
        { emailNotifications: !emailNotifications },
        { withCredentials: true }
      );

      if (response.data.success) {
        setEmailNotifications(!emailNotifications);
        setUser({ ...user, emailNotifications: !emailNotifications });
      }
    } catch (error) {
      console.error('Failed to update email notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInAppNotifications = async () => {
    setLoading(true);

    try {
      const endpoint = userType === 'police'
        ? '/api/profile/police/inapp-notifications'
        : '/api/profile/inapp-notifications';

      const response = await axios.put(endpoint,
        { inAppNotifications: !inAppNotifications },
        { withCredentials: true }
      );

      if (response.data.success) {
        setInAppNotifications(!inAppNotifications);
        setUser({ ...user, inAppNotifications: !inAppNotifications });
      }
    } catch (error) {
      console.error('Failed to update in-app notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSoundNotifications = async () => {
    setLoading(true);

    try {
      const endpoint = userType === 'police'
        ? '/api/profile/police/sound-notifications'
        : '/api/profile/sound-notifications';

      const response = await axios.put(endpoint,
        { soundNotifications: !soundNotifications },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSoundNotifications(!soundNotifications);
        setUser({ ...user, soundNotifications: !soundNotifications });
      }
    } catch (error) {
      console.error('Failed to update sound notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 shadow-md z-50 ${userType === 'police' ? 'bg-police' : 'bg-citizen'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex-1 flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 mr-4">
              <img
                src={`${process.env.PUBLIC_URL}/khojlogo.png`}
                alt="Khoj Logo"
                className="h-8 w-8 object-contain drop-shadow-lg transition-transform hover:scale-110"
                style={{ filter: 'drop-shadow(0 4px 4px rgba(0, 0, 0, 0.5)) drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))' }}
              />
              <span className="text-2xl font-bold text-white">khoj</span>
            </Link>

            {/* Search form (global) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
              }}
              className="hidden sm:flex items-center bg-white/10 hover:bg-white/20 rounded-md px-3 py-1 mr-4 max-w-xs"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search alerts..."
                className="bg-transparent text-white placeholder-white/70 focus:outline-none w-full"
              />
              <button type="submit" className="ml-2 text-white opacity-90 hover:opacity-100 transition-all hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/feed"
              className={`px-4 py-2 rounded-md text-white transition-colors ${isActive('/feed') ? 'bg-white/30' : 'hover:bg-white/20'
                }`}
            >
              Alerts
            </Link>
            <Link
              to="/report"
              className={`px-4 py-2 rounded-md text-white transition-colors ${isActive('/report') ? 'bg-white/30' : 'hover:bg-white/20'
                }`}
            >
              Report
            </Link>
            <Link
              to="/group"
              className={`px-4 py-2 rounded-md text-white transition-colors ${isActive('/group') ? 'bg-white/30' : 'hover:bg-white/20'
                }`}
            >
              Group
            </Link>
            <Link
              to="/statistics"
              className={`px-4 py-2 rounded-md text-white transition-colors ${isActive('/statistics') ? 'bg-white/30' : 'hover:bg-white/20'
                }`}
            >
              Statistics
            </Link>

            {/* Notification Bell with Badge */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className={`relative px-4 py-2 rounded-md text-white transition-colors ${isActive('/notifications') ? 'bg-white/30' : 'hover:bg-white/20'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {notificationUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-[pulse_1s_ease-in-out_2]">
                      {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
                    </span>
                  )}
                </span>
              </Link>
            )}

            {/* Chat Link with Badge */}
            {isAuthenticated && (
              <Link
                to="/chat"
                className={`relative px-4 py-2 rounded-md text-white transition-colors ${isActive('/chat') ? 'bg-white/30' : 'hover:bg-white/20'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-[pulse_1s_ease-in-out_2]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-white/20 transition-colors focus:outline-none"
              >
                {isAuthenticated ? (
                  <>
                    {user?.profilePicture?.url ? (
                      <img
                        src={user.profilePicture.url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-white"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-white">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="font-medium">{user?.name}</span>
                  </>
                ) : (
                  <span>Profile</span>
                )}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-primary rounded-md shadow-lg py-1 z-10 border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">
                        <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setShowSettingsModal(true);
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        emailNotifications={emailNotifications}
        inAppNotifications={inAppNotifications}
        soundNotifications={soundNotifications}
        onToggleEmail={handleToggleEmailNotifications}
        onToggleInApp={handleToggleInAppNotifications}
        onToggleSound={handleToggleSoundNotifications}
        loading={loading}
      />
    </nav>
  );
};

export default Navbar;