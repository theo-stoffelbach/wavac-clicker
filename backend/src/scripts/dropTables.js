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

// Liste des tables à supprimer
const tables = [
    'user_upgrades',
    'user_quests',
    'upgrades',
    'quests',
    'users',
    'guilds'
];

// Fonction pour supprimer toutes les tables
async function dropTables() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Suppression de toutes les tables...');

        // Supprimer chaque table
        for (const table of tables) {
            console.log(`Suppression de la table ${table}...`);
            try {
                await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
                console.log(`Table ${table} supprimée avec succès`);
            } catch (error) {
                console.error(`Erreur lors de la suppression de la table ${table}:`, error.message);
            }
        }

        await client.query('COMMIT');
        console.log('Toutes les tables ont été supprimées avec succès!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erreur lors de la suppression des tables:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Exécuter la suppression des tables
dropTables()
    .then(() => {
        console.log('Script terminé avec succès');
        process.exit(0);
    })
    .catch(error => {
        console.error('Erreur lors de l\'exécution du script:', error);
        process.exit(1);
    }); 