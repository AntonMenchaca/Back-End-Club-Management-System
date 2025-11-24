const Club = require('../models/Club');

const getAllClubs = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    
    const clubs = await Club.getAll(filters);
    
    res.status(200).json({
      status: 'success',
      results: clubs.length,
      data: clubs
    });
  } catch (error) {
    console.error('Get all clubs error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getClubById = async (req, res) => {
  try {
    const club = await Club.getById(req.params.id);
    
    if (!club) {
      return res.status(404).json({
        status: 'error',
        message: 'Club not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: club
    });
  } catch (error) {
    console.error('Get club by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const createClub = async (req, res) => {
  try {
    const clubData = {
      clubName: req.body.clubName,
      description: req.body.description,
      status: req.body.status || 'Pending',
      createdBy: req.user.id
    };
    
    const clubId = await Club.create(clubData);
    const club = await Club.getById(clubId);
    
    res.status(201).json({
      status: 'success',
      data: club
    });
  } catch (error) {
    console.error('Create club error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Club name already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getClubByUserId = async (req, res) => {
  try {
    const clubs = await Club.getByUserId(req.params.userId);
    res.status(200).json({
      status: 'success',
      results: clubs.length,
      data: clubs
    });
  } catch (error) {
    console.error('Get clubs by user ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}

const updateClub = async (req, res) => {
  try {
    const club = await Club.getById(req.params.id);
    
    if (!club) {
      return res.status(404).json({
        status: 'error',
        message: 'Club not found'
      });
    }
    
    await Club.update(req.params.id, {
      clubName: req.body.clubName,
      description: req.body.description,
      status: req.body.status
    });
    
    const updatedClub = await Club.getById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: updatedClub
    });
  } catch (error) {
    console.error('Update club error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const deleteClub = async (req, res) => {
  try {
    const club = await Club.getById(req.params.id);
    
    if (!club) {
      return res.status(404).json({
        status: 'error',
        message: 'Club not found'
      });
    }
    
    await Club.delete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Club deleted successfully'
    });
  } catch (error) {
    console.error('Delete club error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getClubMembers = async (req, res) => {
  try {
    const members = await Club.getMembers(req.params.id);
    
    res.status(200).json({
      status: 'success',
      results: members.length,
      data: members
    });
  } catch (error) {
    console.error('Get club members error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const addMember = async (req, res) => {
  try {
    const membershipId = await Club.addMember(
      req.params.id,
      req.body.personId,
      req.body.role
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Member added to club successfully',
      data: { membershipId }
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const removeMember = async (req, res) => {
  try {
    await Club.removeMember(req.params.id, req.params.personId);
    
    res.status(200).json({
      status: 'success',
      message: 'Member removed from club successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getClubEvents = async (req, res) => {
  try {
    const Event = require('../models/Event');
    const events = await Event.getAll({ clubId: req.params.id });
    
    res.status(200).json({
      status: 'success',
      results: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get club events error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getClubBudget = async (req, res) => {
  try {
    const Budget = require('../models/Budget');
    const budget = await Budget.getByClubAndYear(
      req.params.id,
      req.query.academicYear
    );
    
    if (!budget) {
      return res.status(404).json({
        status: 'error',
        message: 'Budget not found for this club and academic year'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: budget
    });
  } catch (error) {
    console.error('Get club budget error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getClubBudgetSummary = async (req, res) => {
  try {
    const Budget = require('../models/Budget');
    const budgetSummary = await Budget.getClubBudgetSummary(req.params.id);
    
    res.status(200).json({
      status: 'success',
      results: budgetSummary.length,
      data: budgetSummary
    });
  } catch (error) {
    console.error('Get club budget summary error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getAllClubs,
  getClubByUserId,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  getClubMembers,
  addMember,
  removeMember,
  getClubEvents,
  getClubBudget,
  getClubBudgetSummary
};

