import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReports([]);
    setLoading(false);
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports Management</h1>
        <p className="text-gray-600">View and manage all reports</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
          />
          <div className="ml-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]">
              <option>All Status</option>
              <option>Pending</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-center text-gray-600">No reports found</p>
          ) : (
            <div className="space-y-4">
              {/* Reports will be mapped here */}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;
