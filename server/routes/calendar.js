const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getCalendarEvents } = require('../controllers/calendarController');

// All routes require authentication
router.use(requireAuth);

// GET /api/calendar/events
router.get('/events', getCalendarEvents);

module.exports = router;