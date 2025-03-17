const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');

// Configuration de la connexion
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

// Requêtes SQL pour créer les tables
const createTableQueries = [
    // Table users
    `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        clicks INTEGER DEFAULT 0,
        guild_id INTEGER NULL,
        last_click_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Table guilds
    `CREATE TABLE IF NOT EXISTS guilds (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        level INTEGER DEFAULT 1,
        total_clicks INTEGER DEFAULT 0,
        owner_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Table quests
    `CREATE TABLE IF NOT EXISTS quests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        type VARCHAR(20) DEFAULT 'daily',
        target_clicks INTEGER DEFAULT 100,
        reward INTEGER DEFAULT 50,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Table upgrades
    `CREATE TABLE IF NOT EXISTS upgrades (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        cost INTEGER NOT NULL,
        click_value INTEGER DEFAULT 1,
        duration INTEGER DEFAULT 0,
        type VARCHAR(20) DEFAULT 'permanent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Table user_quests
    `CREATE TABLE IF NOT EXISTS user_quests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        quest_id INTEGER NOT NULL,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Table user_upgrades
    `CREATE TABLE IF NOT EXISTS user_upgrades (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        upgrade_id INTEGER NOT NULL,
        active BOOLEAN DEFAULT FALSE,
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
];

// Fonction pour créer les tables
async function createTables() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Création des tables...');
        for (const query of createTableQueries) {
            console.log('Exécution de la requête:', query.substring(0, 60) + '...');
            await client.query(query);
        }

        await client.query('COMMIT');
        console.log('Toutes les tables ont été créées avec succès!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur lors de la création des tables:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Exécuter la création des tables
createTables()
    .then(() => {
        console.log('Script terminé avec succès');
        process.exit(0);
    })
    .catch(error => {
        console.error('Erreur lors de l\'exécution du script:', error);
        process.exit(1);
    }); 