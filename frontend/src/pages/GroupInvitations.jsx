import React, { useState, useEffect } from 'react';
import groupService from '../services/groupService';

const GroupInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const response = await groupService.getPendingInvitations();
      if (response.success) {
        setInvitations(response.data);
      }
    } catch (err) {
      console.error('Error loading invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (groupId) => {
    setActionLoading(groupId);
    try {
      const response = await groupService.acceptInvitation(groupId);
      if (response.success) {
        setInvitations(invitations.filter(g => g._id !== groupId));
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Failed to accept invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (groupId) => {
    setActionLoading(groupId);
    try {
      const response = await groupService.rejectInvitation(groupId);
      if (response.success) {
        setInvitations(invitations.filter(g => g._id !== groupId));
      }
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      alert('Failed to reject invitation');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Group Invitations</h1>
        <div className="text-center text-gray-500">Loading invitations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Group Invitations</h1>

      {invitations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          You have no pending group invitations
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map(group => (
            <div key={group._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{group.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Invited by: <span className="font-medium">{group.createdBy.name}</span>
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{group.description}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    📍 {group.district} - {group.thanaUpazila}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleAccept(group._id)}
                  disabled={actionLoading === group._id}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {actionLoading === group._id ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleReject(group._id)}
                  disabled={actionLoading === group._id}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                >
                  {actionLoading === group._id ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupInvitations;
