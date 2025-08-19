const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { validateCompany } = require('../middleware/validation');
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getPastActionNotifications,
  respondToPastActionNotification
} = require('../controllers/companyController');

// All routes require authentication
router.use(requireAuth);

// GET /api/companies
router.get('/', getAllCompanies);

// POST /api/companies
router.post('/', validateCompany, createCompany);

// GET /api/companies/:id
router.get('/:id', getCompanyById);

// PUT /api/companies/:id
router.put('/:id', updateCompany);

// DELETE /api/companies/:id
router.delete('/:id', deleteCompany);

// GET /api/companies/notifications/past-actions
router.get('/notifications/past-actions', getPastActionNotifications);

// POST /api/companies/notifications/respond
router.post('/notifications/respond', respondToPastActionNotification);

module.exports = router;