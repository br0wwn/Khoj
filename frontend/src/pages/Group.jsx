import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import groupService from '../services/groupService';
import CreateGroupModal from '../components/CreateGroupModal';

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [invitationCount, setInvitationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadGroups();
    loadInvitationCount();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const response = await groupService.getUserGroups();
      if (response.success) {
        setGroups(response.data);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitationCount = async () => {
    try {
      const response = await groupService.getPendingInvitations();
      if (response.success) {
        setInvitationCount(response.data.length);
      }
    } catch (err) {
      console.error('Error loading invitations:', err);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
    loadInvitationCount();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Groups</h1>
        <div className="flex gap-3">
          <Link
            to="/group-invitations"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 relative"
          >
            Invitations
            {invitationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {invitationCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Create Group
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          <p>You haven't joined any groups yet. Create one or wait for invitations!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map(group => (
            <Link
              key={group._id}
              to={`/group/${group._id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{group.name}</h2>
              <p className="text-gray-600 text-sm mb-3">{group.description}</p>
              <p className="text-gray-500 text-xs mb-4">
                📍 {group.district} - {group.thanaUpazila}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Members: {group.members.filter(m => m.status === 'accepted').length}
              </p>
              <div className="text-blue-600 text-sm font-medium hover:underline">
                View Chat →
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default Group;
