const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const chatController = require('../controllers/chatController');
const chatMediaUpload = require('../middleware/chatMediaUpload');
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Police = require('../models/police');

// PUBLIC: GET all groups
router.get('/', groupController.getAllGroups);

// PROTECTED: POST new group
router.post('/', requireAuth, groupController.createGroupWithInvites);

// Get all users (citizens + police) for invite selection - MUST be before /:id routes
router.get('/users/all', async (req, res) => {
  try {
    console.log('Fetching all users for invite...');
    const [citizens, police] = await Promise.all([
      User.find({}, 'name email _id').lean(),
      Police.find({}, 'name email _id').lean()
    ]);
    
    console.log(`Found ${citizens.length} citizens and ${police.length} police`);
    
    const allUsers = [
      ...citizens.map(c => ({ ...c, userType: 'citizen' })),
      ...police.map(p => ({ ...p, userType: 'police' }))
    ];
    
    res.json({ success: true, data: allUsers });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PROTECTED: GET pending invitations
router.get('/invitations/pending', requireAuth, groupController.getUserInvitations);

// PROTECTED: GET user's groups
router.get('/my/groups', requireAuth, groupController.getUserGroups);

// PROTECTED: POST accept invitation - comes BEFORE /:id GET
router.post('/:id/accept', requireAuth, groupController.acceptInvitation);

// PROTECTED: POST reject invitation
router.post('/:id/reject', requireAuth, groupController.rejectInvitation);

// PROTECTED: POST leave group
router.post('/:id/leave', requireAuth, groupController.leaveGroup);

// PROTECTED: DELETE group
router.delete('/:id', requireAuth, groupController.deleteGroup);

// PROTECTED: GET group messages - MUST be before /:id GET
router.get('/:groupId/messages', requireAuth, chatController.getGroupMessages);

// PROTECTED: POST send message to group with optional media
router.post('/:groupId/messages', requireAuth, chatMediaUpload.single('media'), chatController.sendMessage);

// PUBLIC: GET single group - MUST be LAST (most generic)
router.get('/:id', groupController.getGroupById);

module.exports = router;
