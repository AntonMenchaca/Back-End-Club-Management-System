const db = require('../config/database');

class Membership {
  // Get all memberships with optional filters
  static async getAll(filters = {}) {
    let query = `
      SELECT cm.Membership_ID, cm.Person_ID, cm.Club_ID, cm.Role, 
             cm.Date_Joined, cm.Status,
             p.First_Name, p.Last_Name, p.Email,
             c.Club_Name,
             u.Department, u.Year
      FROM CLUB_MEMBERSHIP cm
      JOIN PERSON p ON cm.Person_ID = p.Person_ID
      JOIN CLUB c ON cm.Club_ID = c.Club_ID
      LEFT JOIN USER u ON cm.Person_ID = u.Person_ID
    `;
    
    const conditions = [];
    const params = [];

    if (filters.clubId) {
      conditions.push('cm.Club_ID = ?');
      params.push(filters.clubId);
    }

    if (filters.personId) {
      conditions.push('cm.Person_ID = ?');
      params.push(filters.personId);
    }

    if (filters.role) {
      conditions.push('cm.Role = ?');
      params.push(filters.role);
    }

    if (filters.status) {
      conditions.push('cm.Status = ?');
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY cm.Date_Joined DESC';

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get membership by ID
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT cm.Membership_ID, cm.Person_ID, cm.Club_ID, cm.Role, 
             cm.Date_Joined, cm.Status,
             p.First_Name, p.Last_Name, p.Email,
             c.Club_Name,
             u.Department, u.Year
      FROM CLUB_MEMBERSHIP cm
      JOIN PERSON p ON cm.Person_ID = p.Person_ID
      JOIN CLUB c ON cm.Club_ID = c.Club_ID
      LEFT JOIN USER u ON cm.Person_ID = u.Person_ID
      WHERE cm.Membership_ID = ?
    `, [id]);
    return rows[0];
  }

  // Get memberships by club
  static async getByClub(clubId) {
    return this.getAll({ clubId });
  }

  // Get memberships by person
  static async getByPerson(personId) {
    return this.getAll({ personId });
  }

  // Check if membership exists
  static async exists(clubId, personId) {
    const [rows] = await db.query(
      'SELECT Membership_ID FROM CLUB_MEMBERSHIP WHERE Club_ID = ? AND Person_ID = ?',
      [clubId, personId]
    );
    return rows.length > 0;
  }

  // Create membership
  static async create(membershipData) {
    // Check if membership already exists
    const exists = await this.exists(membershipData.clubId, membershipData.personId);
    if (exists) {
      throw new Error('Membership already exists');
    }

    const [result] = await db.query(
      'INSERT INTO CLUB_MEMBERSHIP (Person_ID, Club_ID, Role, Date_Joined, Status) VALUES (?, ?, ?, ?, ?)',
      [
        membershipData.personId,
        membershipData.clubId,
        membershipData.role || 'Club Member',
        membershipData.dateJoined || new Date().toISOString().split('T')[0],
        membershipData.status || 'Active'
      ]
    );
    return result.insertId;
  }

  // Update membership
  static async update(id, membershipData) {
    await db.query(
      `UPDATE CLUB_MEMBERSHIP 
       SET Role = COALESCE(?, Role), 
           Status = COALESCE(?, Status)
       WHERE Membership_ID = ?`,
      [membershipData.role, membershipData.status, id]
    );
    return true;
  }

  // Update membership status
  static async updateStatus(id, status) {
    await db.query(
      'UPDATE CLUB_MEMBERSHIP SET Status = ? WHERE Membership_ID = ?',
      [status, id]
    );
    return true;
  }

  // Update membership role
  static async updateRole(id, role) {
    // Validate role
    const validRoles = ['Club Leader', 'Club Member'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role. Must be "Club Leader" or "Club Member"');
    }

    await db.query(
      'UPDATE CLUB_MEMBERSHIP SET Role = ? WHERE Membership_ID = ?',
      [role, id]
    );
    return true;
  }

  // Delete membership
  static async delete(id) {
    await db.query('DELETE FROM CLUB_MEMBERSHIP WHERE Membership_ID = ?', [id]);
    return true;
  }

  // Delete by club and person
  static async deleteByClubAndPerson(clubId, personId) {
    await db.query(
      'DELETE FROM CLUB_MEMBERSHIP WHERE Club_ID = ? AND Person_ID = ?',
      [clubId, personId]
    );
    return true;
  }

  // Get active memberships count for a club
  static async getActiveMemberCount(clubId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM CLUB_MEMBERSHIP WHERE Club_ID = ? AND Status = ?',
      [clubId, 'Active']
    );
    return rows[0].count;
  }

  // Get club leaders
  static async getClubLeaders(clubId) {
    const [rows] = await db.query(`
      SELECT cm.Membership_ID, cm.Person_ID, cm.Role, cm.Date_Joined, cm.Status,
             p.First_Name, p.Last_Name, p.Email,
             u.Department, u.Year
      FROM CLUB_MEMBERSHIP cm
      JOIN PERSON p ON cm.Person_ID = p.Person_ID
      LEFT JOIN USER u ON cm.Person_ID = u.Person_ID
      WHERE cm.Club_ID = ? AND cm.Role = 'Club Leader' AND cm.Status = 'Active'
      ORDER BY cm.Date_Joined ASC
    `, [clubId]);
    return rows;
  }

  // Check if person is club leader
  static async isClubLeader(clubId, personId) {
    const [rows] = await db.query(
      `SELECT Membership_ID FROM CLUB_MEMBERSHIP 
       WHERE Club_ID = ? AND Person_ID = ? AND Role = 'Club Leader' AND Status = 'Active'`,
      [clubId, personId]
    );
    return rows.length > 0;
  }

  // Promote member to leader (Admin only)
  static async promoteToLeader(membershipId) {
    return this.updateRole(membershipId, 'Club Leader');
  }

  // Demote leader to member (Admin only)
  static async demoteToMember(membershipId) {
    return this.updateRole(membershipId, 'Club Member');
  }

  // Get all pending membership requests
  static async getAllPendingMemberships() {
    const [rows] = await db.query(`
      SELECT cm.Membership_ID, cm.Person_ID, cm.Club_ID, cm.Role, 
             cm.Date_Joined, cm.Status,
             p.First_Name, p.Last_Name, p.Email, p.Phone,
             c.Club_Name,
             u.Department, u.Year
      FROM CLUB_MEMBERSHIP cm
      JOIN PERSON p ON cm.Person_ID = p.Person_ID
      JOIN CLUB c ON cm.Club_ID = c.Club_ID
      LEFT JOIN USER u ON cm.Person_ID = u.Person_ID
      WHERE cm.Status = 'Pending'
      ORDER BY cm.Date_Joined DESC
    `);
    return rows;
  }
}

module.exports = Membership;
