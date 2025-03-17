const { Guild, User } = require('../models');

// @desc    Créer une nouvelle guilde
// @route   POST /api/guilds
// @access  Private
const createGuild = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Vérifier si une guilde avec ce nom existe déjà
        const guildExists = await Guild.findOne({ where: { name } });

        if (guildExists) {
            return res.status(400).json({ message: 'Une guilde avec ce nom existe déjà' });
        }

        // Créer la guilde avec l'utilisateur actuel comme propriétaire
        const guild = await Guild.create({
            name,
            description,
            owner_id: req.user.id,
        });

        // Mettre à jour l'utilisateur pour l'ajouter à la guilde
        await User.update({ guild_id: guild.id }, { where: { id: req.user.id } });

        res.status(201).json({
            id: guild.id,
            name: guild.name,
            description: guild.description,
            level: guild.level,
            totalClicks: guild.totalClicks,
            owner_id: guild.owner_id,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Obtenir toutes les guildes
// @route   GET /api/guilds
// @access  Public
const getGuilds = async (req, res) => {
    try {
        const guilds = await Guild.findAll({
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'username'],
                },
            ],
        });

        res.json(guilds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtenir une guilde par ID
// @route   GET /api/guilds/:id
// @access  Public
const getGuildById = async (req, res) => {
    try {
        const guild = await Guild.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['id', 'username'],
                },
                {
                    model: User,
                    attributes: ['id', 'username', 'clicks'],
                },
            ],
        });

        if (guild) {
            res.json(guild);
        } else {
            res.status(404).json({ message: 'Guilde non trouvée' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mettre à jour une guilde
// @route   PUT /api/guilds/:id
// @access  Private (owner only)
const updateGuild = async (req, res) => {
    try {
        const { name, description } = req.body;
        const guild = await Guild.findByPk(req.params.id);

        if (!guild) {
            return res.status(404).json({ message: 'Guilde non trouvée' });
        }

        // Vérifier que l'utilisateur est le propriétaire de la guilde
        if (guild.owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Vous devez être le propriétaire pour modifier cette guilde' });
        }

        // Mettre à jour les champs
        guild.name = name || guild.name;
        guild.description = description || guild.description;

        await guild.save();

        res.json({
            id: guild.id,
            name: guild.name,
            description: guild.description,
            level: guild.level,
            totalClicks: guild.totalClicks,
            owner_id: guild.owner_id,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Supprimer une guilde
// @route   DELETE /api/guilds/:id
// @access  Private (owner only)
const deleteGuild = async (req, res) => {
    try {
        const guild = await Guild.findByPk(req.params.id);

        if (!guild) {
            return res.status(404).json({ message: 'Guilde non trouvée' });
        }

        // Vérifier que l'utilisateur est le propriétaire de la guilde
        if (guild.owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Vous devez être le propriétaire pour supprimer cette guilde' });
        }

        // Retirer tous les utilisateurs de la guilde
        await User.update({ guild_id: null }, { where: { guild_id: guild.id } });

        // Supprimer la guilde
        await guild.destroy();

        res.json({ message: 'Guilde supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rejoindre une guilde
// @route   PUT /api/guilds/:id/join
// @access  Private
const joinGuild = async (req, res) => {
    try {
        const guild = await Guild.findByPk(req.params.id);

        if (!guild) {
            return res.status(404).json({ message: 'Guilde non trouvée' });
        }

        // Vérifier si l'utilisateur est déjà dans une guilde
        const user = await User.findByPk(req.user.id);

        if (user.guild_id) {
            return res.status(400).json({ message: 'Vous êtes déjà membre d\'une guilde' });
        }

        // Ajouter l'utilisateur à la guilde
        user.guild_id = guild.id;
        await user.save();

        res.json({ message: 'Vous avez rejoint la guilde avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Quitter une guilde
// @route   PUT /api/guilds/:id/leave
// @access  Private
const leaveGuild = async (req, res) => {
    try {
        const guild = await Guild.findByPk(req.params.id);

        if (!guild) {
            return res.status(404).json({ message: 'Guilde non trouvée' });
        }

        const user = await User.findByPk(req.user.id);

        // Vérifier si l'utilisateur est dans cette guilde
        if (user.guild_id !== guild.id) {
            return res.status(400).json({ message: 'Vous n\'êtes pas membre de cette guilde' });
        }

        // Vérifier si l'utilisateur est le propriétaire
        if (user.id === guild.owner_id) {
            return res.status(400).json({ message: 'Le propriétaire ne peut pas quitter sa guilde, veuillez la supprimer ou transférer la propriété' });
        }

        // Retirer l'utilisateur de la guilde
        user.guild_id = null;
        await user.save();

        res.json({ message: 'Vous avez quitté la guilde avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Transférer la propriété d'une guilde
// @route   PUT /api/guilds/:id/transfer-ownership
// @access  Private (owner only)
const transferOwnership = async (req, res) => {
    try {
        const { newOwnerId } = req.body;
        const guild = await Guild.findByPk(req.params.id);

        if (!guild) {
            return res.status(404).json({ message: 'Guilde non trouvée' });
        }

        // Vérifier que l'utilisateur est le propriétaire actuel
        if (guild.owner_id !== req.user.id) {
            return res.status(403).json({ message: 'Vous devez être le propriétaire pour transférer la propriété' });
        }

        // Vérifier que le nouvel utilisateur existe et est membre de la guilde
        const newOwner = await User.findByPk(newOwnerId);
        if (!newOwner) {
            return res.status(404).json({ message: 'Nouvel utilisateur non trouvé' });
        }

        if (newOwner.guild_id !== guild.id) {
            return res.status(400).json({ message: 'Le nouvel utilisateur doit être membre de la guilde' });
        }

        // Transférer la propriété
        guild.owner_id = newOwnerId;
        await guild.save();

        res.json({ message: 'Propriété de la guilde transférée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Contribuer des clics à la guilde
// @route   PUT /api/guilds/:id/contribute
// @access  Private
const contributeClicks = async (req, res) => {
    try {
        const { clicksToContribute } = req.body;

        if (!clicksToContribute || clicksToContribute <= 0) {
            return res.status(400).json({ message: 'Veuillez fournir un nombre valide de clics à contribuer' });
        }

        const guild = await Guild.findByPk(req.params.id);
        const user = await User.findByPk(req.user.id);

        if (!guild) {
            return res.status(404).json({ message: 'Guilde non trouvée' });
        }

        // Vérifier que l'utilisateur est membre de la guilde
        if (user.guild_id !== guild.id) {
            return res.status(403).json({ message: 'Vous devez être membre de la guilde pour contribuer' });
        }

        // Vérifier si l'utilisateur a assez de clics
        if (user.clicks < clicksToContribute) {
            return res.status(400).json({ message: 'Vous n\'avez pas assez de clics' });
        }

        // Retirer les clics de l'utilisateur et les ajouter à la guilde
        user.clicks -= clicksToContribute;
        guild.totalClicks += clicksToContribute;

        // Vérifier si la guilde peut monter de niveau (par exemple, tous les 1000 clics)
        const nextLevelThreshold = guild.level * 1000;
        if (guild.totalClicks >= nextLevelThreshold) {
            guild.level += 1;
        }

        await Promise.all([user.save(), guild.save()]);

        res.json({
            message: `${clicksToContribute} clics contribués à la guilde`,
            userClicks: user.clicks,
            guildClicks: guild.totalClicks,
            guildLevel: guild.level,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGuild,
    getGuilds,
    getGuildById,
    updateGuild,
    deleteGuild,
    joinGuild,
    leaveGuild,
    transferOwnership,
    contributeClicks,
}; 