import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import GroupChat from '../components/GroupChat';

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGroupDetail();
  }, [groupId]);

  const loadGroupDetail = async () => {
    setLoading(true);
    try {
      const response = await groupService.getGroupById(groupId);
      if (response.success) {
        setGroup(response.data);
      } else {
        setError('Group not found');
      }
    } catch (err) {
      console.error('Error loading group:', err);
      setError('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      const response = await groupService.leaveGroup(groupId);
      if (response.success) {
        navigate('/group');
      }
    } catch (err) {
      console.error('Error leaving group:', err);
      alert('Failed to leave group');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading group...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Group not found'}
        </div>
        <button
          onClick={() => navigate('/group')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Group Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
            <p className="text-gray-600 mt-2">{group.description}</p>
            <div className="mt-3 flex gap-4 text-sm text-gray-500">
              <span>📍 {group.district}, {group.thanaUpazila}</span>
              <span>👥 {group.members?.length || 0} members</span>
            </div>
          </div>
          <button
            onClick={handleLeaveGroup}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Leave Group
          </button>
        </div>

        {/* Members List */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-gray-800 mb-3">Members</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {group.members?.map((member) => (
              <div
                key={member.userId._id}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded"
              >
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {member.userId.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {member.userId.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member.status === 'accepted' ? '✓ Joined' : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="h-[500px]">
        <GroupChat groupId={groupId} currentUser={user?._id} />
      </div>
    </div>
  );
};

export default GroupDetail;
