const User = require('./userModel');
const Guild = require('./guildModel');
const Quest = require('./questModel');
const Upgrade = require('./upgradeModel');
const UserQuest = require('./userQuestModel');
const UserUpgrade = require('./userUpgradeModel');

// Relations User <-> Guild
User.belongsTo(Guild, { foreignKey: 'guild_id' });
Guild.hasMany(User, { foreignKey: 'guild_id' });

// Relation Guild -> Owner (User)
Guild.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });

// Relations User <-> Quest via UserQuest
User.belongsToMany(Quest, { through: UserQuest, foreignKey: 'userId' });
Quest.belongsToMany(User, { through: UserQuest, foreignKey: 'questId' });
UserQuest.belongsTo(User, { foreignKey: 'userId' });
UserQuest.belongsTo(Quest, { foreignKey: 'questId' });

// Relations User <-> Upgrade via UserUpgrade
User.belongsToMany(Upgrade, { through: UserUpgrade, foreignKey: 'userId' });
Upgrade.belongsToMany(User, { through: UserUpgrade, foreignKey: 'upgradeId' });
UserUpgrade.belongsTo(User, { foreignKey: 'userId' });
UserUpgrade.belongsTo(Upgrade, { foreignKey: 'upgradeId' });

module.exports = {
    User,
    Guild,
    Quest,
    Upgrade,
    UserQuest,
    UserUpgrade,
}; 