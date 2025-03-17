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

/**
 * @swagger
 * components:
 *   schemas:
 *     Guild:
 *       type: object
 *       required:
 *         - name
 *         - owner_id
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de la guilde
 *         name:
 *           type: string
 *           description: Nom de la guilde
 *         description:
 *           type: string
 *           description: Description de la guilde
 *         level:
 *           type: integer
 *           description: Niveau actuel de la guilde
 *         totalClicks:
 *           type: integer
 *           description: Nombre total de clics contribués à la guilde
 *         owner_id:
 *           type: integer
 *           description: ID de l'utilisateur propriétaire de la guilde
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création de la guilde
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de dernière mise à jour de la guilde
 *       example:
 *         id: 1
 *         name: Les Clickers Professionnels
 *         description: Une guilde pour les clickers sérieux
 *         level: 3
 *         totalClicks: 5000
 *         owner_id: 42
 *         createdAt: "2023-01-01T12:00:00Z"
 *         updatedAt: "2023-01-10T15:30:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Guildes
 *   description: API pour la gestion des guildes
 */

/**
 * @swagger
 * /guilds:
 *   get:
 *     summary: Récupère la liste de toutes les guildes
 *     tags: [Guildes]
 *     responses:
 *       200:
 *         description: Liste des guildes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Guild'
 */
router.get('/', getGuilds);

/**
 * @swagger
 * /guilds/{id}:
 *   get:
 *     summary: Récupère une guilde par son ID
 *     tags: [Guildes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la guilde
 *     responses:
 *       200:
 *         description: Détails de la guilde
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guild'
 *       404:
 *         description: Guilde non trouvée
 */
router.get('/:id', getGuildById);

/**
 * @swagger
 * /guilds:
 *   post:
 *     summary: Crée une nouvelle guilde
 *     tags: [Guildes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la guilde
 *               description:
 *                 type: string
 *                 description: Description de la guilde
 *     responses:
 *       201:
 *         description: Guilde créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guild'
 *       400:
 *         description: Données invalides ou guilde avec ce nom existe déjà
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 */
router.post('/', protect, createGuild);

/**
 * @swagger
 * /guilds/{id}:
 *   put:
 *     summary: Met à jour une guilde existante
 *     tags: [Guildes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la guilde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom de la guilde
 *               description:
 *                 type: string
 *                 description: Nouvelle description de la guilde
 *     responses:
 *       200:
 *         description: Guilde mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guild'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 *       403:
 *         description: Seul le propriétaire peut modifier la guilde
 *       404:
 *         description: Guilde non trouvée
 */
router.put('/:id', protect, updateGuild);

/**
 * @swagger
 * /guilds/{id}:
 *   delete:
 *     summary: Supprime une guilde
 *     tags: [Guildes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la guilde
 *     responses:
 *       200:
 *         description: Guilde supprimée avec succès
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 *       403:
 *         description: Seul le propriétaire peut supprimer la guilde
 *       404:
 *         description: Guilde non trouvée
 */
router.delete('/:id', protect, deleteGuild);

/**
 * @swagger
 * /guilds/{id}/join:
 *   put:
 *     summary: Rejoindre une guilde
 *     tags: [Guildes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la guilde à rejoindre
 *     responses:
 *       200:
 *         description: Guilde rejointe avec succès
 *       400:
 *         description: L'utilisateur est déjà membre d'une guilde
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 *       404:
 *         description: Guilde non trouvée
 */
router.put('/:id/join', protect, joinGuild);

/**
 * @swagger
 * /guilds/{id}/leave:
 *   put:
 *     summary: Quitter une guilde
 *     tags: [Guildes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la guilde à quitter
 *     responses:
 *       200:
 *         description: Guilde quittée avec succès
 *       400:
 *         description: L'utilisateur n'est pas membre de cette guilde ou est le propriétaire
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 *       404:
 *         description: Guilde non trouvée
 */
router.put('/:id/leave', protect, leaveGuild);

/**
 * @swagger
 * /guilds/{id}/transfer-ownership:
 *   put:
 *     summary: Transférer la propriété d'une guilde
 *     tags: [Guildes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la guilde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newOwnerId
 *             properties:
 *               newOwnerId:
 *                 type: integer
 *                 description: ID du nouvel utilisateur propriétaire
 *     responses:
 *       200:
 *         description: Propriété transférée avec succès
 *       400:
 *         description: Données invalides ou nouvel utilisateur non membre de la guilde
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 *       403:
 *         description: Seul le propriétaire actuel peut transférer la propriété
 *       404:
 *         description: Guilde ou nouvel utilisateur non trouvé
 */
router.put('/:id/transfer-ownership', protect, transferOwnership);

/**
 * @swagger
 * /guilds/{id}/contribute:
 *   put:
 *     summary: Contribuer des clics à une guilde
 *     tags: [Guildes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la guilde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clicksToContribute
 *             properties:
 *               clicksToContribute:
 *                 type: integer
 *                 description: Nombre de clics à contribuer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Clics contribués avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userClicks:
 *                   type: integer
 *                 guildClicks:
 *                   type: integer
 *                 guildLevel:
 *                   type: integer
 *       400:
 *         description: Nombre de clics invalide ou insuffisant
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 *       403:
 *         description: L'utilisateur n'est pas membre de la guilde
 *       404:
 *         description: Guilde non trouvée
 */
router.put('/:id/contribute', protect, contributeClicks);

module.exports = router; 