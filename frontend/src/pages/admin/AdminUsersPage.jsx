import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

// Create admin axios instance
const adminApi = axios.create({
  baseURL: 'http://localhost:5001',
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      const response = await adminApi.get('/api/admin/users');
      console.log('Users response:', response.data);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone!`)) {
      return;
    }

    try {
      await adminApi.delete(`/api/admin/users/${userId}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Users Management</h1>
        <p className="text-gray-600">Manage all registered users</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
          />
          <span className="ml-4 text-gray-600">{filteredUsers.length} users</span>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-600">{searchTerm ? 'No users found matching your search' : 'No users found'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Profile</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Phone</th>
                    <th className="text-left py-3 px-4">Area</th>
                    <th className="text-left py-3 px-4">Date Joined</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.phoneNumber || 'N/A'}</td>
                      <td className="py-3 px-4">{user.area || 'N/A'}</td>
                      <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
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

export default AdminUsersPage;
