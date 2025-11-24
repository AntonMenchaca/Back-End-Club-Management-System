const db = require('../config/database');

class Budget {
  // Get all budgets with optional filters
  static async getAll(filters = {}) {
    let query = `
      SELECT b.Budget_ID, b.Club_ID, b.Academic_Year, 
             b.Total_Allocated, b.Total_Spent,
             (b.Total_Allocated - b.Total_Spent) as Remaining,
             c.Club_Name
      FROM BUDGET b
      LEFT JOIN CLUB c ON b.Club_ID = c.Club_ID
    `;
    
    const conditions = [];
    const params = [];

    if (filters.clubId) {
      conditions.push('b.Club_ID = ?');
      params.push(filters.clubId);
    }

    if (filters.academicYear) {
      conditions.push('b.Academic_Year = ?');
      params.push(filters.academicYear);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY b.Academic_Year DESC, b.Club_ID';

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get budget by ID
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT b.Budget_ID, b.Club_ID, b.Academic_Year, 
             b.Total_Allocated, b.Total_Spent,
             (b.Total_Allocated - b.Total_Spent) as Remaining,
             c.Club_Name
      FROM BUDGET b
      LEFT JOIN CLUB c ON b.Club_ID = c.Club_ID
      WHERE b.Budget_ID = ?
    `, [id]);
    return rows[0];
  }

  // Get budget by club and academic year
  static async getByClubAndYear(clubId, academicYear) {
    const [rows] = await db.query(`
      SELECT b.Budget_ID, b.Club_ID, b.Academic_Year, 
             b.Total_Allocated, b.Total_Spent,
             (b.Total_Allocated - b.Total_Spent) as Remaining,
             c.Club_Name
      FROM BUDGET b
      LEFT JOIN CLUB c ON b.Club_ID = c.Club_ID
      WHERE b.Club_ID = ? AND b.Academic_Year = ?
    `, [clubId, academicYear]);
    return rows[0];
  }

  // Create budget
  static async create(budgetData) {
    const [result] = await db.query(
      'INSERT INTO BUDGET (Club_ID, Academic_Year, Total_Allocated, Total_Spent) VALUES (?, ?, ?, ?)',
      [
        budgetData.clubId,
        budgetData.academicYear,
        budgetData.totalAllocated || 500.00,
        0.00
      ]
    );
    return result.insertId;
  }

  // Update budget
  static async update(id, budgetData) {
    await db.query(
      'UPDATE BUDGET SET Total_Allocated = COALESCE(?, Total_Allocated) WHERE Budget_ID = ?',
      [budgetData.totalAllocated, id]
    );
    return true;
  }

  // Update total spent (called when expenditure is approved)
  static async updateTotalSpent(budgetId, amount) {
    await db.query(
      'UPDATE BUDGET SET Total_Spent = Total_Spent + ? WHERE Budget_ID = ?',
      [amount, budgetId]
    );
    return true;
  }

  // Get expenditures for budget
  static async getExpenditures(budgetId) {
    const [rows] = await db.query(
      'SELECT * FROM EXPENDITURE WHERE Budget_ID = ? ORDER BY Request_Expense_Date DESC',
      [budgetId]
    );
    return rows;
  }

  // Add expenditure
  static async addExpenditure(budgetId, expenditureData) {
    const [result] = await db.query(
      'INSERT INTO EXPENDITURE (Budget_ID, Expense_Description, Amount, Request_Expense_Date, Status) VALUES (?, ?, ?, ?, ?)',
      [
        budgetId,
        expenditureData.expenseDescription,
        expenditureData.amount,
        expenditureData.requestExpenseDate || new Date().toISOString().split('T')[0],
        expenditureData.status || 'Pending'
      ]
    );
    return result.insertId;
  }

  // Update expenditure status
  static async updateExpenditureStatus(expenditureId, status, budgetId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Update expenditure status
      await connection.query(
        'UPDATE EXPENDITURE SET Status = ? WHERE Expenditure_ID = ?',
        [status, expenditureId]
      );

      // If approved, update budget total spent
      if (status === 'Approved') {
        const [expenditure] = await connection.query(
          'SELECT Amount FROM EXPENDITURE WHERE Expenditure_ID = ?',
          [expenditureId]
        );
        
        if (expenditure[0]) {
          await connection.query(
            'UPDATE BUDGET SET Total_Spent = Total_Spent + ? WHERE Budget_ID = ?',
            [expenditure[0].Amount, budgetId]
          );
        }
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

  // Get expenditure by ID
  static async getExpenditureById(expenditureId) {
    const [rows] = await db.query(
      'SELECT * FROM EXPENDITURE WHERE Expenditure_ID = ?',
      [expenditureId]
    );
    return rows[0];
  }

  // Get all pending expenditure requests with club and budget info
  static async getAllPendingExpenditures() {
    const [rows] = await db.query(`
      SELECT e.Expenditure_ID, e.Budget_ID, e.Expense_Description, e.Amount, 
             e.Request_Expense_Date, e.Status,
             b.Club_ID, b.Academic_Year,
             c.Club_Name
      FROM EXPENDITURE e
      JOIN BUDGET b ON e.Budget_ID = b.Budget_ID
      JOIN CLUB c ON b.Club_ID = c.Club_ID
      WHERE e.Status = 'Pending'
      ORDER BY e.Request_Expense_Date DESC
    `);
    return rows;
  }
}

module.exports = Budget;

