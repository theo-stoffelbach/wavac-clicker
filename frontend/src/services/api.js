import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API URL configurée:', API_URL);

// Création de l'instance axios avec la config de base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 secondes de timeout
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`Requête ${config.method.toUpperCase()} vers ${config.url}`,
            config.data ? 'avec données' : 'sans données');
        return config;
    },
    (error) => {
        console.error('Erreur lors de la préparation de la requête:', error);
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => {
        console.log(`Réponse de ${response.config.url}: statut ${response.status}`);
        return response;
    },
    (error) => {
        // Gestion des erreurs
        if (error.response) {
            // Réponse du serveur avec un code d'erreur
            console.error(`Erreur ${error.response.status} pour ${error.config.url}:`,
                error.response.data);

            // Gestion des erreurs d'authentification
            if (error.response.status === 401) {
                console.warn('Session expirée ou non autorisée, déconnexion...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // Pas de réponse du serveur
            console.error('Aucune réponse reçue du serveur:', error.request);
        } else {
            // Erreur lors de la configuration de la requête
            console.error('Erreur de configuration de la requête:', error.message);
        }
        return Promise.reject(error);
    }
);

// Services pour l'authentification
export const authService = {
    register: (userData) => {
        console.log('Tentative d\'inscription:', userData.email);
        return api.post('/users', userData);
    },
    login: (credentials) => {
        console.log('Tentative de connexion:', credentials.email);
        return api.post('/users/login', credentials);
    },
    getProfile: () => {
        console.log('Récupération du profil utilisateur');
        return api.get('/users/profile');
    },
};

// Services pour les guildes
export const guildService = {
    getAll: () => api.get('/guilds'),
    getById: (id) => api.get(`/guilds/${id}`),
    create: (guildData) => api.post('/guilds', guildData),
    update: (id, guildData) => api.put(`/guilds/${id}`, guildData),
    delete: (id) => api.delete(`/guilds/${id}`),
    join: (id) => api.post(`/guilds/${id}/join`),
    leave: (id) => api.post(`/guilds/${id}/leave`),
    getLeaderboard: () => api.get('/guilds/leaderboard'),
};

// Services pour les quêtes
export const questService = {
    getAll: () => api.get('/quests'),
    getById: (id) => api.get(`/quests/${id}`),
    getAvailable: () => api.get('/quests/available'),
    getUserQuests: () => api.get('/quests/user'),
    acceptQuest: (questId) => api.post(`/quests/${questId}/accept`),
    updateProgress: (questId, progress) => api.put(`/quests/${questId}/progress`, { progress }),
    completeQuest: (questId) => api.post(`/quests/${questId}/complete`),
};

// Services pour les améliorations
export const upgradeService = {
    getAll: () => api.get('/upgrades'),
    getById: (id) => api.get(`/upgrades/${id}`),
    purchase: (id) => api.post(`/upgrades/${id}/purchase`),
};

// Services pour le jeu Clicker
export const clickerService = {
    // Récupérer les données du jeu pour l'utilisateur
    getGameData: () => {
        console.log('Récupération des données de jeu');
        return api.get('/clicker/data');
    },

    // Sauvegarder les données du jeu pour l'utilisateur
    saveGameData: (gameData) => {
        console.log('Sauvegarde des données de jeu:', gameData);
        return api.post('/clicker/save', gameData);
    },

    // Signaler une activité suspecte (anti-triche)
    reportSuspiciousActivity: (type, details) => {
        console.log('Signalement d\'activité suspecte');
        return api.post('/clicker/report', { type, details });
    },

    // Récupérer toutes les améliorations disponibles
    getUpgrades: () => api.get('/clicker/upgrades'),

    // Acheter une amélioration
    purchaseUpgrade: (upgradeId) => api.post(`/clicker/upgrades/${upgradeId}/purchase`),
};

export default api; 