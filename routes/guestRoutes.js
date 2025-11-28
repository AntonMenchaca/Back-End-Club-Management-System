const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Guest routes
router.post('/', guestController.createGuest);

module.exports = router;

