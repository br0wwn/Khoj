const Group = require('../models/Group');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create group with invites
exports.createGroupWithInvites = async (req, res) => {
  try {
    const { name, description, district, thanaUpazila, invitedUserIds } = req.body;
    const creatorId = req.session.userId;

    if (!name || !district || !thanaUpazila) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Initialize members array with creator (accepted)
    const members = [{
      userId: creatorId,
      status: 'accepted',
      joinedAt: new Date()
    }];

    // Add invited users with 'invited' status
    if (invitedUserIds && Array.isArray(invitedUserIds)) {
      for (const userId of invitedUserIds) {
        if (userId !== creatorId) { // Don't invite yourself
          members.push({
            userId,
            status: 'invited',
            joinedAt: new Date()
          });
        }
      }
    }

    const group = new Group({
      name,
      description: description || '',
      district,
      thanaUpazila,
      createdBy: creatorId,
      members
    });

    await group.save();

    // Create notifications for invited users
    if (invitedUserIds && Array.isArray(invitedUserIds)) {
      const notifications = invitedUserIds
        .filter(id => id !== creatorId)
        .map(userId => ({
          type: 'group_invitation',
          recipient: userId,
          sender: creatorId,
          groupId: group._id,
          groupName: group.name,
          status: 'pending'
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({ success: true, data: group, message: 'Group created with invitations sent' });
  } catch (error) {
    console.error('Create group with invites error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Accept group invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.session.userId;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Find member
    const memberIdx = group.members.findIndex(m => m.userId.toString() === userId.toString());
    if (memberIdx === -1) return res.status(400).json({ success: false, message: 'Not invited to this group' });

    // Check if already accepted
    if (group.members[memberIdx].status === 'accepted') {
      return res.json({ success: true, message: 'Already accepted', data: group });
    }

    // Update member status
    group.members[memberIdx].status = 'accepted';
    await group.save();

    // Update notification status to mark as actioned
    await Notification.deleteOne({
      groupId: groupId,
      recipient: userId,
      type: 'group_invitation'
    });

    res.json({ success: true, message: 'Invitation accepted', data: group });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject group invitation
exports.rejectInvitation = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.session.userId;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Find and remove member
    const memberIdx = group.members.findIndex(m => m.userId.toString() === userId.toString());
    if (memberIdx === -1) return res.status(400).json({ success: false, message: 'Not invited to this group' });

    group.members.splice(memberIdx, 1);
    await group.save();

    // Delete notification for this invitation
    await Notification.deleteOne({
      groupId: groupId,
      recipient: userId,
      type: 'group_invitation'
    });

    res.json({ success: true, message: 'Invitation rejected' });
  } catch (error) {
    console.error('Reject invitation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's pending invitations
exports.getUserInvitations = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Find all groups where user has a member entry with status 'invited'
    const groups = await Group.find(
      { members: { $elemMatch: { userId: userId, status: 'invited' } } }
    ).populate('createdBy', 'name email').lean();

    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's accepted groups
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Find all groups where user has a member entry with status 'accepted'
    const groups = await Group.find(
      { members: { $elemMatch: { userId: userId, status: 'accepted' } } }
    ).populate('createdBy', 'name email').lean();

    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all groups (optional filters)
exports.getAllGroups = async (req, res) => {
  try {
    const { district, thanaUpazila } = req.query;
    const query = {};
    if (district) query.district = district;
    if (thanaUpazila) query.thanaUpazila = thanaUpazila;

    const groups = await Group.find(query)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .lean();
    res.json({ success: true, data: groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single group by id
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.userId', 'name email')
      .populate('createdBy', 'name email')
      .lean();
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, data: group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a group (only creator or police users can delete)
exports.deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.session.userId;
    const userType = req.session.userType;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Allow deletion if user is creator or is a police user
    if (group.createdBy.toString() !== userId && userType !== 'police') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this group' });
    }

    await Group.findByIdAndDelete(groupId);

    // Create deletion notifications for all members
    const members = group.members.map(m => m.userId);
    const notifications = members.map(memberId => ({
      type: 'group_deleted',
      recipient: memberId,
      sender: userId,
      groupId: group._id,
      groupName: group.name,
      status: 'pending'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({ success: true, message: 'Group deleted' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.session.userId;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const memberIdx = group.members.findIndex(m => m.userId.toString() === userId);
    if (memberIdx === -1) return res.status(400).json({ success: false, message: 'Not a member' });

    group.members.splice(memberIdx, 1);
    await group.save();

    res.json({ success: true, message: 'Left group', data: group });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
