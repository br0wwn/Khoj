import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/chatService';
import { getUnreadCount as getNotificationUnreadCount } from '../services/notificationService';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, userType, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useSocket();

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
    } else {
      // Reset counts when logged out
      setUnreadCount(0);
      setNotificationUnreadCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Listen for new message notifications
  useEffect(() => {
    if (!socket) return;

    const handleNotificationUpdate = () => {
      loadUnreadCount();
    };

    const handleNewNotification = () => {
      loadNotificationUnreadCount();
    };

    socket.on('message-notification', handleNotificationUpdate);
    socket.on('new-message', handleNotificationUpdate);
    socket.on('unread-count-updated', handleNotificationUpdate);
    socket.on('new-notification', handleNewNotification);

    return () => {
      socket.off('message-notification', handleNotificationUpdate);
      socket.off('new-message', handleNotificationUpdate);
      socket.off('unread-count-updated', handleNotificationUpdate);
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket]);

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

  return (
    <nav className={`fixed top-0 left-0 right-0 shadow-md z-50 ${userType === 'police' ? 'bg-police' : 'bg-citizen'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link to="/" className="text-2xl font-bold text-white">
            khoj
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="px-4 py-2 rounded-md text-white hover:bg-white/20 transition-colors"
            >
              Feed
            </Link>
            <Link
              to="/report"
              className="px-4 py-2 rounded-md text-white hover:bg-white/20 transition-colors"
            >
              Report
            </Link>
            <Link
              to="/group"
              className="px-4 py-2 rounded-md text-white hover:bg-white/20 transition-colors"
            >
              Group
            </Link>
            <Link
              to="/statistics"
              className="px-4 py-2 rounded-md text-white hover:bg-white/20 transition-colors"
            >
              Statistics
            </Link>

            {/* Notification Bell with Badge */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative px-4 py-2 rounded-md text-white hover:bg-white/20 transition-colors"
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
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
                className="relative px-4 py-2 rounded-md text-white hover:bg-white/20 transition-colors"
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
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
                className="px-4 py-2 rounded-md text-white hover:bg-white/20 transition-colors focus:outline-none"
              >
                Profile
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-primary rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Settings
                      </Link>
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
    </nav>
  );
};

export default Navbar;