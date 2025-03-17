import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const { login, error, loading } = useUser();
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

        if (!formData.email || !formData.password) {
            setFormError('Tous les champs sont obligatoires');
            return;
        }

        try {
            console.log('Tentative de connexion avec:', { email: formData.email });
            setFormSuccess('Connexion en cours...');
            const userData = await login(formData);
            console.log('Connexion réussie:', userData);
            setFormSuccess('Connexion réussie! Redirection en cours...');

            // Courte pause avant la redirection pour afficher le message de succès
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Erreur de connexion:', error);

            if (error.response) {
                // Erreur provenant du serveur
                const status = error.response.status;
                const message = error.response.data?.message || 'Erreur inconnue du serveur';

                if (status === 401) {
                    setFormError('Email ou mot de passe incorrect');
                } else if (status === 404) {
                    setFormError('Utilisateur non trouvé');
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
                setFormError('Erreur de connexion. Veuillez réessayer.');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="container">
                <div className="login-form-wrapper slide-up">
                    <h1>Connexion</h1>

                    <div className="form-icon-wrapper">
                        <div className="form-icon">
                            <i className="fas fa-user-circle"></i>
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

                    <form onSubmit={handleSubmit} className="login-form">
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
                                    autoFocus
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
                                    placeholder="Votre mot de passe"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-options">
                            <div className="remember-me">
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember">Se souvenir de moi</label>
                            </div>
                            <div className="forgot-password">
                                <Link to="/forgot-password">Mot de passe oublié?</Link>
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
                                    Connexion en cours
                                </span>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            Vous n'avez pas de compte ?{' '}
                            <Link to="/register" className="underline-effect">Créer un compte</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 