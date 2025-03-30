import e from 'express';
import { pool } from '../config/database.js';

export const makeGuild = async (name, owner_id) => {
    try {
        const query = `
            INSERT INTO guilds (name, owner_id)
            VALUES ($1, $2)
            RETURNING id, name, owner_id, created_at, updated_at
    `;
        const values = [name, owner_id];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Erreur lors de la création de la guilde :', error);
        throw error;
    }
};

export const showGuildById = async (id) => {
    try {
        const query = `
            SELECT id, name, description, owner_id, created_at, updated_at
            FROM guilds
            WHERE id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Erreur lors de la récupération de la guilde :', error);
        throw error;
    }
};

export const showAllGuilds = async () => {
    try {
        const query = `
            SELECT id, name, description, owner_id, created_at, updated_at
            FROM guilds
    `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des guildes :', error);
        throw error;
    }
};

export const userIsInGuild = async (user_id) => {
    try {
        const query = `
            SELECT * FROM user_guild WHERE user_id = $1
        `;
        const result = await pool.query(query, [user_id]);
        if (result.rows.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'appartenance à la guilde :', error);
        throw error;
    }
};
