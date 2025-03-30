import Database from '../db/db.js';

(async () => {
    try {
        const db = Database.getInstance();
        await db.destroyAll();
        await db.client.end();
        console.log('✅ Toutes les tables ont été supprimées.');
    } catch (error) {
        console.error('❌ Erreur lors de la suppression des tables :', error);
        process.exit(1);
    }
})();
