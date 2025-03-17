const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserUpgrade = sequelize.define('UserUpgrade', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    upgradeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    activatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
});

module.exports = UserUpgrade; 