const { SwapRequest, Item, User, PointsTransaction } = require('../models');

// Create swap request
const createSwapRequest = async (req, res) => {
    try {
        const { item_id } = req.params;
        const item = req.item; // From middleware

        // Check if user is trying to swap their own item
        if (item.uploader_id === req.user.id) {
            return res.status(400).json({ error: 'Cannot swap your own item' });
        }

        // Check if user already has a pending request for this item
        const existingRequest = await SwapRequest.findOne({
            where: {
                item_id,
                requester_id: req.user.id,
                status: 'pending'
            }
        });

        if (existingRequest) {
            return res.status(400).json({ error: 'You already have a pending request for this item' });
        }

        // Create swap request
        const swapRequest = await SwapRequest.create({
            item_id,
            requester_id: req.user.id,
            status: 'pending'
        });

        res.status(201).json({
            message: 'Swap request created successfully',
            swapRequest
        });
    } catch (error) {
        console.error('Create swap request error:', error);
        res.status(500).json({ error: 'Failed to create swap request' });
    }
};

// Approve swap request
const approveSwapRequest = async (req, res) => {
    try {
        const { request_id } = req.params;
        const swapRequest = await SwapRequest.findByPk(request_id, {
            include: [{ model: Item, as: 'item' }]
        });

        if (!swapRequest) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        // Check if user owns the item
        if (swapRequest.item.uploader_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Update swap request status
        await swapRequest.update({ status: 'approved' });

        // Update item status
        await swapRequest.item.update({ status: 'swapped' });

        // Award points to both users
        const requester = await User.findByPk(swapRequest.requester_id);
        const itemOwner = await User.findByPk(swapRequest.item.uploader_id);

        await requester.addPoints(swapRequest.item.points_value, `Received item: ${swapRequest.item.title}`);
        await itemOwner.addPoints(swapRequest.item.points_value, `Item swapped: ${swapRequest.item.title}`);

        res.json({
            message: 'Swap request approved successfully',
            swapRequest
        });
    } catch (error) {
        console.error('Approve swap request error:', error);
        res.status(500).json({ error: 'Failed to approve swap request' });
    }
};

// Reject swap request
const rejectSwapRequest = async (req, res) => {
    try {
        const { request_id } = req.params;
        const swapRequest = await SwapRequest.findByPk(request_id, {
            include: [{ model: Item, as: 'item' }]
        });

        if (!swapRequest) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        // Check if user owns the item
        if (swapRequest.item.uploader_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await swapRequest.update({ status: 'rejected' });

        res.json({
            message: 'Swap request rejected successfully',
            swapRequest
        });
    } catch (error) {
        console.error('Reject swap request error:', error);
        res.status(500).json({ error: 'Failed to reject swap request' });
    }
};

// Complete swap request
const completeSwapRequest = async (req, res) => {
    try {
        const { request_id } = req.params;
        const swapRequest = await SwapRequest.findByPk(request_id, {
            include: [{ model: Item, as: 'item' }]
        });

        if (!swapRequest) {
            return res.status(404).json({ error: 'Swap request not found' });
        }

        if (swapRequest.status !== 'approved') {
            return res.status(400).json({ error: 'Swap request must be approved first' });
        }

        await swapRequest.update({ status: 'completed' });

        res.json({
            message: 'Swap completed successfully',
            swapRequest
        });
    } catch (error) {
        console.error('Complete swap request error:', error);
        res.status(500).json({ error: 'Failed to complete swap request' });
    }
};

// Get user's swap requests
const getUserSwapRequests = async (req, res) => {
    try {
        const requests = await SwapRequest.findAll({
            where: { requester_id: req.user.id },
            include: [{
                model: Item,
                as: 'item',
                include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }]
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        console.error('Get user swap requests error:', error);
        res.status(500).json({ error: 'Failed to fetch swap requests' });
    }
};

// Get pending swap requests for user's items
const getPendingSwapRequests = async (req, res) => {
    try {
        const requests = await SwapRequest.findAll({
            include: [{
                model: Item,
                as: 'item',
                where: { uploader_id: req.user.id }
            }, {
                model: User,
                as: 'requester',
                attributes: ['id', 'name']
            }],
            where: { status: 'pending' },
            order: [['created_at', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        console.error('Get pending swap requests error:', error);
        res.status(500).json({ error: 'Failed to fetch pending swap requests' });
    }
};

module.exports = {
    createSwapRequest,
    approveSwapRequest,
    rejectSwapRequest,
    completeSwapRequest,
    getUserSwapRequests,
    getPendingSwapRequests
}; 