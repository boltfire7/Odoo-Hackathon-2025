const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Item = sequelize.define('Item', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        images: {
            type: DataTypes.TEXT,
            defaultValue: '[]',
            get() {
                const rawValue = this.getDataValue('images');
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(value) {
                this.setDataValue('images', JSON.stringify(value));
            }
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        size: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        condition: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                isIn: [['new', 'like-new', 'good', 'fair', 'poor']]
            }
        },
        tags: {
            type: DataTypes.TEXT,
            defaultValue: '[]',
            get() {
                const rawValue = this.getDataValue('tags');
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(value) {
                this.setDataValue('tags', JSON.stringify(value));
            }
        },
        uploader_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.STRING(20),
            defaultValue: 'available',
            validate: {
                isIn: [['available', 'swapped', 'pending']]
            }
        },
        points_value: {
            type: DataTypes.INTEGER,
            defaultValue: 50
        }
    }, {
        tableName: 'items',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Item;
}; 