const request = require('supertest');
const express = require('express');
const { sequelize } = require('../config/db');
const { User, Guild } = require('../models');
const guildRoutes = require('../routes/guildRoutes');
const { protect } = require('../middlewares/authMiddleware');

// Mock du middleware d'authentification
jest.mock('../middlewares/authMiddleware', () => ({
    protect: jest.fn((req, res, next) => {
        req.user = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
        };
        next();
    }),
}));

// Configuration de l'app Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/guilds', guildRoutes);

// Mock des modèles Sequelize
jest.mock('../models', () => {
    const SequelizeMock = require('sequelize-mock');
    const dbMock = new SequelizeMock();

    const UserMock = dbMock.define('User', {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        clicks: 100,
        guild_id: null,
    });

    const GuildMock = dbMock.define('Guild', {
        id: 1,
        name: 'Test Guild',
        description: 'A test guild',
        level: 1,
        totalClicks: 0,
        owner_id: 1,
    });

    // Configuration des relations entre les mocks
    UserMock.belongsTo(GuildMock, { foreignKey: 'guild_id' });
    GuildMock.hasMany(UserMock, { foreignKey: 'guild_id' });
    GuildMock.belongsTo(UserMock, { as: 'owner', foreignKey: 'owner_id' });

    // Ajout des méthodes pour les tests
    UserMock.update = jest.fn().mockResolvedValue([1]);
    GuildMock.update = jest.fn().mockResolvedValue([1]);

    return {
        User: UserMock,
        Guild: GuildMock,
    };
});

describe('Guild API', () => {
    // Avant chaque test, réinitialiser les mocks
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/guilds', () => {
        it('should return all guilds', async () => {
            const res = await request(app).get('/api/guilds');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });
    });

    describe('POST /api/guilds', () => {
        it('should create a new guild', async () => {
            const guildData = {
                name: 'New Guild',
                description: 'A new test guild',
            };

            const res = await request(app)
                .post('/api/guilds')
                .send(guildData);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('name', guildData.name);
            expect(res.body).toHaveProperty('description', guildData.description);
        });

        it('should not create a guild with a duplicate name', async () => {
            // Mocking Guild.findOne to return a guild (simulating duplicate)
            Guild.findOne = jest.fn().mockResolvedValue({ id: 1, name: 'Existing Guild' });

            const guildData = {
                name: 'Existing Guild',
                description: 'This should fail',
            };

            const res = await request(app)
                .post('/api/guilds')
                .send(guildData);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('PUT /api/guilds/:id/join', () => {
        it('should allow a user to join a guild', async () => {
            // Mocking that the user is not in any guild
            User.findByPk = jest.fn().mockResolvedValue({
                id: 1,
                username: 'testuser',
                guild_id: null,
                save: jest.fn().mockResolvedValue(true),
            });

            const res = await request(app).put('/api/guilds/1/join');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message');
        });

        it('should not allow a user to join if already in a guild', async () => {
            // Mocking that the user is already in a guild
            User.findByPk = jest.fn().mockResolvedValue({
                id: 1,
                username: 'testuser',
                guild_id: 2,
                save: jest.fn().mockResolvedValue(true),
            });

            const res = await request(app).put('/api/guilds/1/join');

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('PUT /api/guilds/:id/contribute', () => {
        it('should allow a user to contribute clicks to their guild', async () => {
            // Mocking user with clicks and guild membership
            User.findByPk = jest.fn().mockResolvedValue({
                id: 1,
                username: 'testuser',
                clicks: 100,
                guild_id: 1,
                save: jest.fn().mockResolvedValue(true),
            });

            // Mocking guild
            Guild.findByPk = jest.fn().mockResolvedValue({
                id: 1,
                name: 'Test Guild',
                totalClicks: 500,
                level: 1,
                save: jest.fn().mockResolvedValue(true),
            });

            const contributeData = {
                clicksToContribute: 50,
            };

            const res = await request(app)
                .put('/api/guilds/1/contribute')
                .send(contributeData);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('userClicks');
            expect(res.body).toHaveProperty('guildClicks');
        });

        it('should not allow contribution with insufficient clicks', async () => {
            // Mocking user with insufficient clicks
            User.findByPk = jest.fn().mockResolvedValue({
                id: 1,
                username: 'testuser',
                clicks: 30,
                guild_id: 1,
                save: jest.fn().mockResolvedValue(true),
            });

            const contributeData = {
                clicksToContribute: 50,
            };

            const res = await request(app)
                .put('/api/guilds/1/contribute')
                .send(contributeData);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });
}); 