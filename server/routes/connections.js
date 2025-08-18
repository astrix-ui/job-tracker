const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  getAllUsers,
  sendFollowRequest,
  getPendingRequests,
  respondToRequest,
  getMutualConnections,
  getUserProfile,
  getConnectionProgress
} = require('../controllers/connectionController');

// All routes require authentication
router.use(requireAuth);

// GET /api/connections/users - Get all users for exploration
router.get('/users', getAllUsers);

// POST /api/connections/follow - Send follow request
router.post('/follow', sendFollowRequest);

// GET /api/connections/requests - Get pending requests
router.get('/requests', getPendingRequests);

// POST /api/connections/respond - Respond to follow request
router.post('/respond', respondToRequest);

// GET /api/connections - Get mutual connections
router.get('/', getMutualConnections);

// GET /api/connections/profile/:userId - Get user profile
router.get('/profile/:userId', getUserProfile);

// GET /api/connections/progress/:userId - Get connection's job progress
router.get('/progress/:userId', getConnectionProgress);

module.exports = router;