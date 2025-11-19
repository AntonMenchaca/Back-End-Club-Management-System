const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Get all users with person and role info
  static async getAll() {
    const [rows] = await db.query(`
      SELECT u.Person_ID, p.First_Name, p.Last_Name, p.Email, p.Phone,
             u.Department, u.Year, sr.Role_Name, sr.Description as Role_Description
      FROM USER u
      JOIN PERSON p ON u.Person_ID = p.Person_ID
      JOIN SYSTEM_ROLE sr ON u.Role_ID = sr.Role_ID
      ORDER BY u.Person_ID
    `);
    return rows;
  }

  // Get user by ID with full details
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT u.Person_ID, p.First_Name, p.Last_Name, p.Email, p.Phone,
             u.Department, u.Year, u.Role_ID, sr.Role_Name
      FROM USER u
      JOIN PERSON p ON u.Person_ID = p.Person_ID
      JOIN SYSTEM_ROLE sr ON u.Role_ID = sr.Role_ID
      WHERE u.Person_ID = ?
    `, [id]);
    return rows[0];
  }

  // Get user by email (for login)
  static async getByEmail(email) {
    const [rows] = await db.query(`
      SELECT u.Person_ID, p.First_Name, p.Last_Name, p.Email, 
             u.Password, u.Department, u.Year, u.Role_ID, sr.Role_Name
      FROM USER u
      JOIN PERSON p ON u.Person_ID = p.Person_ID
      JOIN SYSTEM_ROLE sr ON u.Role_ID = sr.Role_ID
      WHERE p.Email = ?
    `, [email]);
    return rows[0];
  }

  // Create new user (with person record)
  static async create(userData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Create person record
      const [personResult] = await connection.query(
        'INSERT INTO PERSON (First_Name, Last_Name, Email, Phone, Person_Type) VALUES (?, ?, ?, ?, ?)',
        [userData.firstName, userData.lastName, userData.email, userData.phone || null, 'User']
      );
      
      const personId = personResult.insertId;

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user record
      await connection.query(
        'INSERT INTO USER (Person_ID, Department, Year, Password, Role_ID) VALUES (?, ?, ?, ?, ?)',
        [personId, userData.department || null, userData.year || null, hashedPassword, userData.roleId || 1003]
      );

      await connection.commit();
      return personId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update user
  static async update(id, userData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Update person info
      if (userData.firstName || userData.lastName || userData.email || userData.phone) {
        await connection.query(
          'UPDATE PERSON SET First_Name = COALESCE(?, First_Name), Last_Name = COALESCE(?, Last_Name), Email = COALESCE(?, Email), Phone = COALESCE(?, Phone) WHERE Person_ID = ?',
          [userData.firstName, userData.lastName, userData.email, userData.phone, id]
        );
      }

      // Update user info
      if (userData.department || userData.year || userData.roleId) {
        await connection.query(
          'UPDATE USER SET Department = COALESCE(?, Department), Year = COALESCE(?, Year), Role_ID = COALESCE(?, Role_ID) WHERE Person_ID = ?',
          [userData.department, userData.year, userData.roleId, id]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user's clubs
  static async getClubs(userId) {
    const [rows] = await db.query(`
      SELECT c.Club_ID, c.Club_Name, c.Description, c.Date_Established, c.STATUS,
             cm.Role, cm.Date_Joined, cm.Status as Membership_Status
      FROM CLUB_MEMBERSHIP cm
      JOIN CLUB c ON cm.Club_ID = c.Club_ID
      WHERE cm.Person_ID = ?
      ORDER BY cm.Date_Joined DESC
    `, [userId]);
    return rows;
  }
}

module.exports = User;
