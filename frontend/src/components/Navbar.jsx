import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      setDropdownOpen(false);
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            khoj
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              Feed
            </Link>
            <Link
              to="/report"
              className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              Report
            </Link>
            <Link
              to="/group"
              className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              Group
            </Link>
            <Link
              to="/statistics"
              className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              Statistics
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors focus:outline-none"
              >
                Profile
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
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
