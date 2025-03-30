import Database from './Database.js';

(async () => {
    try {
        const db = Database.getInstance();

        // Optionnel : Supprimer d'abord toutes les tables pour repartir d'une base propre
        await db.destroyAll();

        // Créer à nouveau toutes les tables
        await db.createAllTable();

        // Insertion d'exemples dans la table guilds
        const guildResult = await db.query(`
      INSERT INTO guilds (name, description)
      VALUES ('Guilde des Aventuriers', 'Une guilde pour les aventuriers intrépides')
      RETURNING id;
    `);
        const guildId = guildResult.rows[0].id;

        // Insertion d'un utilisateur dans la table users
        const userResult = await db.query(`
      INSERT INTO users (username, email, password_hash, guild_id)
      VALUES ('utilisateur1', 'user1@example.com', 'hash_mdp', $1)
      RETURNING id;
    `, [guildId]);
        const userId = userResult.rows[0].id;

        // Insertion d'une quête dans la table quests
        const questResult = await db.query(`
      INSERT INTO quests (title, description, type, reward_points, duration_seconds)
      VALUES ('Quête d\'initiation', 'Accomplissez votre première quête', 'quotidienne', 100, 3600)
      RETURNING id;
    `);
        const questId = questResult.rows[0].id;

        // Association de la quête à l'utilisateur dans la table user_quests
        await db.query(`
      INSERT INTO user_quests (user_id, quest_id, status)
      VALUES ($1, $2, 'en cours');
    `, [userId, questId]);

        // Insertion d'une amélioration dans la table upgrades
        const upgradeResult = await db.query(`
      INSERT INTO upgrades (name, description, effect_type, effect_value, price)
      VALUES ('Upgrade de base', 'Amélioration de départ', 'bonus_click', 10, 50)
      RETURNING id;
    `);
        const upgradeId = upgradeResult.rows[0].id;

        // Association de l'amélioration à l'utilisateur dans la table user_upgrades
        await db.query(`
      INSERT INTO user_upgrades (user_id, upgrade_number, upgrade_id)
      VALUES ($1, 1, $2);
    `, [userId, upgradeId]);

        // Insertion d'un objet consommable dans la table consumables
        const consumableResult = await db.query(`
      INSERT INTO consumables (name, description, effect_type, effect_value, duration_seconds, price)
      VALUES ('Potion de Force', 'Augmente la force temporairement', 'boost_click', 5, 1800, 20)
      RETURNING id;
    `);
        const consumableId = consumableResult.rows[0].id;

        // Association de l'objet consommable à l'utilisateur dans la table user_consumables
        await db.query(`
      INSERT INTO user_consumables (user_id, consumable_id)
      VALUES ($1, $2);
    `, [userId, consumableId]);

        // Insertion de statistiques pour l'utilisateur dans la table user_stats
        await db.query(`
      INSERT INTO user_stats (user_id, total_clicks, clicks_per_second, points, days_ahead_bonus)
      VALUES ($1, 100, 5, 200, 1);
    `, [userId]);

        console.log('✅ Peuplement effectué avec succès.');
        await db.client.end();
    } catch (error) {
        console.error('❌ Erreur lors du peuplement de la base de données :', error);
        process.exit(1);
    }
})();
