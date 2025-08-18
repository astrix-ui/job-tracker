const Connection = require('../models/Connection');
const User = require('../models/User');
const Company = require('../models/Company');

// Get all users for exploration (excluding current user)
const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const { search } = req.query;
    
    let query = { _id: { $ne: currentUserId } };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('username email createdAt')
      .sort({ username: 1 });
    
    // Get connection status for each user
    const usersWithConnectionStatus = await Promise.all(
      users.map(async (user) => {
        const connection = await Connection.findOne({
          $or: [
            { requester: currentUserId, recipient: user._id },
            { requester: user._id, recipient: currentUserId }
          ]
        });
        
        let connectionStatus = 'none';
        let isRequester = false;
        
        if (connection) {
          connectionStatus = connection.status;
          isRequester = connection.requester.toString() === currentUserId;
        }
        
        // Get connection count for this user
        const userConnectionCount = await Connection.countDocuments({
          $or: [
            { requester: user._id, status: 'accepted' },
            { recipient: user._id, status: 'accepted' }
          ]
        });

        return {
          ...user.toObject(),
          connectionStatus,
          isRequester,
          connectionsCount: userConnectionCount
        };
      })
    );
    
    res.json({ users: usersWithConnectionStatus });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};

// Send follow request
const sendFollowRequest = async (req, res) => {
  try {
    const requesterId = req.session.userId;
    const { recipientId } = req.body;
    
    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });
    
    if (existingConnection) {
      return res.status(400).json({ error: 'Connection request already exists' });
    }
    
    // Create new connection request
    const connection = new Connection({
      requester: requesterId,
      recipient: recipientId
    });
    
    await connection.save();
    
    res.status(201).json({
      success: true,
      message: 'Follow request sent successfully',
      connection
    });
  } catch (error) {
    console.error('Send follow request error:', error);
    res.status(500).json({ error: 'Server error while sending follow request' });
  }
};

// Get pending requests for current user
const getPendingRequests = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    const pendingRequests = await Connection.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('requester', 'username email')
    .sort({ createdAt: -1 });
    
    res.json({ requests: pendingRequests });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Server error while fetching pending requests' });
  }
};

// Respond to follow request (accept/reject)
const respondToRequest = async (req, res) => {
  try {
    const { connectionId, action } = req.body; // action: 'accept' or 'reject'
    const userId = req.session.userId;
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    const connection = await Connection.findOne({
      _id: connectionId,
      recipient: userId,
      status: 'pending'
    });
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }
    
    if (action === 'accept') {
      connection.status = 'accepted';
      await connection.save();
      
      res.json({
        success: true,
        message: 'Connection request accepted',
        connection
      });
    } else {
      await Connection.findByIdAndDelete(connectionId);
      
      res.json({
        success: true,
        message: 'Connection request rejected'
      });
    }
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ error: 'Server error while responding to request' });
  }
};

// Get mutual connections
const getMutualConnections = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { targetUserId } = req.query; // Optional parameter to find mutual connections with specific user
    
    const connections = await Connection.find({
      $or: [
        { requester: userId, status: 'accepted' },
        { recipient: userId, status: 'accepted' }
      ]
    })
    .populate('requester', 'username email')
    .populate('recipient', 'username email')
    .sort({ updatedAt: -1 });
    
    // Format connections to show the other user
    let formattedConnections = connections.map(connection => {
      const otherUser = connection.requester._id.toString() === userId 
        ? connection.recipient 
        : connection.requester;
      
      return {
        connectionId: connection._id,
        user: otherUser,
        connectedAt: connection.updatedAt
      };
    });

    // If targetUserId is provided, find mutual connections
    if (targetUserId) {
      const targetConnections = await Connection.find({
        $or: [
          { requester: targetUserId, status: 'accepted' },
          { recipient: targetUserId, status: 'accepted' }
        ]
      })
      .populate('requester', 'username email')
      .populate('recipient', 'username email');

      const targetUserConnections = targetConnections.map(connection => {
        const otherUser = connection.requester._id.toString() === targetUserId 
          ? connection.recipient 
          : connection.requester;
        return otherUser._id.toString();
      });

      // Filter to show only mutual connections
      formattedConnections = formattedConnections.filter(conn => 
        targetUserConnections.includes(conn.user._id.toString())
      );
    }
    
    res.json({ connections: formattedConnections });
  } catch (error) {
    console.error('Get mutual connections error:', error);
    res.status(500).json({ error: 'Server error while fetching connections' });
  }
};

// Get user profile (for viewing other users)
const getUserProfile = async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const { userId } = req.params;
    
    // Get user info
    const user = await User.findById(userId).select('username email createdAt');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check connection status
    const connection = await Connection.findOne({
      $or: [
        { requester: currentUserId, recipient: userId },
        { requester: userId, recipient: currentUserId }
      ]
    });
    
    let connectionStatus = 'none';
    if (connection) {
      connectionStatus = connection.status;
    }
    
    res.json({
      user,
      connectionStatus
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error while fetching user profile' });
  }
};

// Get connection's job progress
const getConnectionProgress = async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const { userId } = req.params;
    
    // Verify mutual connection exists
    const connection = await Connection.findOne({
      $or: [
        { requester: currentUserId, recipient: userId, status: 'accepted' },
        { requester: userId, recipient: currentUserId, status: 'accepted' }
      ]
    });
    
    if (!connection) {
      return res.status(403).json({ error: 'Not connected to this user' });
    }
    
    // Get user info
    const user = await User.findById(userId).select('username email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's companies (excluding private ones)
    const companies = await Company.find({ 
      userId,
      isPrivate: { $ne: true }
    })
      .select('companyName status positionTitle positionType applicationDate nextActionDate interviewRounds salaryExpectation contactPerson')
      .sort({ createdAt: -1 });
    
    res.json({
      user,
      companies,
      totalApplications: companies.length,
      statusBreakdown: getStatusBreakdown(companies)
    });
  } catch (error) {
    console.error('Get connection progress error:', error);
    res.status(500).json({ error: 'Server error while fetching connection progress' });
  }
};

// Helper function to calculate status breakdown
const getStatusBreakdown = (companies) => {
  const breakdown = {};
  companies.forEach(company => {
    breakdown[company.status] = (breakdown[company.status] || 0) + 1;
  });
  return breakdown;
};

module.exports = {
  getAllUsers,
  sendFollowRequest,
  getPendingRequests,
  respondToRequest,
  getMutualConnections,
  getUserProfile,
  getConnectionProgress
};