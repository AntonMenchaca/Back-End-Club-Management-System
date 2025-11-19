const Budget = require('../models/Budget');

const getAllBudgets = async (req, res) => {
  try {
    const filters = {
      clubId: req.query.clubId,
      academicYear: req.query.academicYear
    };
    
    const budgets = await Budget.getAll(filters);
    
    res.status(200).json({
      status: 'success',
      results: budgets.length,
      data: budgets
    });
  } catch (error) {
    console.error('Get all budgets error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.getById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        status: 'error',
        message: 'Budget not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: budget
    });
  } catch (error) {
    console.error('Get budget by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const createBudget = async (req, res) => {
  try {
    const budgetData = {
      clubId: req.body.clubId,
      academicYear: req.body.academicYear,
      totalAllocated: req.body.totalAllocated
    };
    
    const budgetId = await Budget.create(budgetData);
    const budget = await Budget.getById(budgetId);
    
    res.status(201).json({
      status: 'success',
      data: budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.getById(req.params.id);
    
    if (!budget) {
      return res.status(404).json({
        status: 'error',
        message: 'Budget not found'
      });
    }
    
    await Budget.update(req.params.id, {
      totalAllocated: req.body.totalAllocated
    });
    
    const updatedBudget = await Budget.getById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: updatedBudget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getExpenditures = async (req, res) => {
  try {
    const expenditures = await Budget.getExpenditures(req.params.id);
    
    res.status(200).json({
      status: 'success',
      results: expenditures.length,
      data: expenditures
    });
  } catch (error) {
    console.error('Get expenditures error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const addExpenditure = async (req, res) => {
  try {
    const expenditureData = {
      expenseDescription: req.body.expenseDescription,
      amount: req.body.amount,
      requestExpenseDate: req.body.requestExpenseDate,
      status: req.body.status || 'Pending'
    };
    
    const expenditureId = await Budget.addExpenditure(
      req.params.id,
      expenditureData
    );
    
    const expenditure = await Budget.getExpenditureById(expenditureId);
    
    res.status(201).json({
      status: 'success',
      data: expenditure
    });
  } catch (error) {
    console.error('Add expenditure error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const updateExpenditureStatus = async (req, res) => {
  try {
    const expenditure = await Budget.getExpenditureById(req.params.expenditureId);
    
    if (!expenditure) {
      return res.status(404).json({
        status: 'error',
        message: 'Expenditure not found'
      });
    }
    
    await Budget.updateExpenditureStatus(
      req.params.expenditureId,
      req.body.status,
      req.params.id
    );
    
    const updatedExpenditure = await Budget.getExpenditureById(req.params.expenditureId);
    
    res.status(200).json({
      status: 'success',
      data: updatedExpenditure
    });
  } catch (error) {
    console.error('Update expenditure status error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  getExpenditures,
  addExpenditure,
  updateExpenditureStatus
};

