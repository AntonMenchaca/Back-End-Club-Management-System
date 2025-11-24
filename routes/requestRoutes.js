const express = require('express');
const router = express.Router();
const {
  getPendingExpenditures,
  getPendingMemberships,
  updateExpenditureRequest,
  updateMembershipRequest
} = require('../controllers/requestController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication and Admin role
router.use(authenticateToken);
router.use(authorizeRoles('Admin'));

// Get pending requests
router.get('/expenditures', getPendingExpenditures);
router.get('/memberships', getPendingMemberships);

// Update request status
router.put('/expenditures/:id', updateExpenditureRequest);
router.put('/memberships/:id', updateMembershipRequest);

module.exports = router;

