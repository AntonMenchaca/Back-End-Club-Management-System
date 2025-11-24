const Budget = require('../models/Budget');
const Membership = require('../models/Membership');

// @desc    Get all pending expenditure requests
// @route   GET /api/requests/expenditures
// @access  Private (Admin only)
const getPendingExpenditures = async (req, res) => {
  try {
    const expenditures = await Budget.getAllPendingExpenditures();
    res.status(200).json({
      status: 'success',
      results: expenditures.length,
      data: expenditures
    });
  } catch (error) {
    console.error('Get pending expenditures error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching pending expenditure requests',
      error: error.message
    });
  }
};

// @desc    Get all pending membership requests
// @route   GET /api/requests/memberships
// @access  Private (Admin only)
const getPendingMemberships = async (req, res) => {
  try {
    const memberships = await Membership.getAllPendingMemberships();
    
    res.status(200).json({
      status: 'success',
      results: memberships.length,
      data: memberships
    });
  } catch (error) {
    console.error('Get pending memberships error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching pending membership requests',
      error: error.message
    });
  }
};

// @desc    Approve or deny expenditure request
// @route   PUT /api/requests/expenditures/:id
// @access  Private (Admin only)
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
// @access  Private (Admin only)
const updateMembershipRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

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

module.exports = {
  getPendingExpenditures,
  getPendingMemberships,
  updateExpenditureRequest,
  updateMembershipRequest
};

