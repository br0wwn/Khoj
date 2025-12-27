import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import adminApi from '../../services/adminApiService';

const AdminAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [approvedEmails, setApprovedEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('admins'); // 'admins' or 'pending'

  useEffect(() => {
    fetchAdmins();
    fetchApprovedEmails();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminApi.get('/api/admin/list');
      setAdmins(response.data.admins || []);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching admins:', error);
      }
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedEmails = async () => {
    try {
      const response = await adminApi.get('/api/admin/approved-admins');
      setApprovedEmails(response.data.data || []);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error fetching approved emails:', error);
      }
      setApprovedEmails([]);
    }
  };

  const handleAddEmail = async (e) => {
    e.preventDefault();
    
    if (!newEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    // Basic email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(newEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setAddingEmail(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await adminApi.post('/api/admin/approved-admins', {
        email: newEmail
      });

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Email added successfully! Invitation email sent.' 
        });
        setNewEmail('');
        fetchApprovedEmails();
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 5000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add email'
      });
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveEmail = async (id) => {
    if (!window.confirm('Are you sure you want to remove this email from the approved list?')) {
      return;
    }

    try {
      const response = await adminApi.delete(`/api/admin/approved-admins/${id}`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Email removed successfully' });
        fetchApprovedEmails();
        
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to remove email'
      });
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Management</h1>
        <p className="text-gray-600">Manage admin accounts and approve new admins</p>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'admins'
                ? 'text-[#8E1616] border-[#8E1616]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Active Admins ({admins.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'pending'
                ? 'text-[#8E1616] border-[#8E1616]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Pending Approvals ({approvedEmails.filter(e => !e.isUsed).length})
          </button>
        </div>
      </div>

      {/* Add New Admin Email Section */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Approve New Admin</h2>
          <p className="text-gray-600 mb-4">
            Enter an email address to approve for admin registration. The user will receive an email with signup instructions.
          </p>
          <form onSubmit={handleAddEmail} className="flex gap-4">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@example.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E1616]"
            />
            <button
              type="submit"
              disabled={addingEmail}
              className="px-6 py-2 bg-[#8E1616] text-white rounded-lg font-medium hover:bg-[#6B1010] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {addingEmail ? 'Adding...' : 'Add Email'}
            </button>
          </form>
        </div>
      )}

      {/* Active Admins Tab */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {loading ? (
              <p className="text-center text-gray-600">Loading admins...</p>
            ) : admins.length === 0 ? (
              <p className="text-center text-gray-600">No admins found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Phone</th>
                      <th className="text-left py-3 px-4">Referred By</th>
                      <th className="text-left py-3 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{admin.name}</td>
                        <td className="py-3 px-4">{admin.email}</td>
                        <td className="py-3 px-4">{admin.phoneNumber}</td>
                        <td className="py-3 px-4">{admin.referredBy}</td>
                        <td className="py-3 px-4">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {approvedEmails.length === 0 ? (
              <p className="text-center text-gray-600">No pending email approvals</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Added By</th>
                      <th className="text-left py-3 px-4">Date Added</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedEmails.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{item.email}</td>
                        <td className="py-3 px-4">
                          {item.isUsed ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              ✓ Account Created
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">{item.addedByName}</td>
                        <td className="py-3 px-4">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {!item.isUsed && (
                            <button
                              onClick={() => handleRemoveEmail(item._id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAdminsPage;
