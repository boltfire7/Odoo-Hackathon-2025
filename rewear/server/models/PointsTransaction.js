const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PointsTransaction = sequelize.define('PointsTransaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'items',
                key: 'id'
            }
        }
    }, {
        tableName: 'points_transactions',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return PointsTransaction;
}; 