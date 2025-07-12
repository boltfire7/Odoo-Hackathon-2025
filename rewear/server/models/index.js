const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration - Using SQLite for development
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database/rewear.db',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Import models
const User = require('./User')(sequelize);
const Item = require('./Item')(sequelize);
const SwapRequest = require('./SwapRequest')(sequelize);
const PointsTransaction = require('./PointsTransaction')(sequelize);
const AdminLog = require('./AdminLog')(sequelize);

// Define associations
User.hasMany(Item, { foreignKey: 'uploader_id', as: 'items' });
Item.belongsTo(User, { foreignKey: 'uploader_id', as: 'uploader' });

User.hasMany(SwapRequest, { foreignKey: 'requester_id', as: 'swapRequests' });
SwapRequest.belongsTo(User, { foreignKey: 'requester_id', as: 'requester' });

Item.hasMany(SwapRequest, { foreignKey: 'item_id', as: 'swapRequests' });
SwapRequest.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

User.hasMany(PointsTransaction, { foreignKey: 'user_id', as: 'pointsTransactions' });
PointsTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Item.hasMany(PointsTransaction, { foreignKey: 'item_id', as: 'pointsTransactions' });
PointsTransaction.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

User.hasMany(AdminLog, { foreignKey: 'admin_id', as: 'adminLogs' });
AdminLog.belongsTo(User, { foreignKey: 'admin_id', as: 'admin' });

Item.hasMany(AdminLog, { foreignKey: 'item_id', as: 'adminLogs' });
AdminLog.belongsTo(Item, { foreignKey: 'item_id', as: 'item' });

// Test database connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
}

module.exports = {
    sequelize,
    User,
    Item,
    SwapRequest,
    PointsTransaction,
    AdminLog,
    testConnection
}; 