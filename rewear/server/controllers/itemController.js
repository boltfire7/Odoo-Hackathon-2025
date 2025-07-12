const { Item, User, SwapRequest } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Get all items with pagination and filters
const getAllItems = async (req, res) => {
    try {
        const { page = 1, limit = 12, category, search, status = 'available' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = { status };
        if (category) whereClause.category = category;
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                { tags: { [Op.overlap]: [search] } }
            ];
        }

        const items = await Item.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'uploader',
                attributes: ['id', 'name']
            }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            items: items.rows,
            total: items.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(items.count / limit)
        });
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
};

// Get single item by ID
const getItemById = async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'uploader',
                attributes: ['id', 'name']
            }]
        });

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
};

// Create new item
const createItem = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, category, size, condition, tags, points_value } = req.body;
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const item = await Item.create({
            title,
            description,
            images,
            category,
            size,
            condition,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploader_id: req.user.id,
            points_value: points_value || 50
        });

        res.status(201).json({
            message: 'Item created successfully',
            item
        });
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ error: 'Failed to create item' });
    }
};

// Update item
const updateItem = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, category, size, condition, tags, points_value } = req.body;
        const item = req.item; // From middleware

        // Handle new images if uploaded
        let images = item.images;
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/${file.filename}`);
            images = [...images, ...newImages];
        }

        await item.update({
            title,
            description,
            images,
            category,
            size,
            condition,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : item.tags,
            points_value: points_value || item.points_value
        });

        res.json({
            message: 'Item updated successfully',
            item
        });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
};

// Delete item
const deleteItem = async (req, res) => {
    try {
        const item = req.item; // From middleware
        await item.destroy();

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
};

// Get user's items
const getUserItems = async (req, res) => {
    try {
        const items = await Item.findAll({
            where: { uploader_id: req.user.id },
            order: [['created_at', 'DESC']]
        });

        res.json(items);
    } catch (error) {
        console.error('Get user items error:', error);
        res.status(500).json({ error: 'Failed to fetch user items' });
    }
};

// Get featured items (newest and most popular)
const getFeaturedItems = async (req, res) => {
    try {
        const newestItems = await Item.findAll({
            where: { status: 'available' },
            include: [{
                model: User,
                as: 'uploader',
                attributes: ['id', 'name']
            }],
            order: [['created_at', 'DESC']],
            limit: 6
        });

        res.json({
            newest: newestItems.slice(0, 3),
            popular: newestItems.slice(3, 6) // For now, just showing more recent items
        });
    } catch (error) {
        console.error('Get featured items error:', error);
        res.status(500).json({ error: 'Failed to fetch featured items' });
    }
};

module.exports = {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    getUserItems,
    getFeaturedItems
}; 