
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/database.js';
import { fixInvalidUser } from './models/UserModels.js';
import cookieParser from 'cookie-parser';

// Routes import
import userRouter from './routers/userRouter.js';
import guildRouter from './routers/guildRouter.js';
import otherRouter from './routers/otherRouter.js';


// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  console.log('get /');
  res.send('API is running');
});

// API routes
app.use('/api/users', userRouter);
app.use('/api/guilds', guildRouter);
app.use('/api/easter-egg', otherRouter);

await pool.query('SELECT NOW()');
console.log('Successfully connected to database');

const fixed = await fixInvalidUser();
if (fixed) {
  console.log('Un utilisateur problématique a été corrigé lors du démarrage');
}

export default app;