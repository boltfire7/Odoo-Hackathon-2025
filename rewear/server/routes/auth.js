const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middlewares/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/me', isAuthenticated, authController.getCurrentUser);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.googleCallback);

module.exports = router; 