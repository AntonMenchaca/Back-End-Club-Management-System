const db = require('../config/database');

class Club {
  // Get all clubs with optional filters
  static async getAll(filters = {}) {
    let query = `
      SELECT c.Club_ID, c.Club_Name, c.Description, c.Date_Established, 
             c.Created_By, c.STATUS,
             p.First_Name as Creator_First_Name, 
             p.Last_Name as Creator_Last_Name,
             COUNT(DISTINCT cm.Person_ID) as Member_Count
      FROM CLUB c
      LEFT JOIN PERSON p ON c.Created_By = p.Person_ID
      LEFT JOIN CLUB_MEMBERSHIP cm ON c.Club_ID = cm.Club_ID AND cm.Status = 'Active'
    `;
    
    const conditions = [];
    const params = [];

    if (filters.status) {
      conditions.push('c.STATUS = ?');
      params.push(filters.status);
    }

    if (filters.search) {
      conditions.push('(c.Club_Name LIKE ? OR c.Description LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY c.Club_ID ORDER BY c.Club_ID';

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get club by ID
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT c.Club_ID, c.Club_Name, c.Description, c.Date_Established, 
             c.Created_By, c.STATUS,
             p.First_Name as Creator_First_Name, 
             p.Last_Name as Creator_Last_Name,
             COUNT(DISTINCT cm.Person_ID) as Member_Count
      FROM CLUB c
      LEFT JOIN PERSON p ON c.Created_By = p.Person_ID
      LEFT JOIN CLUB_MEMBERSHIP cm ON c.Club_ID = cm.Club_ID AND cm.Status = 'Active'
      WHERE c.Club_ID = ?
      GROUP BY c.Club_ID
    `, [id]);
    return rows[0];
  }

  // Create club
  static async create(clubData) {
    const [result] = await db.query(
      'INSERT INTO CLUB (Club_Name, Description, Date_Established, Created_By, STATUS) VALUES (?, ?, ?, ?, ?)',
      [
        clubData.clubName,
        clubData.description || null,
        clubData.dateEstablished || new Date().toISOString().split('T')[0],
        clubData.createdBy,
        clubData.status || 'Pending'
      ]
    );
    return result.insertId;
  }

  // Update club
  static async update(id, clubData) {
    await db.query(
      'UPDATE CLUB SET Club_Name = COALESCE(?, Club_Name), Description = COALESCE(?, Description), STATUS = COALESCE(?, STATUS) WHERE Club_ID = ?',
      [clubData.clubName, clubData.description, clubData.status, id]
    );
    return true;
  }

  // Delete club
  static async delete(id) {
    await db.query('DELETE FROM CLUB WHERE Club_ID = ?', [id]);
    return true;
  }

  // Get club members
  static async getMembers(clubId) {
    const [rows] = await db.query(`
      SELECT cm.Membership_ID, cm.Person_ID, cm.Role, cm.Date_Joined, cm.Status,
             p.First_Name, p.Last_Name, p.Email,
             u.Department, u.Year
      FROM CLUB_MEMBERSHIP cm
      JOIN PERSON p ON cm.Person_ID = p.Person_ID
      LEFT JOIN USER u ON cm.Person_ID = u.Person_ID
      WHERE cm.Club_ID = ?
      ORDER BY cm.Date_Joined DESC
    `, [clubId]);
    return rows;
  }

  // Add member to club
  static async addMember(clubId, personId, role = 'Club Member') {
    const [result] = await db.query(
      'INSERT INTO CLUB_MEMBERSHIP (Person_ID, Club_ID, Role, Date_Joined, Status) VALUES (?, ?, ?, ?, ?)',
      [personId, clubId, role, new Date().toISOString().split('T')[0], 'Active']
    );
    return result.insertId;
  }

  // Remove member from club
  static async removeMember(clubId, personId) {
    await db.query(
      'DELETE FROM CLUB_MEMBERSHIP WHERE Club_ID = ? AND Person_ID = ?',
      [clubId, personId]
    );
    return true;
  }
}

module.exports = Club;

