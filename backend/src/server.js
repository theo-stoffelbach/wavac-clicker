const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/db');
const setupSwagger = require('./config/swagger');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const guildRoutes = require('./routes/guildRoutes');

dotenv.config();

// Connexion à CockroachDB
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(express.json());
app.use(cors());

// Setup Swagger
setupSwagger(app);

// Page d'accueil de l'API
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Wasac-Clicker API</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: #2c3e50;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }
                .container {
                    background-color: #f9f9f9;
                    border-radius: 5px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                a {
                    display: inline-block;
                    background-color: #3498db;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                    font-weight: bold;
                }
                a:hover {
                    background-color: #2980b9;
                }
                .endpoints {
                    margin-top: 20px;
                }
                .endpoint {
                    margin-bottom: 10px;
                    padding: 10px;
                    background-color: #eee;
                    border-radius: 3px;
                }
                .method {
                    font-weight: bold;
                    color: #e74c3c;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Wasac-Clicker API</h1>
                <p>Bienvenue sur l'API de Wasac-Clicker, un jeu de clicker inspiré du monde du travail moderne.</p>
                <p>Cette API fournit des endpoints pour gérer les utilisateurs, les guildes, les quêtes et les améliorations.</p>
                
                <div class="endpoints">
                    <h2>Principaux endpoints :</h2>
                    <div class="endpoint"><span class="method">POST</span> /api/users - Inscription</div>
                    <div class="endpoint"><span class="method">POST</span> /api/users/login - Connexion</div>
                    <div class="endpoint"><span class="method">GET</span> /api/users/profile - Profil de l'utilisateur</div>
                    <div class="endpoint"><span class="method">GET</span> /api/guilds - Liste des guildes</div>
                    <div class="endpoint"><span class="method">POST</span> /api/guilds - Créer une guilde</div>
                </div>
                
                <a href="/api-docs">Accéder à la documentation complète de l'API</a>
            </div>
        </body>
        </html>
    `);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/guilds', guildRoutes);

// WebSocket pour les mises à jour en temps réel
io.on('connection', (socket) => {
    console.log(`Utilisateur connecté: ${socket.id}`);

    socket.on('click', async (data) => {
        // À implémenter: Logique pour gérer les clics via WebSocket
        console.log(`Click reçu de l'utilisateur: ${data.userId}`);
    });

    socket.on('guild-join', (data) => {
        // Permettre aux utilisateurs de rejoindre une "room" pour leur guilde
        if (data.guildId) {
            socket.join(`guild-${data.guildId}`);
            console.log(`Utilisateur ${data.userId} a rejoint la room de la guilde ${data.guildId}`);
        }
    });

    socket.on('guild-leave', (data) => {
        // Permettre aux utilisateurs de quitter une "room" de leur guilde
        if (data.guildId) {
            socket.leave(`guild-${data.guildId}`);
            console.log(`Utilisateur ${data.userId} a quitté la room de la guilde ${data.guildId}`);
        }
    });

    socket.on('guild-contribute', (data) => {
        // Émettre un événement à tous les membres de la guilde quand quelqu'un contribue
        if (data.guildId) {
            io.to(`guild-${data.guildId}`).emit('guild-update', {
                contributorId: data.userId,
                contributorName: data.username,
                clicksContributed: data.clicks,
                guildClicks: data.guildClicks,
                guildLevel: data.guildLevel,
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Utilisateur déconnecté: ${socket.id}`);
    });
});

// Middleware d'erreur
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Documentation API disponible sur http://localhost:${PORT}/api-docs`);
}); 