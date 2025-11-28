const Event = require('../models/Event');
const Membership = require('../models/Membership');

const getAllEvents = async (req, res) => {
  try {
    const filters = {
      clubId: req.query.clubId,
      upcoming: req.query.upcoming,
      past: req.query.past,
      search: req.query.search
    };
    
    const events = await Event.getAll(filters);
    
    res.status(200).json({
      status: 'success',
      results: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.getById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const createEvent = async (req, res) => {
  try {
    const personId = req.user.id; // Person_ID from JWT
    const { clubId } = req.body;
    
    // Only Club Leaders can create events for clubs they lead
    const isClubLeader = await Membership.isClubLeader(clubId, personId);
    if (!isClubLeader) {
      return res.status(403).json({
        status: 'error',
        message: 'Only Club Leaders can create events. You must be a Club Leader of this club to create an event for it.'
      });
    }
    
    const eventData = {
      clubId: req.body.clubId,
      eventName: req.body.eventName,
      description: req.body.description,
      eventDate: req.body.eventDate,
      venue: req.body.venue
    };
    
    const eventId = await Event.create(eventData);
    const event = await Event.getById(eventId);
    
    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const personId = req.user.id; // Person_ID from JWT
    const event = await Event.getById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if event is in the past - only upcoming events can be edited
    const eventDate = new Date(event.Event_Date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'Past events cannot be edited'
      });
    }
    
    // Only Club Leaders of the event's club can edit
    const isClubLeader = await Membership.isClubLeader(event.Club_ID, personId);
    if (!isClubLeader) {
      return res.status(403).json({
        status: 'error',
        message: 'Only Club Leaders can edit events for their clubs'
      });
    }
    
    await Event.update(req.params.id, {
      eventName: req.body.eventName,
      description: req.body.description,
      eventDate: req.body.eventDate,
      venue: req.body.venue
    });
    
    const updatedEvent = await Event.getById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.getById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    await Event.delete(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getEventAttendees = async (req, res) => {
  try {
    const attendees = await Event.getAttendees(req.params.id);
    
    res.status(200).json({
      status: 'success',
      results: attendees.length,
      data: attendees
    });
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const addAttendee = async (req, res) => {
  try {
    const userRole = req.user.role;
    const personId = req.user.id; // Person_ID from JWT
    const eventId = req.params.id;
    
    // Get event to check club
    const event = await Event.getById(eventId);
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check permissions: Admin can add to any event, Club Leaders only for their clubs
    if (userRole !== 'Admin') {
      const isClubLeader = await Membership.isClubLeader(event.Club_ID, personId);
      if (!isClubLeader) {
        return res.status(403).json({
          status: 'error',
          message: 'Only Club Leaders and Admins can add attendees. You must be a Club Leader of this event\'s club to add attendees.'
        });
      }
    }
    
    const attendanceId = await Event.addAttendee(
      eventId,
      req.body.personId
    );
    
    res.status(201).json({
      status: 'success',
      message: 'Attendee added successfully',
      data: { attendanceId }
    });
  } catch (error) {
    console.error('Add attendee error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const removeAttendee = async (req, res) => {
  try {
    await Event.removeAttendee(req.params.id, req.params.personId);
    
    res.status(200).json({
      status: 'success',
      message: 'Attendee removed successfully'
    });
  } catch (error) {
    console.error('Remove attendee error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  addAttendee,
  removeAttendee
};
