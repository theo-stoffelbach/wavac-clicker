import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database.js';
import { fixInvalidUser } from './models/User.js';

// Routes import
import authRouter from './routers/middlewareRouter.js';
import userRouter from './routers/userRouter.js';
import guildRouter from './routers/guildRouter.js';

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  console.log('get /');
  res.send('API is running');
});

// API routes
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/guilds', guildRouter);

// Démarrer le serveur
const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Successfully connected to database');

    // Correction de l'utilisateur problématique au démarrage
    try {
      const fixed = await fixInvalidUser();
      if (fixed) {
        console.log('Un utilisateur problématique a été corrigé lors du démarrage');
      }
    } catch (error) {
      console.error('Erreur lors de la correction des utilisateurs problématiques:', error);
    }

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
    });
  } catch (error) {
    console.error('Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
};

// Lancer le serveur
startServer(); 