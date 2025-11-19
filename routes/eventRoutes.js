const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.get('/:id/attendees', eventController.getEventAttendees);

// Protected routes
router.post('/', authenticateToken, eventController.createEvent);
router.put('/:id', authenticateToken, eventController.updateEvent);
router.delete('/:id', authenticateToken, eventController.deleteEvent);
router.post('/:id/attendees', authenticateToken, eventController.addAttendee);
router.delete('/:id/attendees/:personId', authenticateToken, eventController.removeAttendee);

module.exports = router;

