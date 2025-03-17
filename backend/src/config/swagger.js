const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Options de base pour la configuration de Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Wasac-Clicker API',
            version: '1.0.0',
            description: 'API pour le jeu Wasac-Clicker',
            contact: {
                name: 'Équipe Wasac-Clicker',
            },
            license: {
                name: 'MIT',
            },
        },
        servers: [
            {
                url: '/api',
                description: 'Serveur de développement',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    // Chemins à analyser pour les commentaires JSDoc
    apis: [
        './src/routes/*.js',
        './src/models/*.js',
        './src/controllers/*.js'
    ],
};

// Initialisation de Swagger
const specs = swaggerJsdoc(options);

// Fonction pour configurer Swagger dans l'application Express
const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Wasac-Clicker API Documentation",
        customfavIcon: "",
    }));

    console.log('Documentation Swagger disponible sur /api-docs');
};

module.exports = setupSwagger; 