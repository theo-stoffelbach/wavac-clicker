import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { clickerService } from '../../services/api';
import { UserContext } from '../../context/UserContext';
import Upgrade from './Upgrade';
import UpgradeSummary from './UpgradeSummary';
import TemporaryEffect from './TemporaryEffect';
import QuestProgress from './QuestProgress';
import '../../App.css';

const ClickerGame = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    // États pour les données du jeu
    const [clicks, setClicks] = useState(0);
    const [clickPower, setClickPower] = useState(1);
    const [autoClickRate, setAutoClickRate] = useState(0);
    const [securityToken, setSecurityToken] = useState('');
    const [upgrades, setUpgrades] = useState([]);
    const [temporaryEffects, setTemporaryEffects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState({ saving: false, lastSaved: null, error: null });
    const [suspiciousActivities, setSuspiciousActivities] = useState([]);

    // Format des grands nombres
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
    };

    // Charger les données du jeu
    const loadGameData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await clickerService.getGameData();

            // Mettre à jour les états avec les données du serveur
            setClicks(response.data.clicks);
            setClickPower(response.data.clickPower);
            setAutoClickRate(response.data.autoClickRate);
            setSecurityToken(response.data.securityToken);
            setTemporaryEffects(response.data.temporaryEffects || []);

            // Charger les améliorations disponibles
            const upgradesResponse = await clickerService.getUpgrades();
            setUpgrades(upgradesResponse.data);

            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);

            // Si erreur d'authentification, rediriger vers la connexion
            if (error.response && error.response.status === 401) {
                navigate('/login', { state: { message: 'Votre session a expiré, veuillez vous reconnecter.' } });
            } else {
                // Essayer de charger depuis le localStorage en cas d'erreur de connexion
                const savedData = localStorage.getItem('clickerData');
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    setClicks(parsedData.clicks || 0);
                    setClickPower(parsedData.clickPower || 1);
                    setAutoClickRate(parsedData.autoClickRate || 0);

                    // Générer un token local temporaire
                    setSecurityToken(`local_${Date.now()}`);

                    setSaveStatus(prev => ({
                        ...prev,
                        error: 'Mode hors ligne: les données sont sauvegardées localement.'
                    }));
                }
                setLoading(false);
            }
        }
    }, [navigate]);

    // Sauvegarde périodique des données
    const saveGameData = useCallback(async () => {
        try {
            setSaveStatus(prev => ({ ...prev, saving: true }));

            // Créer les données à sauvegarder
            const gameData = {
                clicks,
                clickPower,
                autoClickRate,
                securityToken
            };

            // Générer un checksum simple pour vérification anti-triche
            const timestamp = Date.now();
            gameData.checksum = `${clicks}_${clickPower}_${autoClickRate}_${timestamp}`;

            // Appel API pour sauvegarder
            const response = await clickerService.saveGameData(gameData);

            // Mise à jour du token de sécurité
            setSecurityToken(response.data.securityToken);

            // Également sauvegarder localement en cas de perte de connexion
            localStorage.setItem('clickerData', JSON.stringify(gameData));

            setSaveStatus({
                saving: false,
                lastSaved: new Date(),
                error: null
            });
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);

            // Sauvegarder localement en cas d'erreur
            localStorage.setItem('clickerData', JSON.stringify({
                clicks,
                clickPower,
                autoClickRate,
                lastSaved: new Date()
            }));

            setSaveStatus(prev => ({
                ...prev,
                saving: false,
                error: 'Erreur de connexion, données sauvegardées localement.'
            }));
        }
    }, [clicks, clickPower, autoClickRate, securityToken]);

    // Chargement initial des données
    useEffect(() => {
        if (user) {
            loadGameData();
        } else {
            // Si pas d'utilisateur authentifié, rediriger ou charger depuis localStorage
            const savedData = localStorage.getItem('clickerData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setClicks(parsedData.clicks || 0);
                setClickPower(parsedData.clickPower || 1);
                setAutoClickRate(parsedData.autoClickRate || 0);
                setLoading(false);
            } else {
                setLoading(false);
            }
        }
    }, [loadGameData, user]);

    // Sauvegarde automatique toutes les 10 secondes
    useEffect(() => {
        if (!loading && user) {
            const saveInterval = setInterval(() => {
                saveGameData();
            }, 10000);

            return () => clearInterval(saveInterval);
        }
    }, [saveGameData, loading, user]);

    // Auto-click basé sur le taux
    useEffect(() => {
        if (autoClickRate > 0) {
            const interval = setInterval(() => {
                setClicks(prevClicks => prevClicks + autoClickRate);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [autoClickRate]);

    // Gestion des effets temporaires
    useEffect(() => {
        if (temporaryEffects.length > 0) {
            const now = new Date();

            // Filtrer les effets expirés
            const activeEffects = temporaryEffects.filter(effect => {
                const startTime = new Date(effect.startTime);
                const endTime = new Date(startTime.getTime() + (effect.duration * 1000));
                return now < endTime;
            });

            // Mettre à jour si des effets ont expiré
            if (activeEffects.length !== temporaryEffects.length) {
                setTemporaryEffects(activeEffects);
            }

            // Vérifier toutes les secondes
            const interval = setInterval(() => {
                const now = new Date();
                const stillActiveEffects = temporaryEffects.filter(effect => {
                    const startTime = new Date(effect.startTime);
                    const endTime = new Date(startTime.getTime() + (effect.duration * 1000));
                    return now < endTime;
                });

                if (stillActiveEffects.length !== temporaryEffects.length) {
                    setTemporaryEffects(stillActiveEffects);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [temporaryEffects]);

    // Sauvegarde avant de quitter la page
    useEffect(() => {
        const saveBeforeUnload = () => {
            // Sauvegarde synchrone pour capturer avant fermeture
            localStorage.setItem('clickerData', JSON.stringify({
                clicks,
                clickPower,
                autoClickRate,
                lastSaved: new Date()
            }));

            // Tentative de sauvegarde asynchrone
            if (user) {
                fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/clicker/save`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    },
                    body: JSON.stringify({
                        clicks,
                        clickPower,
                        autoClickRate,
                        securityToken
                    }),
                    // Utiliser keepalive pour s'assurer que la requête est envoyée même si la page se ferme
                    keepalive: true
                }).catch(e => console.error('Erreur lors de la sauvegarde de sortie:', e));
            }
        };

        window.addEventListener('beforeunload', saveBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', saveBeforeUnload);
            // Sauvegarde lors du démontage du composant
            saveGameData();
        };
    }, [clicks, clickPower, autoClickRate, securityToken, saveGameData, user]);

    // Suivi du temps passé sur la page pour les statistiques
    const [sessionStartTime] = useState(new Date());

    useEffect(() => {
        return () => {
            const sessionDuration = (new Date() - sessionStartTime) / 1000; // en secondes
            console.log(`Session de jeu terminée: ${sessionDuration} secondes`);
            // On pourrait envoyer cette donnée au serveur
        };
    }, [sessionStartTime]);

    // Fonction pour signaler une activité suspecte
    const reportSuspiciousActivity = (type, details) => {
        // Ajouter à l'état local
        setSuspiciousActivities(prev => [...prev, { type, details, timestamp: new Date() }]);

        // Envoyer au serveur si connecté
        if (user) {
            clickerService.reportSuspiciousActivity(type, details)
                .catch(err => console.error('Erreur lors du signalement d\'activité:', err));
        }

        console.warn(`Activité suspecte détectée: ${type}`, details);
    };

    // Tracker pour détecter les clics automatisés
    const [clickHistory, setClickHistory] = useState([]);
    const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });

    // Gérer les clics sur le bouton principal
    const handleClick = (e) => {
        // Vérifier si le clic est réel
        if (e.isTrusted) {
            // Enregistrer la position de la souris
            const mousePosition = { x: e.clientX, y: e.clientY };

            // Vérifier si les clics sont toujours exactement au même endroit (bot)
            if (lastMousePosition.x === mousePosition.x && lastMousePosition.y === mousePosition.y &&
                lastMousePosition.x !== 0 && lastMousePosition.y !== 0) {
                // Clic suspect - même position exacte
                reportSuspiciousActivity('exact_position', { position: mousePosition });
            }

            setLastMousePosition(mousePosition);

            // Détecter les clics trop rapides (anti-autoclicker)
            const now = Date.now();
            setClickHistory(prev => {
                const newHistory = [...prev, now].slice(-10); // Garder les 10 derniers clics

                // Calculer le temps moyen entre les clics
                if (newHistory.length > 5) {
                    const intervals = [];
                    for (let i = 1; i < newHistory.length; i++) {
                        intervals.push(newHistory[i] - newHistory[i - 1]);
                    }

                    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;

                    // Si intervalle trop court, c'est suspect (moins de 50ms entre les clics)
                    if (avgInterval < 50) {
                        reportSuspiciousActivity('rapid_clicks', {
                            avgInterval,
                            intervals
                        });
                    }
                }

                return newHistory;
            });

            // Calcul du pouvoir de clic avec les effets temporaires
            let effectiveClickPower = clickPower;
            temporaryEffects.forEach(effect => {
                if (effect.type === 'clickBoost') {
                    effectiveClickPower += effect.power;
                } else if (effect.type === 'multiplier') {
                    effectiveClickPower *= effect.power;
                }
            });

            // Mise à jour du nombre de clics
            setClicks(prevClicks => prevClicks + effectiveClickPower);
        } else {
            // Clic non fiable (simulé par script)
            reportSuspiciousActivity('simulated_click', {
                trusted: e.isTrusted,
                timestamp: new Date()
            });

            console.warn('Clic simulé détecté et ignoré');
        }
    };

    // Acheter une amélioration
    const buyUpgrade = async (upgradeId) => {
        try {
            // Trouver l'amélioration
            const upgradeToBuy = upgrades.find(upg => upg._id === upgradeId);

            if (!upgradeToBuy) {
                console.error('Amélioration non trouvée');
                return;
            }

            // Vérifier si l'utilisateur a assez de clics
            const cost = upgradeToBuy.nextCost || upgradeToBuy.baseCost;
            if (clicks < cost) {
                console.log('Pas assez de clics pour acheter cette amélioration');
                return;
            }

            // Appel API pour acheter
            const response = await clickerService.purchaseUpgrade(upgradeId);

            // Mise à jour des états locaux
            setClicks(response.data.newClicks);
            setClickPower(response.data.newClickPower);
            setAutoClickRate(response.data.newAutoClickRate);

            // Recharger les améliorations disponibles
            const upgradesResponse = await clickerService.getUpgrades();
            setUpgrades(upgradesResponse.data);

            // Jouer un son ou ajouter une animation

        } catch (error) {
            console.error('Erreur lors de l\'achat de l\'amélioration:', error);

            // Mode hors ligne ou erreur de connexion
            if (error.response && error.response.status === 401) {
                navigate('/login', { state: { message: 'Votre session a expiré, veuillez vous reconnecter.' } });
            } else {
                // Tentative d'achat en local (mode dégradé)
                const upgradeToBuy = upgrades.find(upg => upg._id === upgradeId);
                if (upgradeToBuy) {
                    const cost = upgradeToBuy.nextCost || upgradeToBuy.baseCost;
                    if (clicks >= cost) {
                        setClicks(prev => prev - cost);

                        // Appliquer les effets de l'amélioration
                        if (upgradeToBuy.category === 'clickPower') {
                            setClickPower(prev => prev + upgradeToBuy.power);
                        } else if (upgradeToBuy.category === 'autoClicker') {
                            setAutoClickRate(prev => prev + upgradeToBuy.power);
                        }

                        // Mettre à jour le niveau d'upgrade localement
                        setUpgrades(prev => prev.map(upg =>
                            upg._id === upgradeId
                                ? {
                                    ...upg,
                                    level: (upg.level || 0) + 1,
                                    owned: true,
                                    nextCost: Math.floor(upg.baseCost * Math.pow(upg.costMultiplier, (upg.level || 0) + 1))
                                }
                                : upg
                        ));
                    }
                }
            }
        }
    };

    // Filtrer les améliorations par catégorie
    const filterUpgradesByCategory = (category) => {
        return upgrades
            .filter(upgrade => upgrade.category === category && upgrade.requiredClicks <= clicks)
            .sort((a, b) => {
                // Trier par coût
                const costA = a.nextCost || a.baseCost;
                const costB = b.nextCost || b.baseCost;
                return costA - costB;
            });
    };

    // Obtenir les améliorations possédées
    const getOwnedUpgrades = () => {
        return upgrades
            .filter(upgrade => upgrade.owned)
            .sort((a, b) => b.level - a.level); // Les plus haut niveau d'abord
    };

    // Grouper par type
    const ownedUpgradesByType = {
        clickPower: getOwnedUpgrades().filter(u => u.category === 'clickPower'),
        autoClicker: getOwnedUpgrades().filter(u => u.category === 'autoClicker'),
        multiplier: getOwnedUpgrades().filter(u => u.category === 'multiplier'),
        special: getOwnedUpgrades().filter(u => u.category === 'special')
    };

    return (
        <div className="clicker-game-container">
            {loading ? (
                <div className="loading">Chargement...</div>
            ) : (
                <>
                    <div className="clicker-header">
                        <div className="clicks-display">
                            <span className="clicks-count">{formatNumber(clicks)}</span>
                            <span className="clicks-label">points</span>
                        </div>

                        <div className="clicker-stats">
                            <div className="stat">
                                <span className="stat-label">Puissance: </span>
                                <span className="stat-value">{formatNumber(clickPower)} / clic</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Auto: </span>
                                <span className="stat-value">{formatNumber(autoClickRate)} / sec</span>
                            </div>
                        </div>
                    </div>

                    <div className="clicker-main">
                        <div className="click-area">
                            <button
                                className="click-button"
                                onClick={handleClick}
                                disabled={loading}
                            >
                                CLICK
                            </button>
                        </div>

                        {temporaryEffects.length > 0 && (
                            <div className="temporary-effects">
                                {temporaryEffects.map((effect, index) => (
                                    <TemporaryEffect key={index} effect={effect} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="upgrades-container">
                        <div className="upgrades-header">
                            <h3>Améliorations</h3>
                            {saveStatus.error && (
                                <div className="save-error">{saveStatus.error}</div>
                            )}
                            <div className="save-status">
                                {saveStatus.saving ? 'Sauvegarde...' : saveStatus.lastSaved ?
                                    `Dernier enregistrement: ${saveStatus.lastSaved.toLocaleTimeString()}` : ''}
                            </div>
                        </div>

                        <div className="upgrade-summary-section">
                            <h4>Vos améliorations</h4>
                            <div className="upgrade-summary-grid">
                                {Object.entries(ownedUpgradesByType).map(([type, upgrades]) => (
                                    upgrades.length > 0 && (
                                        <div key={type} className="upgrade-category">
                                            <h5>{type === 'clickPower' ? 'Clic' :
                                                type === 'autoClicker' ? 'Auto' :
                                                    type === 'multiplier' ? 'Multi' : 'Spécial'}</h5>
                                            <div className="upgrade-category-items">
                                                {upgrades.map(upgrade => (
                                                    <UpgradeSummary
                                                        key={upgrade._id}
                                                        upgrade={upgrade}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        <div className="available-upgrades">
                            <h4>Améliorations disponibles</h4>

                            <div className="upgrade-tabs">
                                <div className="upgrade-category">
                                    <h5>Puissance de clic</h5>
                                    <div className="upgrades-list">
                                        {filterUpgradesByCategory('clickPower').map(upgrade => (
                                            <Upgrade
                                                key={upgrade._id}
                                                upgrade={upgrade}
                                                canAfford={clicks >= (upgrade.nextCost || upgrade.baseCost)}
                                                onBuy={() => buyUpgrade(upgrade._id)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="upgrade-category">
                                    <h5>Auto-clickers</h5>
                                    <div className="upgrades-list">
                                        {filterUpgradesByCategory('autoClicker').map(upgrade => (
                                            <Upgrade
                                                key={upgrade._id}
                                                upgrade={upgrade}
                                                canAfford={clicks >= (upgrade.nextCost || upgrade.baseCost)}
                                                onBuy={() => buyUpgrade(upgrade._id)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="upgrade-category">
                                    <h5>Multiplicateurs</h5>
                                    <div className="upgrades-list">
                                        {filterUpgradesByCategory('multiplier').map(upgrade => (
                                            <Upgrade
                                                key={upgrade._id}
                                                upgrade={upgrade}
                                                canAfford={clicks >= (upgrade.nextCost || upgrade.baseCost)}
                                                onBuy={() => buyUpgrade(upgrade._id)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="upgrade-category">
                                    <h5>Spécial</h5>
                                    <div className="upgrades-list">
                                        {filterUpgradesByCategory('special').map(upgrade => (
                                            <Upgrade
                                                key={upgrade._id}
                                                upgrade={upgrade}
                                                canAfford={clicks >= (upgrade.nextCost || upgrade.baseCost)}
                                                onBuy={() => buyUpgrade(upgrade._id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <QuestProgress />
                </>
            )}
        </div>
    );
};

export default ClickerGame; 