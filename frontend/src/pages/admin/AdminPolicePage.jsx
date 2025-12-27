import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import adminApi from '../../services/adminApiService';

const AdminPolicePage = () => {
  const navigate = useNavigate();
  const [police, setPolice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPolice = async () => {
    try {
      setLoading(true);
      console.log('Fetching police...');
      const response = await adminApi.get('/api/admin/police');
      console.log('Police response:', response.data);
      setPolice(response.data.police || []);
    } catch (error) {
      console.error('Error fetching police:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setPolice([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolice();
  }, []);

  const handleDelete = async (policeId, policeName) => {
    if (!window.confirm(`Are you sure you want to delete police officer "${policeName}"? This action cannot be undone!`)) {
      return;
    }

    try {
      await adminApi.delete(`/api/admin/police/${policeId}`);
      alert('Police officer deleted successfully');
      fetchPolice();
    } catch (error) {
      console.error('Error deleting police:', error);
      alert(error.response?.data?.message || 'Failed to delete police officer');
    }
  };

  const filteredPolice = police.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.badgeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.rank?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
          />
          <span className="ml-4 text-gray-600">{filteredPolice.length} officers</span>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading police officers...</p>
          ) : filteredPolice.length === 0 ? (
            <p className="text-center text-gray-600">{searchTerm ? 'No police officers found matching your search' : 'No police officers found'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Profile</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Badge Number</th>
                    <th className="text-left py-3 px-4">Rank</th>
                    <th className="text-left py-3 px-4">Station</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Date Joined</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolice.map((officer) => (
                    <tr key={officer._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {officer.profilePicture ? (
                          <img src={officer.profilePicture} alt={officer.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-blue-800 font-semibold">
                            {officer.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{officer.name}</td>
                      <td className="py-3 px-4">{officer.badgeNumber}</td>
                      <td className="py-3 px-4">{officer.rank || 'N/A'}</td>
                      <td className="py-3 px-4">{officer.station || 'N/A'}</td>
                      <td className="py-3 px-4">{officer.phoneNumber || 'N/A'}</td>
                      <td className="py-3 px-4">{new Date(officer.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/police/${officer._id}`)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleDelete(officer._id, officer.name)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
