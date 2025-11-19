const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', budgetController.getAllBudgets);
router.get('/:id', budgetController.getBudgetById);
router.get('/:id/expenditures', budgetController.getExpenditures);

// Protected routes
router.post('/', authenticateToken, budgetController.createBudget);
router.put('/:id', authenticateToken, budgetController.updateBudget);
router.post('/:id/expenditures', authenticateToken, budgetController.addExpenditure);
router.put('/:id/expenditures/:expenditureId/status', authenticateToken, budgetController.updateExpenditureStatus);

module.exports = router;

