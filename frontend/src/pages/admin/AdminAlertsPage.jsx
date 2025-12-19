import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminAlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAlerts([]);
    setLoading(false);
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Alerts Management</h1>
        <p className="text-gray-600">View and manage all alerts</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search alerts..."
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
          />
          <button className="ml-4 px-4 py-2 bg-[#8E1616] text-white rounded-lg hover:bg-[#6E0E0E] transition-colors">
            Create Alert
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="text-center text-gray-600">No alerts found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Alerts will be mapped here */}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAlertsPage;
