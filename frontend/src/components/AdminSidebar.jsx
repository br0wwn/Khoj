import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/reports', icon: '📋', label: 'Reports' },
    { path: '/admin/alerts', icon: '🚨', label: 'Alerts' },
    { path: '/admin/police', icon: '👮', label: 'Police' },
    { path: '/admin/admins', icon: '🔐', label: 'Admins' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-[#F9F8F6] shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#8E1616]">Khoj Admin</h1>
        {admin && (
          <p className="text-sm text-gray-600 mt-2">Welcome, {admin.name}</p>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-[#8E1616] hover:text-white transition-colors ${
              isActive(item.path) ? 'bg-[#8E1616] text-white' : ''
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 bg-[#8E1616] text-white rounded-lg hover:bg-[#6E0E0E] transition-colors"
        >
          <span className="text-xl mr-2">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
