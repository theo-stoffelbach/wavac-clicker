import { findAll, findById, connectGuildToUser } from '../models/User.js';
import { userIsInGuild } from '../models/Guild.js';
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
    try {
        console.log('getUsers');

        const users = await findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs : ' + error });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await findById(id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur : ' + error });
    }
};

export const addGuildToUser = async (req, res) => {
    try {
        const { guild_id } = req.params;

        if (!req.headers.barear) return res.status(401).json({ message: 'Unauthorized (token missing)' });

        const token = req.headers.barear;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.id;

        if (!user_id || !guild_id) {
            return res.status(400).json({ error: 'Il faut être connecté et avoir un guild_id' });
        }

        if (await userIsInGuild(user_id)) {
            return res.status(400).json({ error: 'Vous êtes déjà dans une guilde' });
        }

        const user = await connectGuildToUser(user_id, guild_id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout du guild à l\'utilisateur : ' + error });
    }
};

