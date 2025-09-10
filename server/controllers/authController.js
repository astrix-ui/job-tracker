const User = require('../models/User');
const Company = require('../models/Company');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }
    
    // Create new user with plain text password
    const user = new User({
      username,
      email,
      password // Storing plain text password as per requirements
    });
    
    await user.save();
    
    // Create session
    req.session.userId = user._id;
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user with plain text password comparison
    const user = await User.findOne({ 
      username: username, 
      password: password  // Direct comparison - no hashing
    });
    
    if (user) {
      req.session.userId = user._id;
      res.json({ 
        success: true, 
        user: { 
          id: user._id, 
          username: user.username,
          email: user.email
        } 
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.session.userId;

    // Find the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }
      
      if (user.password !== currentPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long' });
      }
    }

    // Check if username or email already exists (excluding current user)
    if (username !== user.username || email !== user.email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          { username: username },
          { email: email }
        ]
      });

      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({ error: 'Username already taken' });
        }
        if (existingUser.email === email) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }
    }

    // Update user data
    const updateData = {
      username: username || user.username,
      email: email || user.email
    };

    if (newPassword) {
      updateData.password = newPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get all companies for the user
    const companies = await Company.find({ userId });

    // Calculate stats
    const totalApplications = companies.length;
    const activeApplications = companies.filter(c => 
      !['Rejected', 'Offered', 'Withdrawn'].includes(c.status)
    ).length;
    const offersReceived = companies.filter(c => c.status === 'Offer Received').length;

    res.json({
      success: true,
      stats: {
        totalApplications,
        activeApplications,
        offersReceived
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Server error while fetching user stats' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.session.userId;

    // Find and delete the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user account
    await User.findByIdAndDelete(userId);

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ error: 'Error logging out after account deletion' });
      }
      
      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Server error during account deletion' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  getUserStats,
  deleteAccount
};