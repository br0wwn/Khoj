import React, { useState, useEffect } from 'react';
import groupService from '../services/groupService';
import areaData from '../data/area.json';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    district: '',
    thanaUpazila: '',
    invitedUserIds: []
  });
  const [allUsers, setAllUsers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [police, setPolice] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [citizenDropdownOpen, setCitizenDropdownOpen] = useState(false);
  const [policeDropdownOpen, setPoliceDropdownOpen] = useState(false);

  const districts = [...areaData].sort((a, b) => a.district.localeCompare(b.district));

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Update upazilas when district changes
  useEffect(() => {
    if (formData.district) {
      const district = districts.find(d => d.district === formData.district);
      setUpazilas(district ? [...district.upazilas].sort() : []);
      setFormData(prev => ({ ...prev, thanaUpazila: '' }));
    } else {
      setUpazilas([]);
    }
  }, [formData.district, districts]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('Starting to load users...');
      const response = await groupService.getAllUsersForInvite();
      console.log('Users response:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        const citizensData = response.data.filter(u => u.userType === 'citizen');
        const policeData = response.data.filter(u => u.userType === 'police');
        console.log(`Loaded ${citizensData.length} citizens and ${policeData.length} police`);
        setCitizens(citizensData);
        setPolice(policeData);
        setAllUsers(response.data);
      } else {
        console.error('Invalid response format:', response);
        setCitizens([]);
        setPolice([]);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setCitizens([]);
      setPolice([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.district || !formData.thanaUpazila) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await groupService.createGroupWithInvites({
        ...formData,
        invitedUserIds: selectedUsers
      });

      if (response.success) {
        onGroupCreated(response.data);
        setFormData({
          name: '',
          description: '',
          district: '',
          thanaUpazila: '',
          invitedUserIds: []
        });
        setSelectedUsers([]);
        setCitizenDropdownOpen(false);
        setPoliceDropdownOpen(false);
        onClose();
      }
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedUserName = (userId) => {
    const user = allUsers.find(u => u._id === userId);
    return user ? user.name : '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Create Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Group Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter group description (optional)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select District</option>
                {districts.map(d => (
                  <option key={d.district} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thana/Upazila *</label>
              <select
                name="thanaUpazila"
                value={formData.thanaUpazila}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.district}
                required
              >
                <option value="">Select Thana/Upazila</option>
                {upazilas.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Member Selection - Dropdowns */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Members ({selectedUsers.length} selected)
            </label>

            {/* Citizens Dropdown */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setCitizenDropdownOpen(!citizenDropdownOpen)}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-left font-medium text-gray-700 hover:bg-gray-200 flex justify-between items-center"
              >
                <span>👤 Citizens ({citizens.length})</span>
                <span>{citizenDropdownOpen ? '▼' : '▶'}</span>
              </button>
              {citizenDropdownOpen && (
                <div className="mt-2 border border-gray-300 rounded-md bg-white max-h-48 overflow-y-auto">
                  {citizens.length === 0 ? (
                    <p className="p-4 text-gray-500 text-sm">No citizens found</p>
                  ) : (
                    <div className="space-y-0">
                      {citizens.map(user => (
                        <label
                          key={user._id}
                          className="flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleUserSelect(user._id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="ml-3 flex-1">
                            <span className="block text-sm font-medium text-gray-800">{user.name}</span>
                            <span className="block text-xs text-gray-500">{user.email}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Police Dropdown */}
            <div>
              <button
                type="button"
                onClick={() => setPoliceDropdownOpen(!policeDropdownOpen)}
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-left font-medium text-gray-700 hover:bg-gray-200 flex justify-between items-center"
              >
                <span>👮 Police ({police.length})</span>
                <span>{policeDropdownOpen ? '▼' : '▶'}</span>
              </button>
              {policeDropdownOpen && (
                <div className="mt-2 border border-gray-300 rounded-md bg-white max-h-48 overflow-y-auto">
                  {police.length === 0 ? (
                    <p className="p-4 text-gray-500 text-sm">No police officers found</p>
                  ) : (
                    <div className="space-y-0">
                      {police.map(user => (
                        <label
                          key={user._id}
                          className="flex items-center p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleUserSelect(user._id)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="ml-3 flex-1">
                            <span className="block text-sm font-medium text-gray-800">{user.name}</span>
                            <span className="block text-xs text-gray-500">{user.email}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Members List */}
            {selectedUsers.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Members:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(userId => (
                    <div
                      key={userId}
                      className="inline-flex items-center gap-2 bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {getSelectedUserName(userId)}
                      <button
                        type="button"
                        onClick={() => handleUserSelect(userId)}
                        className="hover:text-blue-600 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
