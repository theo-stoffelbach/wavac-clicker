const User = require('../models/userModel');
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
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

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

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            clicks: user.clicks,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Impossible de créer l'utilisateur");
    }
};

// @desc    Authentifier un utilisateur et obtenir un token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            clicks: user.clicks,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Email ou mot de passe invalide');
    }
};

// @desc    Obtenir le profil de l'utilisateur
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            clicks: user.clicks,
            guild: user.guild,
            completedQuests: user.completedQuests,
            activeUpgrades: user.activeUpgrades,
        });
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
};

// @desc    Mettre à jour le compteur de clics de l'utilisateur
// @route   PUT /api/users/click
// @access  Private
const updateUserClicks = async (req, res) => {
    const { clicksToAdd } = req.body;

    // Ajouter la validation pour empêcher la triche
    const user = await User.findById(req.user._id);

    if (user) {
        user.clicks += clicksToAdd || 1;
        user.lastClickTime = Date.now();

        await user.save();

        res.json({
            clicks: user.clicks,
        });
    } else {
        res.status(404);
        throw new Error('Utilisateur non trouvé');
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserClicks,
}; 