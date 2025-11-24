const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('Admin'));

// Dashboard routes
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;

