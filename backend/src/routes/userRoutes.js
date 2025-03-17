const express = require('express');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserClicks,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: ID unique de l'utilisateur
 *         username:
 *           type: string
 *           description: Nom d'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse e-mail de l'utilisateur
 *         clicks:
 *           type: integer
 *           description: Nombre de clics accumulés par l'utilisateur
 *         guild_id:
 *           type: integer
 *           nullable: true
 *           description: ID de la guilde de l'utilisateur
 *         lastClickTime:
 *           type: string
 *           format: date-time
 *           description: Dernière fois que l'utilisateur a cliqué
 *       example:
 *         id: 1
 *         username: johndoe
 *         email: john@example.com
 *         clicks: 1500
 *         guild_id: 3
 *         lastClickTime: "2023-01-15T14:30:00Z"
 */

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: API pour la gestion des utilisateurs
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse e-mail
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 clicks:
 *                   type: integer
 *                 token:
 *                   type: string
 *       400:
 *         description: Données invalides ou utilisateur existant
 */
router.post('/', registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse e-mail
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mot de passe
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 clicks:
 *                   type: integer
 *                 token:
 *                   type: string
 *       401:
 *         description: Email ou mot de passe invalide
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 clicks:
 *                   type: integer
 *                 guild_id:
 *                   type: integer
 *                   nullable: true
 *                 userUpgrades:
 *                   type: array
 *                   items:
 *                     type: object
 *                 userQuests:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /users/click:
 *   put:
 *     summary: Mettre à jour le compteur de clics de l'utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clicksToAdd:
 *                 type: integer
 *                 description: Nombre de clics à ajouter (défaut à 1)
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Clics mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clicks:
 *                   type: integer
 *                   description: Nombre total de clics après mise à jour
 *       401:
 *         description: Non autorisé, token manquant ou invalide
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/click', protect, updateUserClicks);

module.exports = router; 