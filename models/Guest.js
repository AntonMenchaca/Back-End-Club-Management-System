const db = require('../config/database');

class Guest {
  // Create guest (creates Person and Guest records)
  static async create(guestData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Create person record
      const [personResult] = await connection.query(
        'INSERT INTO PERSON (First_Name, Last_Name, Email, Phone, Person_Type) VALUES (?, ?, ?, ?, ?)',
        [
          guestData.firstName,
          guestData.lastName,
          guestData.email,
          guestData.phone || null,
          'Guest'
        ]
      );
      
      const personId = personResult.insertId;

      // Create guest record
      await connection.query(
        'INSERT INTO GUEST (Person_ID, Organization) VALUES (?, ?)',
        [personId, guestData.organization || null]
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

  // Get guest by Person ID
  static async getByPersonId(personId) {
    const [rows] = await db.query(`
      SELECT g.Person_ID, g.Organization,
             p.First_Name, p.Last_Name, p.Email, p.Phone, p.Person_Type
      FROM GUEST g
      JOIN PERSON p ON g.Person_ID = p.Person_ID
      WHERE g.Person_ID = ?
    `, [personId]);
    return rows[0];
  }
}

module.exports = Guest;

