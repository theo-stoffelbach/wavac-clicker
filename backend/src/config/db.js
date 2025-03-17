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
    logging: false
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('CockroachDB connecté avec succès');

        // Synchroniser les modèles avec la base de données
        // En production, il est préférable d'utiliser des migrations
        await sequelize.sync({ alter: true });
        console.log('Modèles synchronisés');
    } catch (error) {
        console.error(`Erreur de connexion: ${error.message}`);
        process.exit(1);
    }
};

module.exports = { connectDB, sequelize }; 