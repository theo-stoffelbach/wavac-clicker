import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Création du contexte
const UserContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useUser = () => useContext(UserContext);

// Provider du contexte
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fonction pour initialiser l'utilisateur à partir du localStorage
    const initializeUserFromStorage = () => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Erreur lors du parsing des données utilisateur:', e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    // Vérification de l'authentification au chargement
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    setLoading(true);
                    console.log('Vérification du token et chargement du profil...');
                    const response = await authService.getProfile();
                    console.log('Profil chargé avec succès:', response.data);
                    setUser(response.data);
                    setError(null);
                } catch (error) {
                    console.error('Erreur lors de la récupération du profil:', error);
                    // Suppression du token si non valide
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);

                    if (error.response && error.response.status === 401) {
                        setError('Votre session a expiré. Veuillez vous reconnecter.');
                    } else if (error.response) {
                        setError(`Erreur serveur: ${error.response.data?.message || 'Erreur inconnue'}`);
                    } else if (error.request) {
                        setError('Impossible de contacter le serveur. Veuillez vérifier votre connexion.');
                    } else {
                        setError('Une erreur est survenue lors de la vérification de votre session.');
                    }
                } finally {
                    setLoading(false);
                }
            } else {
                // Initialiser depuis le localStorage pour une expérience utilisateur immédiate
                initializeUserFromStorage();
            }
        };

        checkAuth();
    }, []);

    // Fonction de connexion
    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Envoi des identifiants à l\'API...', credentials.email);
            const response = await authService.login(credentials);
            console.log('Réponse de l\'API login:', response.data);

            // Vérifier la structure de la réponse
            if (!response.data || !response.data.token) {
                throw new Error('Format de réponse invalide du serveur');
            }

            // Stockage du token et des infos utilisateur
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));

            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            const errorMessage = error.response?.data?.message || 'Erreur de connexion';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Fonction d'inscription
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Envoi des données d\'inscription à l\'API...');
            const response = await authService.register(userData);
            console.log('Réponse de l\'API register:', response.data);

            // Vérifier la structure de la réponse
            if (!response.data || !response.data.token) {
                throw new Error('Format de réponse invalide du serveur');
            }

            // Stockage du token et des infos utilisateur
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));

            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Fonction de déconnexion
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError(null);
        console.log('Utilisateur déconnecté');
    };

    // Valeur exposée par le contexte
    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext; 