const express = require('express');
const router = express.Router();
const {
  getPendingExpenditures,
  getPendingMemberships,
  getPendingClubs,
  updateExpenditureRequest,
  updateMembershipRequest,
  updateClubRequest
} = require('../controllers/requestController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get pending requests - available to all authenticated users (Admin or Club Leader)
router.get('/expenditures', getPendingExpenditures);
router.get('/memberships', getPendingMemberships);
// Get pending club requests - Admin only
router.get('/clubs', authorizeRoles('Admin'), getPendingClubs);

// Update request status
// Expenditure updates: Admin only
router.put('/expenditures/:id', authorizeRoles('Admin'), updateExpenditureRequest);
// Membership updates: Admin or Club Leader (for their clubs)
router.put('/memberships/:id', updateMembershipRequest);
// Club updates: Admin only
router.put('/clubs/:id', authorizeRoles('Admin'), updateClubRequest);

module.exports = router;

