const Membership = require('../models/Membership');

// @desc    Get all memberships
// @route   GET /api/memberships
// @access  Private
exports.getAllMemberships = async (req, res) => {
  try {
    const filters = {
      clubId: req.query.clubId,
      personId: req.query.personId,
      role: req.query.role,
      status: req.query.status
    };

    const memberships = await Membership.getAll(filters);

    res.status(200).json({
      status: 'success',
      count: memberships.length,
      data: memberships
    });
  } catch (error) {
    console.error('Get memberships error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching memberships',
      error: error.message
    });
  }
};

// @desc    Get membership by ID
// @route   GET /api/memberships/:id
// @access  Private
exports.getMembership = async (req, res) => {
  try {
    const membership = await Membership.getById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        status: 'error',
        message: 'Membership not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: membership
    });
  } catch (error) {
    console.error('Get membership error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching membership',
      error: error.message
    });
  }
};

// @desc    Create membership
// @route   POST /api/memberships
// @access  Private
exports.createMembership = async (req, res) => {
  try {
    const { personId, clubId, role, status } = req.body;

    if (!personId || !clubId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide personId and clubId'
      });
    }

    const membershipId = await Membership.create({
      personId,
      clubId,
      role,
      status
    });

    const membership = await Membership.getById(membershipId);

    res.status(201).json({
      status: 'success',
      message: 'Membership created successfully',
      data: membership
    });
  } catch (error) {
    console.error('Create membership error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error creating membership',
      error: error.message
    });
  }
};

// @desc    Update membership
// @route   PUT /api/memberships/:id
// @access  Private
exports.updateMembership = async (req, res) => {
  try {
    const { role, status } = req.body;

    await Membership.update(req.params.id, { role, status });

    const membership = await Membership.getById(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Membership updated successfully',
      data: membership
    });
  } catch (error) {
    console.error('Update membership error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error updating membership',
      error: error.message
    });
  }
};

// @desc    Delete membership
// @route   DELETE /api/memberships/:id
// @access  Private
exports.deleteMembership = async (req, res) => {
  try {
    await Membership.delete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Membership deleted successfully'
    });
  } catch (error) {
    console.error('Delete membership error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting membership',
      error: error.message
    });
  }
};

// @desc    Get club leaders
// @route   GET /api/memberships/club/:clubId/leaders
// @access  Private
exports.getClubLeaders = async (req, res) => {
  try {
    const leaders = await Membership.getClubLeaders(req.params.clubId);

    res.status(200).json({
      status: 'success',
      count: leaders.length,
      data: leaders
    });
  } catch (error) {
    console.error('Get club leaders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching club leaders',
      error: error.message
    });
  }
};

// @desc    Promote member to leader
// @route   PATCH /api/memberships/:id/promote
// @access  Private (Admin only)
exports.promoteToLeader = async (req, res) => {
  try {
    // Check if user is admin (this is already handled by authorizeRoles middleware in routes)
    await Membership.promoteToLeader(req.params.id);

    const membership = await Membership.getById(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Member promoted to leader successfully',
      data: membership
    });
  } catch (error) {
    console.error('Promote member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error promoting member',
      error: error.message
    });
  }
};

// @desc    Demote leader to member
// @route   PATCH /api/memberships/:id/demote
// @access  Private (Admin only)
exports.demoteToMember = async (req, res) => {
  try {
    await Membership.demoteToMember(req.params.id);

    const membership = await Membership.getById(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Leader demoted to member successfully',
      data: membership
    });
  } catch (error) {
    console.error('Demote leader error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error demoting leader',
      error: error.message
    });
  }
};
