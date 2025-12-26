import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingReports: 0,
    totalAlerts: 0,
    totalPolice: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Dashboard response:', response.data);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`text-4xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your application</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon="👥"
              title="Total Users"
              value={stats.totalUsers}
              color="text-blue-600"
            />
            <StatCard
              icon="📋"
              title="Pending Reports"
              value={stats.pendingReports}
              color="text-green-600"
            />
            <StatCard
              icon="🚨"
              title="Total Alerts"
              value={stats.totalAlerts}
              color="text-red-600"
            />
            <StatCard
              icon="👮"
              title="Police Officers"
              value={stats.totalPolice}
              color="text-[#8E1616]"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/admin/reports')}
                className="px-4 py-3 bg-[#8E1616] text-white rounded-lg hover:bg-[#6E0E0E] transition-colors"
              >
                View All Reports
              </button>
              <button 
                onClick={() => navigate('/admin/users')}
                className="px-4 py-3 bg-[#8E1616] text-white rounded-lg hover:bg-[#6E0E0E] transition-colors"
              >
                Manage Users
              </button>
              <button 
                onClick={() => navigate('/admin/alerts')}
                className="px-4 py-3 bg-[#8E1616] text-white rounded-lg hover:bg-[#6E0E0E] transition-colors"
              >
                View Alerts
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <p className="text-gray-600">No recent activity to display</p>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
