import { findAllUsers } from '../models/UserModels.js';

export const getAllUsers = async () => {
    try {
        const users = await findAllUsers();
        return users;
    } catch (error) {
        throw new Error('Erreur lors de la récupération des utilisateurs : ' + error);
    }
};

export const getUserById = async (id) => {
    try {
        const user = await findById(id);
        return user;
    } catch (error) {
        throw new Error('Erreur lors de la récupération de l\'utilisateur : ' + error);
    }
};

export const createUser = async (user) => {
    try {
        const newUser = await createUser(user);
        return newUser;
    } catch (error) {
        throw new Error('Erreur lors de la création de l\'utilisateur : ' + error);
    }
};