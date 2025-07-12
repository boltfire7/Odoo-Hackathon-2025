const express = require('express');
const { isAuthenticated, isAdmin, isItemAvailable } = require('../middlewares/auth');
const pointsController = require('../controllers/pointsController');

const router = express.Router();

// User routes (require authentication)
router.use(isAuthenticated);

// Points redemption
router.post('/items/:item_id/redeem', isItemAvailable, pointsController.redeemItem);

// Get user's points data
router.get('/balance', pointsController.getPointsBalance);
router.get('/transactions', pointsController.getPointsTransactions);

// Public leaderboard
router.get('/leaderboard', pointsController.getPointsLeaderboard);

// Admin routes (require admin access)
router.post('/admin/add-points', isAdmin, pointsController.addPointsToUser);

module.exports = router; 