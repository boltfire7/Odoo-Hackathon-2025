const express = require('express');
const { body } = require('express-validator');
const { isAuthenticated, isItemOwner, isItemAvailable } = require('../middlewares/auth');
const itemController = require('../controllers/itemController');

const router = express.Router();

// Validation middleware
const itemValidation = [
    body('title').trim().isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),
    body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('category').isIn(['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories', 'other']).withMessage('Invalid category'),
    body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']).withMessage('Invalid condition'),
    body('size').optional().isLength({ max: 50 }).withMessage('Size must be less than 50 characters'),
    body('points_value').optional().isInt({ min: 10, max: 500 }).withMessage('Points value must be between 10 and 500')
];

// Public routes
router.get('/', itemController.getAllItems);
router.get('/featured', itemController.getFeaturedItems);
router.get('/:id', itemController.getItemById);

// Protected routes
router.post('/', isAuthenticated, itemValidation, itemController.createItem);
router.put('/:id', isAuthenticated, isItemOwner, itemValidation, itemController.updateItem);
router.delete('/:id', isAuthenticated, isItemOwner, itemController.deleteItem);
router.get('/user/items', isAuthenticated, itemController.getUserItems);

module.exports = router; 