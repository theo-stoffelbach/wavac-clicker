const { User, UserUpgrade, UserQuest } = require('../models');
const jwt = require('jsonwebtoken');

// Générer un JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Enregistrer un nouvel utilisateur
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            res.status(400);
            throw new Error('Utilisateur existe déjà');
        }

        // Créer un nouvel utilisateur
        const user = await User.create({
            username,
            email,
            password,
        });

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            clicks: user.clicks,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Authentifier un utilisateur et obtenir un token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                clicks: user.clicks,
                token: generateToken(user.id),
            });
        } else {
            res.status(401);
            throw new Error('Email ou mot de passe invalide');
        }
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// @desc    Obtenir le profil de l'utilisateur
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                { model: UserUpgrade, where: { isActive: true }, required: false },
                { model: UserQuest, required: false }
            ]
        });

        if (user) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                clicks: user.clicks,
                guild_id: user.guild_id,
                userUpgrades: user.UserUpgrades,
                userQuests: user.UserQuests,
            });
        } else {
            res.status(404);
            throw new Error('Utilisateur non trouvé');
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Mettre à jour le compteur de clics de l'utilisateur
// @route   PUT /api/users/click
// @access  Private
const updateUserClicks = async (req, res) => {
    try {
        const { clicksToAdd } = req.body;

        // Ajouter la validation pour empêcher la triche
        const user = await User.findByPk(req.user.id);

        if (user) {
            user.clicks += clicksToAdd || 1;
            user.lastClickTime = new Date();

            await user.save();

            res.json({
                clicks: user.clicks,
            });
        } else {
            res.status(404);
            throw new Error('Utilisateur non trouvé');
        }
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserClicks,
}; 