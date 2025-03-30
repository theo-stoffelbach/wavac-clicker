import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { findByEmail, createUser } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const login = async (req, res) => {
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
        return res.status(200).json({ message: 'Login successful', user, token });
    } catch (err) {
        console.error("Erreur lors de la connexion : ", err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const register = async (req, res) => {
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

const logout = async (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};

export { login, register, logout };
