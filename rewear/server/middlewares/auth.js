const passport = require('passport');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.is_admin) {
        return next();
    }
    res.status(403).json({ error: 'Admin access required' });
};

// Middleware to check if user owns the item
const isItemOwner = async (req, res, next) => {
    try {
        const { Item } = require('../models');
        const item = await Item.findByPk(req.params.id);
        
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        if (item.uploader_id !== req.user.id && !req.user.is_admin) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        req.item = item;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Middleware to check if item is available
const isItemAvailable = async (req, res, next) => {
    try {
        const { Item } = require('../models');
        const item = await Item.findByPk(req.params.id);
        
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        if (item.status !== 'available') {
            return res.status(400).json({ error: 'Item is not available for swap' });
        }
        
        req.item = item;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isItemOwner,
    isItemAvailable
}; 