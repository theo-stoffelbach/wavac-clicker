import { pool } from '../config/database.js';

// Créer un utilisateur
export const createUser = async (username, email, password, clicks = 0, last_click_time = null) => {
  const query = `
    INSERT INTO users (username, email, password, clicks,last_click_time, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, username, email, clicks, last_click_time, created_at, updated_at
  `;
  const values = [username, email, password, clicks, last_click_time];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Trouver un utilisateur par email ou username
export const findByEmail = async (email) => {
  console.log("email : ", email);
  try {
    const query = 'SELECT id, username, email, password, clicks,last_click_time, created_at, updated_at FROM public.users WHERE LOWER(email) = LOWER($1)';

    const result = await pool.query(query, [email]);

    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la recherche d\'un utilisateur :', error);
    throw error;
  }
};

// Trouver un utilisateur par ID
export const findById = async (id) => {
  const query = 'SELECT id, username, email, clicks, last_click_time, created_at, updated_at FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// Récupérer tous les utilisateurs
export const findAll = async () => {
  const query = 'SELECT id, username, email, clicks, last_click_time, created_at, updated_at FROM users';
  const result = await pool.query(query);
  return result.rows;
};

// Mettre à jour le score d'un utilisateur
export const updateScore = async (id, score) => {
  const query = `
    UPDATE users 
    SET score = $1 
    WHERE id = $2
    RETURNING id, username, email, clicks, last_click_time, created_at, updated_at
  `;
  const result = await pool.query(query, [score, id]);
  return result.rows[0];
};

// Fonction pour corriger l'utilisateur problématique
export const fixInvalidUser = async () => {
  try {
    // Vérifier si l'utilisateur problématique existe
    const checkQuery = "SELECT id FROM users WHERE email LIKE '$2b$10%'";
    const checkResult = await pool.query(checkQuery);

    if (checkResult.rows.length > 0) {
      // Supprimer l'utilisateur problématique
      const deleteQuery = "DELETE FROM users WHERE email LIKE '$2b$10%'";
      await pool.query(deleteQuery);
      console.log("Utilisateur problématique supprimé avec succès");
      return true;
    } else {
      console.log("Aucun utilisateur problématique trouvé");
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la correction de l'utilisateur problématique:", error);
    throw error;
  }
};

export const connectGuildToUser = async (user_id, guild_id) => {
  try {
    const query = `
      INSERT INTO user_guild (user_id, guild_id)
      VALUES ($1, $2)
      RETURNING user_id, guild_id
  `;
    const result = await pool.query(query, [user_id, guild_id]);
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la connexion du guild à l\'utilisateur :', error);
    throw error;
  }
};
