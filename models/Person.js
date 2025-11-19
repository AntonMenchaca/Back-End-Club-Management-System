const db = require('../config/database');

class Person {
  // Get person by ID
  static async getById(id) {
    const [rows] = await db.query(
      'SELECT * FROM PERSON WHERE Person_ID = ?',
      [id]
    );
    return rows[0];
  }

  // Get person by email
  static async getByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM PERSON WHERE Email = ?',
      [email]
    );
    return rows[0];
  }

  // Create person
  static async create(personData) {
    const [result] = await db.query(
      'INSERT INTO PERSON (First_Name, Last_Name, Email, Phone, Person_Type) VALUES (?, ?, ?, ?, ?)',
      [
        personData.firstName,
        personData.lastName,
        personData.email,
        personData.phone || null,
        personData.personType || 'User'
      ]
    );
    return result.insertId;
  }

  // Update person
  static async update(id, personData) {
    await db.query(
      'UPDATE PERSON SET First_Name = COALESCE(?, First_Name), Last_Name = COALESCE(?, Last_Name), Email = COALESCE(?, Email), Phone = COALESCE(?, Phone) WHERE Person_ID = ?',
      [
        personData.firstName,
        personData.lastName,
        personData.email,
        personData.phone,
        id
      ]
    );
    return true;
  }

  // Delete person
  static async delete(id) {
    await db.query('DELETE FROM PERSON WHERE Person_ID = ?', [id]);
    return true;
  }

  // Get all persons
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM PERSON ORDER BY Person_ID');
    return rows;
  }
}

module.exports = Person;

