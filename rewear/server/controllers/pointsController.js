const { PointsTransaction, User, Item } = require('../models');

// Redeem item with points
const redeemItem = async (req, res) => {
    try {
        const { item_id } = req.params;
        const item = req.item; // From middleware

        // Check if user has enough points
        if (req.user.points < item.points_value) {
            return res.status(400).json({ 
                error: 'Insufficient points',
                required: item.points_value,
                available: req.user.points
            });
        }

        // Check if user is trying to redeem their own item
        if (item.uploader_id === req.user.id) {
            return res.status(400).json({ error: 'Cannot redeem your own item' });
        }

        // Deduct points from user
        await req.user.addPoints(-item.points_value, `Redeemed item: ${item.title}`);

        // Add points to item owner
        const itemOwner = await User.findByPk(item.uploader_id);
        await itemOwner.addPoints(item.points_value, `Item redeemed: ${item.title}`);

        // Update item status
        await item.update({ status: 'swapped' });

        res.json({
            message: 'Item redeemed successfully',
            pointsSpent: item.points_value,
            remainingPoints: req.user.points - item.points_value
        });
    } catch (error) {
        console.error('Redeem item error:', error);
        res.status(500).json({ error: 'Failed to redeem item' });
    }
};

// Get user's points transactions
const getPointsTransactions = async (req, res) => {
    try {
        const transactions = await PointsTransaction.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Item,
                as: 'item',
                attributes: ['id', 'title']
            }],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        res.json(transactions);
    } catch (error) {
        console.error('Get points transactions error:', error);
        res.status(500).json({ error: 'Failed to fetch points transactions' });
    }
};

// Get user's points balance
const getPointsBalance = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        res.json({
            points: user.points,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Get points balance error:', error);
        res.status(500).json({ error: 'Failed to fetch points balance' });
    }
};

// Admin: Add points to user
const addPointsToUser = async (req, res) => {
    try {
        const { user_id, amount, reason } = req.body;

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.addPoints(amount, reason);

        res.json({
            message: 'Points added successfully',
            user: {
                id: user.id,
                name: user.name,
                points: user.points
            }
        });
    } catch (error) {
        console.error('Add points error:', error);
        res.status(500).json({ error: 'Failed to add points' });
    }
};

// Get points leaderboard
const getPointsLeaderboard = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'points'],
            order: [['points', 'DESC']],
            limit: 10
        });

        res.json(users);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

module.exports = {
    redeemItem,
    getPointsTransactions,
    getPointsBalance,
    addPointsToUser,
    getPointsLeaderboard
}; 