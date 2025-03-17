import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const { register, error, loading } = useUser();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Réinitialiser les messages d'erreur et de succès lors de la saisie
        setFormError('');
        setFormSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Validation de base
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            setFormError('Tous les champs sont obligatoires');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setFormError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 6) {
            setFormError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            console.log('Tentative d\'inscription avec:', { email: formData.email, username: formData.username });
            setFormSuccess('Inscription en cours...');

            // Envoyer seulement les données nécessaires (sans confirmPassword)
            const { confirmPassword, ...userData } = formData;
            const data = await register(userData);
            console.log('Inscription réussie:', data);

            setFormSuccess('Inscription réussie! Redirection en cours...');

            // Courte pause avant la redirection pour afficher le message de succès
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (error) {
            console.error('Erreur d\'inscription:', error);

            if (error.response) {
                // Erreur provenant du serveur
                const status = error.response.status;
                const message = error.response.data?.message || 'Erreur inconnue du serveur';

                if (status === 400) {
                    if (message.includes('existe déjà')) {
                        setFormError('Un utilisateur avec cet email existe déjà');
                    } else {
                        setFormError(message);
                    }
                } else if (status === 500) {
                    setFormError('Erreur serveur. Veuillez réessayer plus tard.');
                } else {
                    setFormError(message);
                }
            } else if (error.request) {
                // Pas de réponse du serveur
                setFormError('Impossible de contacter le serveur. Veuillez vérifier votre connexion internet.');
            } else {
                // Erreur lors de la configuration de la requête
                setFormError('Erreur lors de l\'inscription. Veuillez réessayer.');
            }
        }
    };

    return (
        <div className="register-container">
            <div className="container">
                <div className="register-form-wrapper slide-up">
                    <h1>Créer un compte</h1>

                    <div className="form-icon-wrapper">
                        <div className="form-icon">
                            <i className="fas fa-user-plus"></i>
                        </div>
                    </div>

                    {(formError || error) && (
                        <div className="alert alert-danger fade-in">
                            {formError || error}
                        </div>
                    )}

                    {formSuccess && (
                        <div className="alert alert-success fade-in">
                            {formSuccess}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="form-group">
                            <label htmlFor="username">Nom d'utilisateur</label>
                            <div className="input-group">
                                <span className="input-icon">
                                    <i className="fas fa-user"></i>
                                </span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choisissez un nom d'utilisateur"
                                    disabled={loading}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-group">
                                <span className="input-icon">
                                    <i className="fas fa-envelope"></i>
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Votre email"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <div className="input-group">
                                <span className="input-icon">
                                    <i className="fas fa-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Créez un mot de passe"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                            <div className="input-group">
                                <span className="input-icon">
                                    <i className="fas fa-lock"></i>
                                </span>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirmez votre mot de passe"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-text">
                                    <span className="dot-animation"></span>
                                    Inscription en cours
                                </span>
                            ) : (
                                <>
                                    <i className="fas fa-user-plus mr-2"></i>
                                    S'inscrire
                                </>
                            )}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p>
                            Vous avez déjà un compte ?{' '}
                            <Link to="/login" className="underline-effect">Se connecter</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 