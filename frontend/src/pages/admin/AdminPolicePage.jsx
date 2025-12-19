import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminPolicePage = () => {
  const [police, setPolice] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPolice([]);
    setLoading(false);
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Police Management</h1>
        <p className="text-gray-600">Manage police officers in the system</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search police officers..."
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
          />
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading police officers...</p>
          ) : police.length === 0 ? (
            <p className="text-center text-gray-600">No police officers found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Badge Number</th>
                    <th className="text-left py-3 px-4">Rank</th>
                    <th className="text-left py-3 px-4">Station</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Police officers will be mapped here */}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPolicePage;
