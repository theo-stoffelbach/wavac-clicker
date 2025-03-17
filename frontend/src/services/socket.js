import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

// Fonction pour initialiser la connexion socket
export const initializeSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            auth: {
                token: localStorage.getItem('token')
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Gestion des événements de connexion
        socket.on('connect', () => {
            console.log('Connexion WebSocket établie');
        });

        socket.on('disconnect', () => {
            console.log('Connexion WebSocket perdue');
        });

        socket.on('connect_error', (error) => {
            console.error('Erreur de connexion WebSocket:', error);
            if (error.message.includes('Authentication')) {
                // Problème d'authentification
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        });
    }
    return socket;
};

// Fonction pour déconnecter le socket
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Fonction pour envoyer un événement
export const emitEvent = (event, data) => {
    if (!socket) {
        initializeSocket();
    }
    socket.emit(event, data);
};

// Fonction pour s'abonner à un événement
export const subscribeToEvent = (event, callback) => {
    if (!socket) {
        initializeSocket();
    }
    socket.on(event, callback);

    // Retourne une fonction pour se désabonner
    return () => {
        socket.off(event, callback);
    };
};

export default {
    initializeSocket,
    disconnectSocket,
    emitEvent,
    subscribeToEvent
}; 