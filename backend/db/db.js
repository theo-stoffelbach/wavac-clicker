import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;

dotenv.config();

const urlDB = process.env.DATABASE_URL;

class Database {
    static instance;
    client;

    constructor() {
        this.connect();
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect() {
        if (this.client) {
            await this.client.end();
        }
        this.client = new Client(urlDB);

        this.client.on('error', (err) => {
            console.error('Erreur de connexion à la base de données :', err.stack);
        });

        try {
            await this.client.connect();
            console.log('Connexion à la base de données réussie');
            // Décommenter les lignes ci-dessous pour détruire puis recréer les tables
            // await this.destroyAll();
            // await this.createAllTable();
        } catch (error) {
            console.error('Échec de la connexion à la base de données :', error);
        }
    }

    getClient() {
        return this.client;
    }

    async query(text, params) {
        try {
            return await this.client.query(text, params);
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la requête :', error);
            throw error;
        }
    }

    // async createAllTable() {
    //     try {
    //         // Démarrer une transaction
    //         await this.query('BEGIN');

    //         // Création de la table guilds
    //         await this.query(`
    //             CREATE TABLE IF NOT EXISTS guilds (
    //                 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //                 name VARCHAR(255) UNIQUE NOT NULL,
    //                 description TEXT,
    //                 created_at TIMESTAMPTZ DEFAULT current_timestamp()
    //             );
    //         `);
    //         await this.query(`CREATE INDEX IF NOT EXISTS idx_guilds_name ON guilds (name);`);

    //         // Création de la table users
    //         await this.query(`
    //             CREATE TABLE IF NOT EXISTS users (
    //                 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //                 username VARCHAR(255) UNIQUE NOT NULL,
    //                 email VARCHAR(255) UNIQUE NOT NULL,
    //                 password_hash VARCHAR(255) NOT NULL,
    //                 created_at TIMESTAMPTZ DEFAULT current_timestamp(),
    //                 last_login TIMESTAMPTZ,
    //                 guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL
    //             );
    //         `);
    //         await this.query(`CREATE INDEX IF NOT EXISTS idx_users_last_login ON users (last_login);`);

    //         // Création de la table quests
    //         await this.query(`
    //             CREATE TABLE IF NOT EXISTS quests (
    //                 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //                 title VARCHAR(255) NOT NULL,
    //                 description TEXT NOT NULL,
    //                 type VARCHAR(50) CHECK (type IN ('quotidienne', 'guilde', 'principale', 'duo')) NOT NULL,
    //                 reward_points INT NOT NULL,
    //                 duration_seconds INT NOT NULL,
    //                 created_at TIMESTAMPTZ DEFAULT current_timestamp()
    //             );
    //         `);

    //         // Création de la table user_quests
    //         await this.query(`
    //             CREATE TABLE IF NOT EXISTS user_quests (
    //                 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //                 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    //                 quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    //                 status VARCHAR(50) CHECK (status IN ('en cours', 'terminée', 'échec')) DEFAULT 'en cours',
    //                 started_at TIMESTAMPTZ DEFAULT current_timestamp(),
    //                 completed_at TIMESTAMPTZ
    //             );
    //         `);

    //         // Création de la table upgrades
    //         await this.query(`
    //             CREATE TABLE IF NOT EXISTS upgrades (
    //                 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //                 name VARCHAR(255) NOT NULL,
    //                 description TEXT NOT NULL,
    //                 effect_type VARCHAR(50) CHECK (effect_type IN ('bonus_click', 'auto_click', 'methode_travail')) NOT NULL,
    //                 effect_value INT NOT NULL,
    //                 duration_seconds INT,
    //                 price INT NOT NULL,
    //                 created_at TIMESTAMPTZ DEFAULT current_timestamp()
    //             );
    //         `);

    //         // Création de la table user_upgrades
    //         await this.query(`
    //             CREATE TABLE IF NOT EXISTS user_upgrades (
    //                 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //                 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    //                 upgrade_number INT NOT NULL,
    //                 upgrade_id UUID NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
    //                 acquired_at TIMESTAMPTZ DEFAULT current_timestamp(),
    //                 expires_at TIMESTAMPTZ
    //             );
    //         `);

    //         // Création de la table consumables
    //         await this.query(`
    //             CREATE TABLE IF NOT EXISTS consumables (
    //                 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //                 name VARCHAR(255) NOT NULL,
    //                 description TEXT NOT NULL,
    //                 effect_type VARCHAR(50) CHECK (effect_type IN ('boost_click', 'boost_temps')) NOT NULL,
    //                 effect_value INT NOT NULL,
    //                 duration_seconds INT NOT NULL,
    //                 price INT NOT NULL,
    //                 created_at TIMESTAMPTZ DEFAULT current_timestamp()
    //             );
    //         `);

    //         // Création de la table user_consumables
    //         await this.query(`
    //             CREATE TABLE IF NOT EXISTS user_consumables (
    //                 id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //                 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    //                 consumable_id UUID NOT NULL REFERENCES consumables(id) ON DELETE CASCADE,
    //                 acquired_at TIMESTAMPTZ DEFAULT current_timestamp(),
    //                 used_at TIMESTAMPTZ
    //             );
    //         `);

    //         // Création de la table user_stats
    //         await this.query(`
    //             CREATE TABLE IF NOT EXISTS user_stats (
    //                 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    //                 total_clicks INT DEFAULT 0,
    //                 clicks_per_second INT DEFAULT 0,
    //                 points INT DEFAULT 0,
    //                 days_ahead_bonus INT DEFAULT 0
    //             );
    //         `);

    //         // Valider la transaction
    //         await this.query('COMMIT');
    //         console.log("✅ Toutes les tables ont été créées avec succès !");
    //     } catch (error) {
    //         await this.query('ROLLBACK');
    //         console.error('❌ Erreur lors de la création des tables :', error);
    //         throw error;
    //     }
    // }

    // async destroyAll() {
        try {
    console.log("Suppression de toutes les tables...");
    const { rows } = await this.query(`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
            `);
    console.log(`Tables trouvées : ${rows.length}`);

    for (const { table_name } of rows) {
        await this.query(`DROP TABLE IF EXISTS "${table_name}" CASCADE`);
        console.log(`Table ${table_name} supprimée`);
    }
    console.log("✅ Toutes les tables ont été supprimées");
} catch (err) {
    console.error("❌ Erreur lors de la suppression des tables :", err);
    throw err;
}
    // }
}

export default Database;
