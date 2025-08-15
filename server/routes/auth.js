const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile
} = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', validateRegistration, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/user
router.get('/user', requireAuth, getCurrentUser);

// PUT /api/auth/profile
router.put('/profile', requireAuth, updateProfile);

module.exports = router;