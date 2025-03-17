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

// Fonction pour supprimer toutes les tables
async function dropAllTables() {
    const client = await pool.connect();
    try {
        console.log('Recherche de toutes les tables dans la base de données...');

        // Obtenir toutes les tables de la base de données
        const schemaQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        `;

        const tablesResult = await client.query(schemaQuery);
        const tables = tablesResult.rows.map(row => row.table_name);

        if (tables.length === 0) {
            console.log('Aucune table trouvée dans la base de données.');
            return;
        }

        console.log(`Tables trouvées (${tables.length}): ${tables.join(', ')}`);

        // Supprimer chaque table une par une
        for (const table of tables) {
            try {
                console.log(`Suppression de la table "${table}"...`);
                await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
                console.log(`Table "${table}" supprimée avec succès`);
            } catch (error) {
                console.error(`Erreur lors de la suppression de la table "${table}":`, error.message);
                // Continue avec les autres tables
            }
        }

        console.log('Toutes les tables ont été supprimées avec succès!');
    } catch (error) {
        console.error('Erreur lors de la suppression des tables:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Exécuter la suppression des tables
dropAllTables()
    .then(() => {
        console.log('Script terminé avec succès');
        process.exit(0);
    })
    .catch(error => {
        console.error('Erreur lors de l\'exécution du script:', error);
        process.exit(1);
    }); 