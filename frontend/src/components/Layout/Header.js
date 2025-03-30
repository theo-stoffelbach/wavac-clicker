import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Header = () => {
    const { user, logout, isAuthenticated } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="app-header">
            <div className="container">
                <div className="navbar">
                    <Link to="/" className="app-logo">
                        Wavac-Clicker
                    </Link>
                    <nav className="nav-links">
                        <Link to="/" className="nav-link">Accueil</Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Tableau de bord</Link>
                                <Link to="/clicker" className="nav-link">Jouer</Link>
                                <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none' }}>
                                    Déconnexion
                                </button>
                                <span className="nav-user">
                                    <i className="fas fa-user mr-1"></i>
                                    {user.username}
                                </span>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Connexion</Link>
                                <Link to="/register" className="nav-link">Inscription</Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header; 