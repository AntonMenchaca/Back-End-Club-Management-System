const User = require('../models/User');
const Person = require('../models/Person');

const getAllMembers = async (req, res) => {
  try {
    const members = await User.getAll();
    
    res.status(200).json({
      status: 'success',
      results: members.length,
      data: members
    });
  } catch (error) {
    console.error('Get all members error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getMemberById = async (req, res) => {
  try {
    const member = await User.getById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: member
    });
  } catch (error) {
    console.error('Get member by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const createMember = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    
    const personId = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      department: req.body.department,
      year: req.body.year,
      roleId: req.body.roleId || 1003 // Student role by default
    });
    
    const member = await User.getById(personId);
    
    res.status(201).json({
      status: 'success',
      data: member
    });
  } catch (error) {
    console.error('Create member error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await User.getById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }
    
    await User.update(req.params.id, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      department: req.body.department,
      year: req.body.year,
      roleId: req.body.roleId
    });
    
    const updatedMember = await User.getById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: updatedMember
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await User.getById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'Member not found'
      });
    }
    
    await Person.delete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getMemberClubs = async (req, res) => {
  try {
    const clubs = await User.getClubs(req.params.id);
    
    res.status(200).json({
      status: 'success',
      results: clubs.length,
      data: clubs
    });
  } catch (error) {
    console.error('Get member clubs error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMemberClubs
};

