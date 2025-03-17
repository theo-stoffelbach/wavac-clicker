import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Home = () => {
    const { isAuthenticated } = useUser();

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="container">
                    <h1>Wavac-Clicker</h1>
                    <p className="subtitle">Cliquez. Améliorez. Collaborez.</p>

                    <div className="cta-buttons">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn btn-primary">
                                Accéder au tableau de bord
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-primary">
                                    Connexion
                                </Link>
                                <Link to="/register" className="btn btn-secondary">
                                    Inscription
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <h2>Fonctionnalités</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>Clicker</h3>
                            <p>Cliquez pour gagner des points et débloquer des améliorations</p>
                        </div>
                        <div className="feature-card">
                            <h3>Guildes</h3>
                            <p>Rejoignez ou créez une guilde pour collaborer avec d'autres joueurs</p>
                        </div>
                        <div className="feature-card">
                            <h3>Quêtes</h3>
                            <p>Accomplissez des quêtes pour gagner des récompenses spéciales</p>
                        </div>
                        <div className="feature-card">
                            <h3>Améliorations</h3>
                            <p>Débloquez des bonus temporaires et permanents pour augmenter votre productivité</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-section">
                <div className="container">
                    <h2>À propos</h2>
                    <p>
                        Wavac-Clicker est un jeu incrémental inspiré du monde du travail moderne,
                        intégrant des concepts comme le Scrum, les user stories et les bonus de productivité.
                        Travaillez en équipe dans des guildes, accomplissez des quêtes et améliorez votre score !
                    </p>
                </div>
            </section>
        </div>
    );
};

export default Home; 