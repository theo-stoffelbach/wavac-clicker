import { getUserById, connectGuildToUser, findByEmail, createUser } from '../models/UserModels.js';
import { userIsInGuild } from '../models/GuildModel.js';
import jwt from 'jsonwebtoken';
import { getAllUsers } from '../services/userService.js';
import bcrypt from 'bcrypt';

import dotenv from 'dotenv';

dotenv.config();

export const handleGetAllUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs : ' + error });
    }
};

export const handleGetUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getUserById(id);
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

export const handleLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log("Tentative de connexion - email : ", email, "password présent : ", !!password);
    if (!email || !password) {
        console.log("Erreur: email ou password manquant - email : ", email, ", password présent : ", !!password);
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const user = await findByEmail(email);
        console.log("Utilisateur trouvé : ", user ? "Oui" : "Non");
        if (!user) {
            console.log("Aucun utilisateur trouvé avec cet email : ", email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log("Comparaison des mots de passe pour : ", user.username);
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log("Mot de passe invalide pour : ", user.username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log("Connexion réussie pour : ", user.username);
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        delete user.password;

        return res
            .status(200)
            .cookie('token', token, {
                httpOnly: true,
                maxAge: 2 * 60 * 60 * 1000,
            })
            .json({ message: 'Login successful', user });
    } catch (err) {
        console.error("Erreur lors de la connexion : ", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const handleRegister = async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Email and password and username are required' });
    }

    // Vérification supplémentaire du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Format d\'email invalide' });
    }

    const existingUser = await findByEmail(email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(username, email, hashedPassword);

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);
    res.status(201).json({ message: 'User created successfully', user: newUser, token });
};

export const handleLogout = async (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};


