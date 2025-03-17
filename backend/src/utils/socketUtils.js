/**
 * Utilitaires pour gérer les interactions WebSocket
 */

/**
 * Émet un événement de mise à jour de guilde à tous les membres
 * @param {Object} io - Instance Socket.io
 * @param {Number} guildId - ID de la guilde
 * @param {Object} data - Données à émettre
 */
const emitGuildUpdate = (io, guildId, data) => {
    io.to(`guild-${guildId}`).emit('guild-update', data);
};

/**
 * Émet un événement de mise à jour personnelle à un utilisateur spécifique
 * @param {Object} io - Instance Socket.io
 * @param {String} socketId - ID du socket de l'utilisateur
 * @param {Object} data - Données à émettre
 */
const emitPersonalUpdate = (io, socketId, data) => {
    io.to(socketId).emit('personal-update', data);
};

/**
 * Émet un événement global à tous les utilisateurs connectés
 * @param {Object} io - Instance Socket.io
 * @param {Object} data - Données à émettre
 */
const emitGlobalUpdate = (io, data) => {
    io.emit('global-update', data);
};

/**
 * Fait rejoindre une room de guilde à un utilisateur
 * @param {Object} socket - Socket de l'utilisateur
 * @param {Number} guildId - ID de la guilde
 */
const joinGuildRoom = (socket, guildId) => {
    socket.join(`guild-${guildId}`);
};

/**
 * Fait quitter une room de guilde à un utilisateur
 * @param {Object} socket - Socket de l'utilisateur
 * @param {Number} guildId - ID de la guilde
 */
const leaveGuildRoom = (socket, guildId) => {
    socket.leave(`guild-${guildId}`);
};

module.exports = {
    emitGuildUpdate,
    emitPersonalUpdate,
    emitGlobalUpdate,
    joinGuildRoom,
    leaveGuildRoom,
}; 