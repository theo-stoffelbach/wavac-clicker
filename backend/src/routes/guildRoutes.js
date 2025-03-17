const express = require('express');
const {
    createGuild,
    getGuilds,
    getGuildById,
    updateGuild,
    deleteGuild,
    joinGuild,
    leaveGuild,
    transferOwnership,
    contributeClicks,
} = require('../controllers/guildController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes publiques
router.get('/', getGuilds);
router.get('/:id', getGuildById);

// Routes protégées (nécessitent authentification)
router.post('/', protect, createGuild);
router.put('/:id', protect, updateGuild);
router.delete('/:id', protect, deleteGuild);
router.put('/:id/join', protect, joinGuild);
router.put('/:id/leave', protect, leaveGuild);
router.put('/:id/transfer-ownership', protect, transferOwnership);
router.put('/:id/contribute', protect, contributeClicks);

module.exports = router; 