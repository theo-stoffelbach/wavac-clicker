const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Guild = sequelize.define('Guild', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    totalClicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Guild; 