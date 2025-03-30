const { pool } = require('../config/database');
const dotenv = require('dotenv');

dotenv.config();

async function createTables() {
  const client = await pool.connect();
  try {
    // Démarrer une transaction
    await client.query('BEGIN');

    console.log('Création des tables en cours...');

    // Table des guildes (doit être créée avant users en raison de la référence)
    await client.query(`
      CREATE TABLE IF NOT EXISTS guilds (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name STRING UNIQUE NOT NULL,
        description STRING NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp()
      );
    `);

    // Index sur le champ name pour améliorer les recherches de guilde
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_guilds_name ON guilds (name);
    `);

    // Table des utilisateurs
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        username STRING UNIQUE NOT NULL,
        email STRING UNIQUE NOT NULL,
        password_hash STRING NOT NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp(),
        last_login TIMESTAMPTZ NULL,
        guild_id UUID NULL REFERENCES guilds(id) ON DELETE SET NULL
      );
    `);

    // Index pour optimiser les requêtes sur les utilisateurs actifs
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_last_login ON users (last_login);
    `);

    // Table des quêtes
    await client.query(`
      CREATE TABLE IF NOT EXISTS quests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title STRING NOT NULL,
        description STRING NOT NULL,
        type STRING CHECK (type IN ('quotidienne', 'guilde', 'principale', 'duo')) NOT NULL,
        reward_points INT NOT NULL,
        duration_seconds INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp()
      );
    `);

    // Table des quêtes assignées aux joueurs
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_quests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
        status STRING CHECK (status IN ('en cours', 'terminée', 'échec')) DEFAULT 'en cours',
        started_at TIMESTAMPTZ DEFAULT current_timestamp(),
        completed_at TIMESTAMPTZ NULL
      );
    `);

    // Table des améliorations (incluant les méthodes de travail)
    await client.query(`
      CREATE TABLE IF NOT EXISTS upgrades (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name STRING NOT NULL,
        description STRING NOT NULL,
        effect_type STRING CHECK (effect_type IN ('bonus_click', 'auto_click', 'methode_travail')) NOT NULL,
        effect_value INT NOT NULL,
        duration_seconds INT DEFAULT NULL,
        price INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp()
      );
    `);

    // Table des améliorations achetées par un utilisateur
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_upgrades (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        upgrade_number INT NOT NULL,
        upgrade_id UUID NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
        acquired_at TIMESTAMPTZ DEFAULT current_timestamp(),
        expires_at TIMESTAMPTZ NULL
      );
    `);

    // Table des objets consommables
    await client.query(`
      CREATE TABLE IF NOT EXISTS consumables (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name STRING NOT NULL,
        description STRING NOT NULL,
        effect_type STRING CHECK (effect_type IN ('boost_click', 'boost_temps')) NOT NULL,
        effect_value INT NOT NULL,
        duration_seconds INT NOT NULL,
        price INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp()
      );
    `);

    // Table des objets consommables achetés/utilisés par les joueurs
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_consumables (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        consumable_id UUID NOT NULL REFERENCES consumables(id) ON DELETE CASCADE,
        acquired_at TIMESTAMPTZ DEFAULT current_timestamp(),
        used_at TIMESTAMPTZ NULL
      );
    `);

    // Table des points et performances des utilisateurs
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        total_clicks INT DEFAULT 0,
        clicks_per_second INT DEFAULT 0,
        points INT DEFAULT 0,
        days_ahead_bonus INT DEFAULT 0
      );
    `);

    // Valider la transaction
    await client.query('COMMIT');
    console.log('✅ Toutes les tables ont été créées avec succès !');
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  } finally {
    // Libérer le client
    client.release();
  }
}

// Fonction pour créer chaque table individuellement (sans transaction)
async function createTablesIndividually() {
  console.log('Création des tables individuellement...');

  try {
    // Table des guildes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS guilds (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name STRING UNIQUE NOT NULL,
        description STRING NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp()
      )
    `);
    console.log('Table guilds créée');

    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_guilds_name ON guilds (name)`);
      console.log('Index sur guilds.name créé');
    } catch (error) {
      console.warn('⚠️ Impossible de créer l\'index sur guilds.name:', error.message);
    }

    // Table des utilisateurs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        username STRING UNIQUE NOT NULL,
        email STRING UNIQUE NOT NULL,
        password_hash STRING NOT NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp(),
        last_login TIMESTAMPTZ NULL,
        guild_id UUID NULL REFERENCES guilds(id) ON DELETE SET NULL
      )
    `);
    console.log('Table users créée');

    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_last_login ON users (last_login)`);
      console.log('Index sur users.last_login créé');
    } catch (error) {
      console.warn('⚠️ Impossible de créer l\'index sur users.last_login:', error.message);
    }

    // Table des quêtes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title STRING NOT NULL,
        description STRING NOT NULL,
        type STRING CHECK (type IN ('quotidienne', 'guilde', 'principale', 'duo')) NOT NULL,
        reward_points INT NOT NULL,
        duration_seconds INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp()
      )
    `);
    console.log('Table quests créée');

    // Table des quêtes assignées aux joueurs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_quests (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
        status STRING CHECK (status IN ('en cours', 'terminée', 'échec')) DEFAULT 'en cours',
        started_at TIMESTAMPTZ DEFAULT current_timestamp(),
        completed_at TIMESTAMPTZ NULL
      )
    `);
    console.log('Table user_quests créée');

    // Table des améliorations (incluant les méthodes de travail)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS upgrades (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name STRING NOT NULL,
        description STRING NOT NULL,
        effect_type STRING CHECK (effect_type IN ('bonus_click', 'auto_click', 'methode_travail')) NOT NULL,
        effect_value INT NOT NULL,
        duration_seconds INT DEFAULT NULL,
        price INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp()
      )
    `);
    console.log('Table upgrades créée');

    // Table des améliorations achetées par un utilisateur
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_upgrades (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        upgrade_number INT NOT NULL,
        upgrade_id UUID NOT NULL REFERENCES upgrades(id) ON DELETE CASCADE,
        acquired_at TIMESTAMPTZ DEFAULT current_timestamp(),
        expires_at TIMESTAMPTZ NULL
      )
    `);
    console.log('Table user_upgrades créée');

    // Table des objets consommables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consumables (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name STRING NOT NULL,
        description STRING NOT NULL,
        effect_type STRING CHECK (effect_type IN ('boost_click', 'boost_temps')) NOT NULL,
        effect_value INT NOT NULL,
        duration_seconds INT NOT NULL,
        price INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT current_timestamp()
      )
    `);
    console.log('Table consumables créée');

    // Table des objets consommables achetés/utilisés par les joueurs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_consumables (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        consumable_id UUID NOT NULL REFERENCES consumables(id) ON DELETE CASCADE,
        acquired_at TIMESTAMPTZ DEFAULT current_timestamp(),
        used_at TIMESTAMPTZ NULL
      )
    `);
    console.log('Table user_consumables créée');

    // Table des points et performances des utilisateurs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        total_clicks INT DEFAULT 0,
        clicks_per_second INT DEFAULT 0,
        points INT DEFAULT 0,
        days_ahead_bonus INT DEFAULT 0
      )
    `);
    console.log('Table user_stats créée');

    console.log('✅ Toutes les tables ont été créées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  }
}

