import dotenv from 'dotenv';
import { makeGuild, showGuildById, showAllGuilds } from '../models/Guild.js';
import jwt from 'jsonwebtoken';
import { findById } from '../models/User.js';

dotenv.config();

export const createGuild = async (req, res) => {
    const { name } = req.body;

    console.log(req.headers.barear);


    if (!req.headers.barear) return res.status(401).json({ message: 'Unauthorized (token missing)' });

    const token = req.headers.barear;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const owner_id = decoded.id;


    const guild = await makeGuild(name, owner_id);
    const user = await findById(owner_id);



    res.status(201).json(guild);
};

export const getGuildById = async (req, res) => {
    const { id } = req.params;
    const guild = await showGuildById(id);
    res.status(200).json(guild);
};

export const getAllGuilds = async (req, res) => {
    const guilds = await showAllGuilds();
    res.status(200).json(guilds);
};



