const express = require('express');
const { isAuthenticated, isItemAvailable } = require('../middlewares/auth');
const swapController = require('../controllers/swapController');

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Swap request routes
router.post('/items/:item_id/request', isItemAvailable, swapController.createSwapRequest);
router.put('/requests/:request_id/approve', swapController.approveSwapRequest);
router.put('/requests/:request_id/reject', swapController.rejectSwapRequest);
router.put('/requests/:request_id/complete', swapController.completeSwapRequest);

// Get user's swap requests
router.get('/user/requests', swapController.getUserSwapRequests);
router.get('/user/pending-requests', swapController.getPendingSwapRequests);

module.exports = router; 