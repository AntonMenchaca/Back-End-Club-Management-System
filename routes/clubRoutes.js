const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', clubController.getAllClubs);
router.get('/:id', clubController.getClubById);
router.get('/:id/members', clubController.getClubMembers);
router.get('/:id/events', clubController.getClubEvents);
router.get('/:id/budget', clubController.getClubBudget);

// Protected routes
router.post('/', authenticateToken, clubController.createClub);
router.put('/:id', authenticateToken, clubController.updateClub);
router.delete('/:id', authenticateToken, clubController.deleteClub);
router.post('/:id/members', authenticateToken, clubController.addMember);
router.delete('/:id/members/:personId', authenticateToken, clubController.removeMember);

module.exports = router;

