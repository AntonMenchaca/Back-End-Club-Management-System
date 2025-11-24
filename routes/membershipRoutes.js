const express = require('express');
const router = express.Router();
const {
  getAllMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership,
  getClubLeaders,
  promoteToLeader,
  demoteToMember
} = require('../controllers/membershipController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get club leaders (before /:id to avoid conflict)
router.get('/club/:clubId/leaders', authenticateToken, getClubLeaders);

// Promote member to leader - Admin only
router.patch('/:id/promote', authenticateToken, authorizeRoles('Admin'), promoteToLeader);

// Demote leader to member - Admin only
router.patch('/:id/demote', authenticateToken, authorizeRoles('Admin'), demoteToMember);

// All other routes require authentication
router.route('/')
  .get(authenticateToken, getAllMemberships)
  .post(authenticateToken, createMembership);

router.route('/:id')
  .get(authenticateToken, getMembership)
  .put(authenticateToken, updateMembership)
  .delete(authenticateToken, deleteMembership);

module.exports = router;
