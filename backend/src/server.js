const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
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
}); 