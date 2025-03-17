import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-logo">
                        <h3>WAVAC-CLICKER</h3>
                        <p>Le jeu de clics inspiré du monde du travail moderne</p>
                    </div>

                    <div className="footer-links">
                        <div className="footer-links-section">
                            <h4>Navigation</h4>
                            <ul>
                                <li><Link to="/">Accueil</Link></li>
                                <li><Link to="/login">Connexion</Link></li>
                                <li><Link to="/register">Inscription</Link></li>
                            </ul>
                        </div>

                        <div className="footer-links-section">
                            <h4>Liens utiles</h4>
                            <ul>
                                <li><Link to="/">À propos</Link></li>
                                <li><Link to="/">Mentions légales</Link></li>
                                <li><Link to="/">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} WAVAC-CLICKER. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 