const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Quest = sequelize.define('Quest', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM('daily', 'guild', 'main', 'duo'),
        defaultValue: 'daily',
    },
    targetClicks: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
    },
    reward: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
});

module.exports = Quest; 