const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserQuest = sequelize.define('UserQuest', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    questId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'user_quests',
    freezeTableName: true
});

module.exports = UserQuest; 