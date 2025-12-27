import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import groupService from '../services/groupService';
import alertService from '../services/alertService';
import reportService from '../services/reportService';
import CreateGroupModal from '../components/CreateGroupModal';
import GroupChat from '../components/GroupChat';
import areaData from '../data/area.json';

const Group = () => {
  const { user } = useAuth();
  const [nearbyGroups, setNearbyGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchUpazila, setSearchUpazila] = useState('');

  // Debug: Log user object structure
  useEffect(() => {
    console.log('User object:', user);
    console.log('User ID (_id):', user?._id);
    console.log('User ID (id):', user?.id);
  }, [user]);

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadNearbyAlertsAndReports(selectedGroup.district, selectedGroup.thanaUpazila);
    }
  }, [selectedGroup]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadGroups(),
        loadInvitations()
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const [allGroupsRes, myGroupsRes] = await Promise.all([
        groupService.getAllGroups(),
        groupService.getUserGroups()
      ]);

      if (myGroupsRes.success) {
        setJoinedGroups(myGroupsRes.data);
        // Auto-select first joined group
        if (myGroupsRes.data.length > 0 && !selectedGroup) {
          setSelectedGroup(myGroupsRes.data[0]);
        }
      }

      if (allGroupsRes.success) {
        // Filter nearby groups (not yet joined)
        const joinedIds = myGroupsRes.data.map(g => g._id);
        const nearby = allGroupsRes.data.filter(g => !joinedIds.includes(g._id));
        setNearbyGroups(nearby);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const loadInvitations = async () => {
    try {
      const response = await groupService.getPendingInvitations();
      if (response.success) {
        setPendingInvitations(response.data);
      }
    } catch (err) {
      console.error('Error loading invitations:', err);
    }
  };

  const loadNearbyAlertsAndReports = async (district, upazila) => {
    try {
      const [alertsRes, reportsRes] = await Promise.all([
        alertService.getAllAlerts(),
        reportService.getAllReports()
      ]);

      // Filter by district, upazila, and active status
      let filteredAlerts = alertsRes.data?.filter(
        a => a.district === district && a.upazila === upazila && a.status === 'active'
      ) || [];

      // If no alerts in upazila, fallback to district level
      if (filteredAlerts.length === 0) {
        filteredAlerts = alertsRes.data?.filter(
          a => a.district === district && a.status === 'active'
        ) || [];
      }

      let filteredReports = reportsRes.data?.filter(
        r => r.district === district && r.upazila === upazila
      ) || [];

      // If no reports in upazila, fallback to district level
      if (filteredReports.length === 0) {
        filteredReports = reportsRes.data?.filter(
          r => r.district === district
        ) || [];
      }

      setNearbyAlerts(filteredAlerts.slice(0, 5));
      setNearbyReports(filteredReports.slice(0, 5));
    } catch (err) {
      console.error('Error loading nearby alerts/reports:', err);
    }
  };

  const handleAcceptInvitation = async (groupId) => {
    try {
      const response = await groupService.acceptInvitation(groupId);
      if (response.success) {
        await loadAllData();
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Failed to accept invitation');
    }
  };

  const handleRejectInvitation = async (groupId) => {
    try {
      const response = await groupService.rejectInvitation(groupId);
      if (response.success) {
        setPendingInvitations(pendingInvitations.filter(g => g._id !== groupId));
      }
    } catch (err) {
      console.error('Error rejecting invitation:', err);
      alert('Failed to reject invitation');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await groupService.joinGroup(groupId);
      if (response.success) {
        await loadAllData();
        // Auto-select the newly joined group
        const newGroup = response.data;
        setSelectedGroup(newGroup);
      }
    } catch (err) {
      console.error('Error joining group:', err);
      alert(err.response?.data?.message || 'Failed to join group');
    }
  };

  const handleGroupCreated = (newGroup) => {
    setJoinedGroups([newGroup, ...joinedGroups]);
    setSelectedGroup(newGroup);
    loadAllData();
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup || !window.confirm('Are you sure you want to leave this group?')) return;

    try {
      const response = await groupService.leaveGroup(selectedGroup._id);
      if (response.success) {
        setSelectedGroup(null);
        await loadAllData();
      }
    } catch (err) {
      console.error('Error leaving group:', err);
      alert('Failed to leave group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Community Groups</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
              title="Search Groups"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              + Create Group
            </button>
          </div>
        </div>
      </div>

      {/* 3 Column Layout */}
      <div className="max-w-[1800px] mx-auto grid grid-cols-12 gap-6">
        {/* LEFT COLUMN - Groups Navigation */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Groups Near You */}
          <div className="bg-white rounded-lg shadow-md p-4 h-[280px] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center flex-shrink-0">
              <span className="mr-2">📍</span> Groups Near You
            </h2>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {nearbyGroups.length === 0 ? (
                <p className="text-sm text-gray-500">No nearby groups</p>
              ) : (
                nearbyGroups.slice(0, 10).map(group => (
                  <div key={group._id} className="p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-800 truncate">{group.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {group.district} - {group.thanaUpazila}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {group.members?.filter(m => m.status === 'accepted').length || 0} members
                        </p>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(group._id)}
                        className="flex-shrink-0 w-7 h-7 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center transition"
                        title="Join group"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Joined Groups */}
          <div className="bg-white rounded-lg shadow-md p-4 h-[280px] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center flex-shrink-0">
              <span className="mr-2">✅</span> Joined Groups
            </h2>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {joinedGroups.length === 0 ? (
                <p className="text-sm text-gray-500">No joined groups yet</p>
              ) : (
                joinedGroups.map(group => (
                  <div
                    key={group._id}
                    onClick={() => setSelectedGroup(group)}
                    className={`p-3 rounded cursor-pointer transition ${
                      selectedGroup?._id === group._id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <h3 className="font-medium text-sm text-gray-800">{group.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {group.district} - {group.thanaUpazila}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {group.members?.filter(m => m.status === 'accepted').length || 0} members
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-lg shadow-md p-4 h-[280px] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center flex-shrink-0">
              <span className="mr-2">⏳</span> Pending Requests
              {pendingInvitations.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingInvitations.length}
                </span>
              )}
            </h2>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {pendingInvitations.length === 0 ? (
                <p className="text-sm text-gray-500">No pending invitations</p>
              ) : (
                pendingInvitations.map(group => (
                  <div key={group._id} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <h3 className="font-medium text-sm text-gray-800">{group.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      By: {group.createdBy?.name || 'Unknown'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleAcceptInvitation(group._id)}
                        className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectInvitation(group._id)}
                        className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN - Group Info & Chat */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {selectedGroup ? (
            <>
              {/* Group Information */}
              <div className="bg-white rounded-lg shadow-md p-6 h-[340px] flex flex-col">
                <div className="flex justify-between items-start mb-4 flex-shrink-0">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">{selectedGroup.name}</h2>
                    <p className="text-gray-600 mt-2 line-clamp-2">{selectedGroup.description}</p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>📍 {selectedGroup.district}, {selectedGroup.thanaUpazila}</span>
                      <span>👥 {selectedGroup.members?.filter(m => m.status === 'accepted').length || 0} members</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLeaveGroup}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex-shrink-0"
                  >
                    Leave
                  </button>
                </div>

                {/* Founder and Member List Button */}
                <div className="flex-1 overflow-y-auto pt-4 border-t">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Founder</h3>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="w-8 h-8 bg-[#8E1616] text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {selectedGroup.createdBy?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{selectedGroup.createdBy?.name || 'Unknown'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMemberListOpen(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      View All Members ({selectedGroup.members?.filter(m => m.status === 'accepted').length || 0})
                    </button>
                  </div>
                </div>
              </div>

              {/* Group Chatroom */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-[500px] flex flex-col">
                <div className="bg-[#8E1616] text-white px-6 py-3 flex-shrink-0">
                  <h2 className="text-lg font-semibold">Group Chat</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  <GroupChat groupId={selectedGroup._id} currentUser={user?._id || user?.id} />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center h-[868px] flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Group Selected</h2>
              <p className="text-gray-600">
                Select a group from your joined groups to view details and chat
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Nearby Alerts & Reports */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Nearby Alerts */}
          <div className="bg-white rounded-lg shadow-md p-4 h-[427px] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center flex-shrink-0">
              <span className="mr-2">🚨</span> Nearby Alerts
            </h2>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {nearbyAlerts.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {selectedGroup ? 'No alerts in this area' : 'Select a group to see alerts'}
                </p>
              ) : (
                nearbyAlerts.map(alert => (
                  <div key={alert._id} className="p-3 bg-red-50 rounded border border-red-200">
                    <h3 className="font-medium text-sm text-gray-800 line-clamp-1">{alert.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{alert.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{alert.location}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.status === 'active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    {alert.media && alert.media.length > 0 && (
                      <img
                        src={alert.media[0].media_url}
                        alt={alert.title}
                        className="w-full h-24 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Nearby Reports */}
          <div className="bg-white rounded-lg shadow-md p-4 h-[427px] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center flex-shrink-0">
              <span className="mr-2">📋</span> Nearby Reports
            </h2>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {nearbyReports.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {selectedGroup ? 'No reports in this area' : 'Select a group to see reports'}
                </p>
              ) : (
                nearbyReports.map(report => (
                  <div key={report._id} className="p-3 bg-blue-50 rounded border border-blue-200">
                    <h3 className="font-medium text-sm text-gray-800 line-clamp-1">{report.title}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{report.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{report.location}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {report.media && report.media.length > 0 && (
                      <img
                        src={report.media[0].media_url}
                        alt={report.title}
                        className="w-full h-24 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* Group Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsSearchModalOpen(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Search Groups</h2>
              <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Search Input */}
              <input
                type="text"
                placeholder="Search by group name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Filters */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <select
                  value={searchDistrict}
                  onChange={(e) => {
                    setSearchDistrict(e.target.value);
                    setSearchUpazila('');
                  }}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Districts</option>
                  {[...areaData].sort((a, b) => a.district.localeCompare(b.district)).map((area) => (
                    <option key={area.district} value={area.district}>{area.district}</option>
                  ))}
                </select>
                
                <select
                  value={searchUpazila}
                  onChange={(e) => setSearchUpazila(e.target.value)}
                  disabled={!searchDistrict}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">All Upazilas</option>
                  {searchDistrict && areaData.find(a => a.district === searchDistrict)?.upazilas.sort().map((upazila) => (
                    <option key={upazila} value={upazila}>{upazila}</option>
                  ))}
                </select>
              </div>
              
              {/* Search Results */}
              <div className="space-y-2">
                {[...nearbyGroups, ...joinedGroups]
                  .filter(g => {
                    const matchesName = !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesDistrict = !searchDistrict || g.district === searchDistrict;
                    const matchesUpazila = !searchUpazila || g.thanaUpazila === searchUpazila;
                    return matchesName && matchesDistrict && matchesUpazila;
                  })
                  .map(group => {
                    const isJoined = joinedGroups.some(jg => jg._id === group._id);
                    return (
                      <div key={group._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{group.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              📍 {group.district}, {group.thanaUpazila} • {group.members?.filter(m => m.status === 'accepted').length || 0} members
                            </p>
                          </div>
                          {isJoined ? (
                            <button
                              onClick={() => {
                                setSelectedGroup(group);
                                setIsSearchModalOpen(false);
                              }}
                              className="ml-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              View
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinGroup(group._id)}
                              className="ml-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member List Modal */}
      {isMemberListOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsMemberListOpen(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Members of {selectedGroup.name}
              </h2>
              <button onClick={() => setIsMemberListOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-2">
                {selectedGroup.members?.filter(m => m.status === 'accepted').map((member) => {
                  const memberId = member.userId?._id || member.userId;
                  const memberName = member.userId?.name || member.userId?.email || 'Unknown User';
                  const memberType = member.userType === 'Police' ? 'police' : 'citizen';
                  const profileUrl = `/view-profile/${memberType}/${memberId}`;
                  
                  return (
                    <a
                      key={memberId}
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="w-10 h-10 bg-[#8E1616] text-white rounded-full flex items-center justify-center font-bold">
                        {memberName[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{memberName}</div>
                        <div className="text-xs text-gray-500">
                          {memberType === 'police' ? '👮 Police Officer' : '👤 Citizen'}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Group;
