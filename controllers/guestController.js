// Guest Controller
// Handles guest creation

const Guest = require('../models/Guest');

// @desc    Create a new guest
// @route   POST /api/guests
// @access  Private
const createGuest = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, organization } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide first name, last name, and email'
      });
    }

    const personId = await Guest.create({
      firstName,
      lastName,
      email,
      phone,
      organization
    });

    const guest = await Guest.getByPersonId(personId);

    res.status(201).json({
      status: 'success',
      data: guest
    });
  } catch (error) {
    console.error('Create guest error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'A person with this email already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  createGuest
};

