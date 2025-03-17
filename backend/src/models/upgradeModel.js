const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Upgrade = sequelize.define('Upgrade', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    clickValue: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    duration: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // 0 signifie permanent, sinon en secondes
    },
    type: {
        type: DataTypes.ENUM('permanent', 'temporary'),
        defaultValue: 'permanent',
    },
}, {
    timestamps: true,
    tableName: 'upgrades',
    freezeTableName: true
});

module.exports = Upgrade; 