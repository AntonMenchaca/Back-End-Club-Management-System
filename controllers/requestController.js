const Budget = require('../models/Budget');
const Membership = require('../models/Membership');
const Club = require('../models/Club');

// @desc    Get all pending expenditure requests
// @route   GET /api/requests/expenditures
// @access  Private (Admin or Club Leader)
// Admin: sees all pending requests
// Club Leader: sees all requests (pending and non-pending) for clubs they lead
const getPendingExpenditures = async (req, res) => {
  try {
    const userRole = req.user.role;
    const personId = req.user.id; // JWT stores Person_ID as 'id'
    
    let expenditures;
    
    if (userRole === 'Admin') {
      // Admin sees all pending requests
      expenditures = await Budget.getAllPendingExpenditures();
    } else {
      // Club Leaders see all requests (pending and non-pending) for clubs they lead
      expenditures = await Budget.getAllExpendituresForClubLeader(personId);
    }
    
    res.status(200).json({
      status: 'success',
      results: expenditures.length,
      data: expenditures
    });
  } catch (error) {
    console.error('Get pending expenditures error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching expenditure requests',
      error: error.message
    });
  }
};

// @desc    Get all pending membership requests
// @route   GET /api/requests/memberships
// @access  Private (Admin or Club Leader)
// Admin: sees all pending requests
// Club Leader: sees pending requests for clubs they lead
const getPendingMemberships = async (req, res) => {
  try {
    const userRole = req.user.role;
    const personId = req.user.id; // JWT stores Person_ID as 'id'
    
    let memberships;
    
    if (userRole === 'Admin') {
      // Admin sees all pending requests
      memberships = await Membership.getAllPendingMemberships();
    } else {
      // Club Leaders see pending requests for clubs they lead
      memberships = await Membership.getPendingMembershipsForClubLeader(personId);
    }
    
    res.status(200).json({
      status: 'success',
      results: memberships.length,
      data: memberships
    });
  } catch (error) {
    console.error('Get pending memberships error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching membership requests',
      error: error.message
    });
  }
};

// @desc    Approve or deny expenditure request
// @route   PUT /api/requests/expenditures/:id
// @access  Private (Admin only - Club Leaders can view but not modify)
const updateExpenditureRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be either "Approved" or "Rejected"'
      });
    }

    // Get expenditure to find budget ID
    const expenditure = await Budget.getExpenditureById(id);
    
    if (!expenditure) {
      return res.status(404).json({
        status: 'error',
        message: 'Expenditure request not found'
      });
    }

    if (expenditure.Status !== 'Pending') {
      return res.status(400).json({
        status: 'error',
        message: 'This expenditure request has already been processed'
      });
    }

    // Update expenditure status
    await Budget.updateExpenditureStatus(id, status, expenditure.Budget_ID);
    
    const updatedExpenditure = await Budget.getExpenditureById(id);
    
    res.status(200).json({
      status: 'success',
      message: `Expenditure request ${status.toLowerCase()} successfully`,
      data: updatedExpenditure
    });
  } catch (error) {
    console.error('Update expenditure request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating expenditure request',
      error: error.message
    });
  }
};

// @desc    Approve or deny membership request
// @route   PUT /api/requests/memberships/:id
// @access  Private (Admin or Club Leader for their clubs)
const updateMembershipRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const userRole = req.user.role;
    const personId = req.user.id; // JWT stores Person_ID as 'id'

    if (!status || !['Active', 'Rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be either "Active" (to approve) or "Rejected" (to deny)'
      });
    }

    // Get membership to check current status
    const membership = await Membership.getById(id);
    
    if (!membership) {
      return res.status(404).json({
        status: 'error',
        message: 'Membership request not found'
      });
    }

    if (membership.Status !== 'Pending') {
      return res.status(400).json({
        status: 'error',
        message: 'This membership request has already been processed'
      });
    }

    // If user is Club Leader (not Admin), verify they are a leader of the club
    if (userRole !== 'Admin') {
      const isLeader = await Membership.isClubLeader(membership.Club_ID, personId);
      if (!isLeader) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to approve/deny membership requests for this club'
        });
      }
    }

    // Update membership status
    // If rejected, we can either delete it or set status to 'Inactive'
    // For now, we'll set it to 'Inactive' to keep a record
    const newStatus = status === 'Active' ? 'Active' : 'Inactive';
    await Membership.updateStatus(id, newStatus);
    
    const updatedMembership = await Membership.getById(id);
    
    res.status(200).json({
      status: 'success',
      message: `Membership request ${status === 'Active' ? 'approved' : 'rejected'} successfully`,
      data: updatedMembership
    });
  } catch (error) {
    console.error('Update membership request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating membership request',
      error: error.message
    });
  }
};

// @desc    Get all pending club requests
// @route   GET /api/requests/clubs
// @access  Private (Admin only)
const getPendingClubs = async (req, res) => {
  try {
    const clubs = await Club.getAll({ status: 'Pending' });
    
    res.status(200).json({
      status: 'success',
      results: clubs.length,
      data: clubs
    });
  } catch (error) {
    console.error('Get pending clubs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching pending club requests',
      error: error.message
    });
  }
};

// @desc    Approve or reject club request
// @route   PUT /api/requests/clubs/:id
// @access  Private (Admin only)
const updateClubRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status || !['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Status must be either "Active" (to approve) or "Inactive" (to reject)'
      });
    }

    // Get club to check current status
    const club = await Club.getById(id);
    
    if (!club) {
      return res.status(404).json({
        status: 'error',
        message: 'Club request not found'
      });
    }

    if (club.STATUS !== 'Pending') {
      return res.status(400).json({
        status: 'error',
        message: 'This club request has already been processed'
      });
    }

    // Update club status
    // When status changes from Pending to Active, the trigger will create Club Leader membership
    await Club.update(id, {
      status: status
    });
    
    const updatedClub = await Club.getById(id);
    
    res.status(200).json({
      status: 'success',
      message: `Club request ${status === 'Active' ? 'approved' : 'rejected'} successfully`,
      data: updatedClub
    });
  } catch (error) {
    console.error('Update club request error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating club request',
      error: error.message
    });
  }
};

module.exports = {
  getPendingExpenditures,
  getPendingMemberships,
  getPendingClubs,
  updateExpenditureRequest,
  updateMembershipRequest,
  updateClubRequest
};

