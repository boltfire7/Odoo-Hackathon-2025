const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'rewear.db'),
    logging: false
});

async function initializeDatabase() {
    try {
        console.log('🔄 Initializing ReWear database...');
        
        // Import models
        const User = require('../server/models/User')(sequelize);
        const Item = require('../server/models/Item')(sequelize);
        const SwapRequest = require('../server/models/SwapRequest')(sequelize);
        const PointsTransaction = require('../server/models/PointsTransaction')(sequelize);
        const AdminLog = require('../server/models/AdminLog')(sequelize);

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

        // Sync database (create tables)
        await sequelize.sync({ force: true });
        
        // Create default admin user
        const bcrypt = require('bcryptjs');
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        await User.create({
            name: 'Admin',
            email: 'admin@rewear.com',
            password_hash: adminPassword,
            is_admin: true,
            points: 1000
        });
        
        console.log('✅ Database initialized successfully!');
        console.log('📊 Tables created:');
        console.log('   - users');
        console.log('   - items');
        console.log('   - swap_requests');
        console.log('   - points_transactions');
        console.log('   - admin_logs');
        console.log('\n🔑 Default admin account:');
        console.log('   Email: admin@rewear.com');
        console.log('   Password: admin123');
        
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase }; 