// Fonction pour supprimer les tables
async function dropTables() {
  const client = await pool.connect();
  try {
    console.log('Suppression de toutes les tables...');

    // Récupérer la liste de toutes les tables dans la base de données
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    if (tablesResult.rows.length === 0) {
      console.log('Aucune table à supprimer.');
      return;
    }

    // Commencer une transaction
    await client.query('BEGIN');

    // Supprimer toutes les tables avec CASCADE
    for (const row of tablesResult.rows) {
      const tableName = row.tablename;
      console.log(`Suppression de la table: ${tableName}`);
      await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
    }

    await client.query('COMMIT');

    console.log('✅ Toutes les tables ont été supprimées avec succès !');
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Erreur lors du rollback:', rollbackError);
    }
    console.error('❌ Erreur lors de la suppression des tables:', error);
    throw error;
  } finally {
    // Libérer le client
    client.release();
  }
}

// Fonction pour vérifier la base de données
async function checkDatabase() {
  const client = await pool.connect();
  try {
    // Vérifier la base de données actuelle
    const result = await client.query('SELECT current_database();');
    const currentDb = result.rows[0].current_database;

    // Accepter defaultdb ou wasac_clicker
    if (currentDb.toLowerCase() !== 'wasac_clicker' && currentDb.toLowerCase() !== 'defaultdb') {
      console.error(`❌ ERREUR: Vous êtes connecté à la base de données "${currentDb}" au lieu de "wasac_clicker" ou "defaultdb"!`);
      console.error('⚠️ Les opérations ont été annulées pour éviter d\'endommager une autre base de données.');
      process.exit(1);
    }

    console.log(`✅ Connecté à la base de données: ${currentDb}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Exécuter le script en fonction des arguments
async function main() {
  const args = process.argv.slice(2);

  try {
    // Vérifier d'abord la base de données
    await checkDatabase();

    if (args.includes('--drop')) {
      await dropTables();
    }

    if (args.includes('--create') || args.length === 0) {
      try {
        await createTables();
      } catch (error) {
        console.warn('⚠️ La création des tables avec transaction a échoué, tentative sans transaction...');
        await createTablesIndividually();
      }
    }

    if (args.includes('--reset')) {
      await dropTables();
      try {
        await createTables();
      } catch (error) {
        console.warn('⚠️ La création des tables avec transaction a échoué, tentative sans transaction...');
        await createTablesIndividually();
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  } finally {
    // Fermer le pool de connexion
    await pool.end();
  }
}

// Exécuter le script
main(); 