const db = require('../config/database');

class Event {
  // Get all events with optional filters
  static async getAll(filters = {}) {
    let query = `
      SELECT e.Event_ID, e.Club_ID, e.Event_Name, e.Description, 
             e.Event_Date, e.Venue,
             c.Club_Name
      FROM EVENT e
      LEFT JOIN CLUB c ON e.Club_ID = c.Club_ID
    `;
    
    const conditions = [];
    const params = [];

    if (filters.clubId) {
      conditions.push('e.Club_ID = ?');
      params.push(filters.clubId);
    }

    if (filters.upcoming === 'true') {
      conditions.push('e.Event_Date >= CURDATE()');
    }

    if (filters.past === 'true') {
      conditions.push('e.Event_Date < CURDATE()');
    }

    if (filters.search) {
      conditions.push('(e.Event_Name LIKE ? OR e.Description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY e.Event_Date DESC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get event by ID
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT e.Event_ID, e.Club_ID, e.Event_Name, e.Description, 
             e.Event_Date, e.Venue,
             c.Club_Name
      FROM EVENT e
      LEFT JOIN CLUB c ON e.Club_ID = c.Club_ID
      WHERE e.Event_ID = ?
    `, [id]);
    return rows[0];
  }

  // Create event
  static async create(eventData) {
    const [result] = await db.query(
      'INSERT INTO EVENT (Club_ID, Event_Name, Description, Event_Date, Venue) VALUES (?, ?, ?, ?, ?)',
      [
        eventData.clubId,
        eventData.eventName,
        eventData.description || null,
        eventData.eventDate,
        eventData.venue || null
      ]
    );
    return result.insertId;
  }

  // Update event
  static async update(id, eventData) {
    await db.query(
      'UPDATE EVENT SET Event_Name = COALESCE(?, Event_Name), Description = COALESCE(?, Description), Event_Date = COALESCE(?, Event_Date), Venue = COALESCE(?, Venue) WHERE Event_ID = ?',
      [
        eventData.eventName,
        eventData.description,
        eventData.eventDate,
        eventData.venue,
        id
      ]
    );
    return true;
  }

  // Delete event
  static async delete(id) {
    await db.query('DELETE FROM EVENT WHERE Event_ID = ?', [id]);
    return true;
  }

  // Get event attendees
  static async getAttendees(eventId) {
    const [rows] = await db.query(`
      SELECT a.Attendance_ID, a.Person_ID, a.Check_In_Time,
             p.First_Name, p.Last_Name, p.Email, p.Person_Type
      FROM ATTENDANCE a
      JOIN PERSON p ON a.Person_ID = p.Person_ID
      WHERE a.Event_ID = ?
      ORDER BY a.Check_In_Time DESC
    `, [eventId]);
    return rows;
  }

  // Add attendee
  static async addAttendee(eventId, personId) {
    const [result] = await db.query(
      'INSERT INTO ATTENDANCE (Person_ID, Event_ID, Check_In_Time) VALUES (?, ?, NOW())',
      [personId, eventId]
    );
    return result.insertId;
  }

  // Remove attendee
  static async removeAttendee(eventId, personId) {
    await db.query(
      'DELETE FROM ATTENDANCE WHERE Event_ID = ? AND Person_ID = ?',
      [eventId, personId]
    );
    return true;
  }

  // Get attendee count
  static async getAttendeeCount(eventId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM ATTENDANCE WHERE Event_ID = ?',
      [eventId]
    );
    return rows[0].count;
  }
}

module.exports = Event;

