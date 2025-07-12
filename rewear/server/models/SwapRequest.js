const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SwapRequest = sequelize.define('SwapRequest', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'items',
                key: 'id'
            }
        },
        requester_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING(20),
            defaultValue: 'pending',
            validate: {
                isIn: [['pending', 'approved', 'completed', 'rejected']]
            }
        }
    }, {
        tableName: 'swap_requests',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return SwapRequest;
}; 