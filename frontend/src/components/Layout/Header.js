import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

const Header = () => {
    const { user, isAuthenticated, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="app-header">
            <div className="container">
                <nav className="navbar">
                    <Link to="/" className="app-logo">Wavac-Clicker</Link>

                    <div className="nav-links">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Tableau de bord</Link>
                                <button
                                    onClick={handleLogout}
                                    className="nav-link"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Déconnexion
                                </button>
                                <span className="nav-user">
                                    {user?.username}
                                </span>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link">Connexion</Link>
                                <Link to="/register" className="nav-link btn btn-primary">S'inscrire</Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header; 