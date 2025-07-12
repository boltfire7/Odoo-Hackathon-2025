const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 100
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        google_id: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (user) => {
                if (user.password_hash && !user.password_hash.startsWith('$2a$')) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash') && !user.password_hash.startsWith('$2a$')) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 10);
                }
            }
        }
    });

    // Instance method to check password
    User.prototype.checkPassword = async function(password) {
        return await bcrypt.compare(password, this.password_hash);
    };

    // Instance method to add points
    User.prototype.addPoints = async function(amount, reason) {
        this.points += amount;
        await this.save();
        
        // Create points transaction record
        const PointsTransaction = sequelize.models.PointsTransaction;
        await PointsTransaction.create({
            user_id: this.id,
            amount: amount,
            reason: reason
        });
    };

    return User;
}; 