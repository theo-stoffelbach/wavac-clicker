const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false,
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('CockroachDB connecté avec succès');

        // Désactiver la synchronisation automatique pour CockroachDB en production
        // Les tables doivent être créées manuellement via migrations ou le script seedDatabase.js
        console.log('Synchronisation automatique désactivée - utilisation des tables existantes');
    } catch (error) {
        console.error(`Erreur de connexion: ${error.message}`);
        // Ne pas quitter pour permettre à l'API de fonctionner même en cas d'erreur
        // process.exit(1);
    }
};

module.exports = { connectDB, sequelize }; 