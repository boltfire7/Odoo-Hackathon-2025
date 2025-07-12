const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AdminLog = sequelize.define('AdminLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        item_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'items',
                key: 'id'
            }
        },
        admin_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        details: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'admin_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return AdminLog;
}; 