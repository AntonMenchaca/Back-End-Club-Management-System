const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);
router.get('/:id/clubs', memberController.getMemberClubs);

// Protected routes
router.post('/', authenticateToken, memberController.createMember);
router.put('/:id', authenticateToken, memberController.updateMember);
router.delete('/:id', authenticateToken, memberController.deleteMember);

module.exports = router;

