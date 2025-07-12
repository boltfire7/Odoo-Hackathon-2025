const { User } = require('../models');
const { validationResult } = require('express-validator');

// Register new user
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password_hash: password // Will be hashed by model hook
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                points: user.points
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await user.checkPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Log in user
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Login failed' });
            }
            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    points: user.points,
                    is_admin: user.is_admin
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// Logout user
const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
};

// Get current user
const getCurrentUser = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json({
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            points: req.user.points,
            is_admin: req.user.is_admin
        }
    });
};

// Google OAuth callback
const googleCallback = (req, res) => {
    // Redirect to frontend after successful Google login
    res.redirect('/dashboard');
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    googleCallback
}; 