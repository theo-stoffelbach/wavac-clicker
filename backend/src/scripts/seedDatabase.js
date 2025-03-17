const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Configuration de la connexion
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

// Fonction pour vider et recréer toutes les tables
const resetDatabase = async (client) => {
    try {
        console.log('Suppression de toutes les données existantes...');

        // Vider les tables sans les supprimer
        await client.query('TRUNCATE users, guilds, quests, upgrades, user_quests, user_upgrades CASCADE');
        console.log('Toutes les données ont été supprimées avec succès.');

        return true;
    } catch (error) {
        console.error('Erreur lors de la réinitialisation de la base de données:', error);
        return false;
    }
};

// Fonction pour créer des données de base
const seedDatabase = async (client) => {
    try {
        console.log('Création des données de base...');

        // 1. Créer les utilisateurs
        console.log('Création des utilisateurs...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        const testUserPassword = await bcrypt.hash('test123', 10);

        const insertAdminResult = await client.query(
            `INSERT INTO users (username, email, password, clicks, last_click_time, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            ['admin', 'admin@example.com', adminPassword, 1000, new Date(), new Date(), new Date()]
        );
        const adminId = insertAdminResult.rows[0].id;

        const insertTestUserResult = await client.query(
            `INSERT INTO users (username, email, password, clicks, last_click_time, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            ['testuser', 'test@example.com', testUserPassword, 100, new Date(), new Date(), new Date()]
        );
        const testUserId = insertTestUserResult.rows[0].id;

        // 2. Créer les guildes
        console.log('Création des guildes...');
        const insertGuild1Result = await client.query(
            `INSERT INTO guilds (name, description, owner_id, total_clicks, level, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            ['Les Cliqueurs Fous', 'Une guilde pour les cliqueurs passionnés', adminId, 2000, 2, new Date(), new Date()]
        );
        const guild1Id = insertGuild1Result.rows[0].id;

        const insertGuild2Result = await client.query(
            `INSERT INTO guilds (name, description, owner_id, total_clicks, level, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            ['Cliqueurs Débutants', 'Guilde pour les nouveaux joueurs', testUserId, 200, 1, new Date(), new Date()]
        );
        const guild2Id = insertGuild2Result.rows[0].id;

        // 3. Associer les utilisateurs aux guildes
        await client.query(
            `UPDATE users SET guild_id = $1 WHERE id = $2`,
            [guild1Id, adminId]
        );

        await client.query(
            `UPDATE users SET guild_id = $1 WHERE id = $2`,
            [guild2Id, testUserId]
        );

        // 4. Créer des améliorations
        console.log('Création des améliorations...');
        const insertUpgrade1Result = await client.query(
            `INSERT INTO upgrades (name, description, cost, click_value, duration, type, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            ['Double-clics', 'Double le nombre de clics pendant 30 secondes', 100, 2, 30, 'temporary', new Date(), new Date()]
        );
        const upgrade1Id = insertUpgrade1Result.rows[0].id;

        const insertUpgrade2Result = await client.query(
            `INSERT INTO upgrades (name, description, cost, click_value, duration, type, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            ['Auto-clic', 'Clique automatiquement 1 fois par seconde pendant 1 minute', 200, 1, 60, 'temporary', new Date(), new Date()]
        );
        const upgrade2Id = insertUpgrade2Result.rows[0].id;

        const insertUpgrade3Result = await client.query(
            `INSERT INTO upgrades (name, description, cost, click_value, duration, type, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            ['Bonus permanent', 'Augmente définitivement les clics de 10%', 500, 1, 0, 'permanent', new Date(), new Date()]
        );
        const upgrade3Id = insertUpgrade3Result.rows[0].id;

        // 5. Créer des quêtes
        console.log('Création des quêtes...');
        const insertQuest1Result = await client.query(
            `INSERT INTO quests (title, description, target_clicks, reward, type, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            ['Cliqueur novice', 'Atteindre 1000 clics', 1000, 100, 'personal', new Date(), new Date()]
        );
        const quest1Id = insertQuest1Result.rows[0].id;

        const insertQuest2Result = await client.query(
            `INSERT INTO quests (title, description, target_clicks, reward, type)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            ['Guilde ambitieuse', 'Atteindre 5000 clics collectifs', 5000, 500, 'guild']
        );
        const quest2Id = insertQuest2Result.rows[0].id;

        const insertQuest3Result = await client.query(
            `INSERT INTO quests (title, description, target_clicks, reward, type)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            ['Sprint quotidien', 'Atteindre 100 clics en une journée', 100, 50, 'daily']
        );
        const quest3Id = insertQuest3Result.rows[0].id;

        // 6. Associer les quêtes aux utilisateurs
        console.log('Association des quêtes aux utilisateurs...');
        await client.query(
            `INSERT INTO user_quests (user_id, quest_id, progress, completed)
             VALUES ($1, $2, $3, $4)`,
            [adminId, quest1Id, 1000, true]
        );

        await client.query(
            `INSERT INTO user_quests (user_id, quest_id, progress, completed)
             VALUES ($1, $2, $3, $4)`,
            [adminId, quest3Id, 50, false]
        );

        await client.query(
            `INSERT INTO user_quests (user_id, quest_id, progress, completed)
             VALUES ($1, $2, $3, $4)`,
            [testUserId, quest1Id, 100, false]
        );

        // 7. Associer des améliorations aux utilisateurs
        console.log('Association des améliorations aux utilisateurs...');
        await client.query(
            `INSERT INTO user_upgrades (user_id, upgrade_id, active, purchase_date)
             VALUES ($1, $2, $3, $4)`,
            [adminId, upgrade1Id, false, new Date()]
        );

        await client.query(
            `INSERT INTO user_upgrades (user_id, upgrade_id, active, purchase_date)
             VALUES ($1, $2, $3, $4)`,
            [adminId, upgrade3Id, true, new Date()]
        );

        console.log('Base de données peuplée avec succès!');
        return true;
    } catch (error) {
        console.error('Erreur lors du peuplement de la base de données:', error);
        return false;
    }
};

// Fonction principale
const initDatabase = async () => {
    const client = await pool.connect();
    try {
        // Test de connexion
        console.log('Connexion à la base de données établie avec succès.');

        await client.query('BEGIN');

        // Réinitialiser la base de données
        const resetSuccess = await resetDatabase(client);
        if (!resetSuccess) {
            console.error('Échec de la réinitialisation de la base de données. Arrêt du script.');
            await client.query('ROLLBACK');
            process.exit(1);
        }

        // Peupler la base de données
        const seedSuccess = await seedDatabase(client);
        if (!seedSuccess) {
            console.error('Échec du peuplement de la base de données. Arrêt du script.');
            await client.query('ROLLBACK');
            process.exit(1);
        }

        await client.query('COMMIT');
        console.log('Initialisation de la base de données terminée avec succès!');
        process.exit(0);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
        process.exit(1);
    } finally {
        client.release();
    }
};

// Exécuter le script
initDatabase(); 