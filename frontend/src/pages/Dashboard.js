import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
    const { user, isAuthenticated, loading } = useUser();
    const [stats, setStats] = useState({
        clicks: 1250,
        level: 3,
        ranking: 'Assistant Développeur',
        questsCompleted: 5
    });
    const navigate = useNavigate();

    // Rediriger si non authentifié
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, loading, navigate]);

    // Simuler le chargement des statistiques (à remplacer par un appel API réel)
    useEffect(() => {
        // Simulation de données - à remplacer par vos appels API
        const loadStats = () => {
            setStats({
                clicks: 1250,
                level: 3,
                ranking: 'Assistant Développeur',
                questsCompleted: 5
            });
        };

        loadStats();
    }, []);

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="container">
                <div className="dashboard-header">
                    <h1>Tableau de bord</h1>
                    <p className="welcome-message">Bienvenue, <span className="user-name">{user?.username || 'admin'}</span> !</p>
                </div>

                <div className="stat-exhibition">
                    <div className="stat-card-expo">
                        <div className="stat-card-inner">
                            <div className="stat-card-front">
                                <div className="stat-icon">
                                    <i className="fas fa-mouse-pointer"></i>
                                </div>
                                <div className="stat-value">{stats.clicks}</div>
                                <div className="stat-label">Clics totaux</div>
                            </div>
                            <div className="stat-card-back">
                                <p>Continuez à cliquer pour augmenter votre score!</p>
                                <p>Record personnel: {stats.clicks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card-expo">
                        <div className="stat-card-inner">
                            <div className="stat-card-front">
                                <div className="stat-icon">
                                    <i className="fas fa-trophy"></i>
                                </div>
                                <div className="stat-value">{stats.level}</div>
                                <div className="stat-label">Niveau actuel</div>
                            </div>
                            <div className="stat-card-back">
                                <p>Niveau suivant: {stats.level + 1}</p>
                                <p>Clics requis: 500 de plus</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card-expo">
                        <div className="stat-card-inner">
                            <div className="stat-card-front">
                                <div className="stat-icon">
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="stat-value">{stats.ranking}</div>
                                <div className="stat-label">Rang</div>
                            </div>
                            <div className="stat-card-back">
                                <p>Prochain rang: Lead Développeur</p>
                                <p>Continuez à progresser!</p>
                            </div>
                        </div>
                    </div>

                    <div className="stat-card-expo">
                        <div className="stat-card-inner">
                            <div className="stat-card-front">
                                <div className="stat-icon">
                                    <i className="fas fa-tasks"></i>
                                </div>
                                <div className="stat-value">{stats.questsCompleted}</div>
                                <div className="stat-label">Quêtes complétées</div>
                            </div>
                            <div className="stat-card-back">
                                <p>Nouvelles quêtes disponibles: 3</p>
                                <p>Complétez-les pour gagner des bonus!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-features">
                    <div className="feature-card">
                        <h3><i className="fas fa-users mr-2"></i>Ma Guilde</h3>
                        <p>Rejoignez une guilde pour obtenir des bonus collectifs et progresser plus rapidement.</p>
                        <Link to="/guilds" className="feature-link">Gérer ma guilde</Link>
                    </div>

                    <div className="feature-card">
                        <h3><i className="fas fa-bolt mr-2"></i>Améliorations</h3>
                        <p>Débloquez de nouvelles fonctionnalités et augmentez la puissance de vos clics.</p>
                        <Link to="/upgrades" className="feature-link">Voir les améliorations</Link>
                    </div>

                    <div className="feature-card">
                        <h3><i className="fas fa-chart-line mr-2"></i>Statistiques</h3>
                        <p>Consultez votre progression détaillée et comparez vos performances.</p>
                        <Link to="/stats" className="feature-link">Voir mes statistiques</Link>
                    </div>
                </div>

                <div className="start-action-container">
                    <Link to="/clicker" className="start-button pulse">
                        <span>COMMENCER À CLIQUER</span>
                        <i className="fas fa-play-circle ml-2"></i>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 