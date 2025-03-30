import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
// Commentons l'import du service API qui n'existe pas
// import { clickerService } from '../services/api';

const ClickerGame = () => {
    const { user } = useUser();
    const [clicks, setClicks] = useState(0);
    const [clickPower, setClickPower] = useState(1);
    const [autoClickRate, setAutoClickRate] = useState(0);
    const [lastSavedClicks, setLastSavedClicks] = useState(0);
    const [clickTimestamps, setClickTimestamps] = useState([]);
    const [securityToken, setSecurityToken] = useState('');
    const [saveStatus, setSaveStatus] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [clicksSinceLastSave, setClicksSinceLastSave] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    // Ajoutons un état pour les activités suspectes
    const [suspiciousActivities, setSuspiciousActivities] = useState([]);

    const autoClickIntervalRef = useRef(null);
    const saveIntervalRef = useRef(null);
    const [clickWaves, setClickWaves] = useState([]);

    // Définition des upgrades disponibles avec catégories
    const [upgrades, setUpgrades] = useState([
        // Améliorations pour le clic
        { id: 1, name: "Clics +1", value: 13, cost: 50, type: "click", power: 1, owned: 0, category: "click", description: "Augmente la puissance de clic de 1", unlocked: true },
        { id: 2, name: "Clics +2", value: 11, cost: 200, type: "click", power: 2, owned: 0, category: "click", description: "Augmente la puissance de clic de 2", unlocked: false, unlockAt: 150 },
        { id: 4, name: "Clics +5", value: 21, cost: 500, type: "click", power: 5, owned: 0, category: "click", description: "Augmente la puissance de clic de 5", unlocked: false, unlockAt: 400 },

        // Améliorations pour l'auto-clic
        { id: 3, name: "Auto +1", value: 18, cost: 300, type: "auto", power: 1, owned: 0, category: "auto", description: "Ajoute 1 clic automatique par seconde", unlocked: false, unlockAt: 250 },
        { id: 5, name: "Auto +3", value: 31, cost: 800, type: "auto", power: 3, owned: 0, category: "auto", description: "Ajoute 3 clics automatiques par seconde", unlocked: false, unlockAt: 700 },

        // Multiplicateurs
        { id: 6, name: "Boost x2", value: 6, cost: 1500, type: "multiplier", power: 2, owned: 0, category: "boost", description: "Multiplie la puissance de clic par 2", unlocked: false, unlockAt: 1000 },
        { id: 7, name: "Boost x3", value: 9, cost: 5000, type: "multiplier", power: 3, owned: 0, category: "boost", description: "Multiplie la puissance de clic par 3", unlocked: false, unlockAt: 3000 }
    ]);

    // Débloquer les améliorations en fonction des clics
    useEffect(() => {
        const updatedUpgrades = upgrades.map(upgrade => {
            if (!upgrade.unlocked && upgrade.unlockAt && clicks >= upgrade.unlockAt) {
                return { ...upgrade, unlocked: true };
            }
            return upgrade;
        });

        if (JSON.stringify(updatedUpgrades) !== JSON.stringify(upgrades)) {
            setUpgrades(updatedUpgrades);
        }
    }, [clicks, upgrades]);

    // Charger les données de jeu au démarrage
    useEffect(() => {
        if (user?.id) {
            loadGameData();
        } else {
            // Ne pas rediriger, simplement initialiser avec des valeurs par défaut
            setIsInitialLoad(false);
        }
    }, [user]);

    // Fonctions pour charger les données de jeu
    const loadGameData = async () => {
        try {
            // Utiliser localStorage au lieu de l'API backend
            const storedData = localStorage.getItem('clickerGameData');
            if (storedData) {
                const data = JSON.parse(storedData);

                // Mettre à jour l'état avec les données stockées
                setClicks(data.clicks || 0);
                setClickPower(data.clickPower || 1);
                setAutoClickRate(data.autoClickRate || 0);
                setLastSavedClicks(data.clicks || 0);
                setSecurityToken(data.securityToken || '');

                if (data.upgrades && data.upgrades.length > 0) {
                    setUpgrades(data.upgrades);
                }

                console.log('Données du jeu chargées depuis le stockage local:', data);
            }
            setIsInitialLoad(false);
        } catch (error) {
            console.error('Erreur lors du chargement des données de jeu:', error);
            setIsInitialLoad(false);
        }
    };

    // Sauvegarder les données de jeu périodiquement
    useEffect(() => {
        if (isInitialLoad) return;

        // Réduire la fréquence de sauvegarde pour éviter de surcharger le serveur
        // Sauvegarder toutes les 5 secondes au lieu de chaque seconde
        saveIntervalRef.current = setInterval(() => {
            if (user?.id && lastSavedClicks !== clicks) {
                saveGameData();
            }
        }, 5000); // Modifié de 1000 à 5000 ms

        // Sauvegarder avant de quitter la page
        const handleBeforeUnload = () => {
            if (user?.id && lastSavedClicks !== clicks) {
                saveGameData();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            if (saveIntervalRef.current) {
                clearInterval(saveIntervalRef.current);
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [clicks, clickPower, autoClickRate, upgrades, user, lastSavedClicks, clicksSinceLastSave, isInitialLoad]);

    // Fonction pour sauvegarder les données du jeu
    const saveGameData = async () => {
        if (!user?.id) return;

        try {
            setSaveStatus('saving');

            // Créer une copie des données du jeu pour éviter les problèmes de sérialisation
            const cleanUpgrades = upgrades.map(upgrade => ({
                id: upgrade.id,
                name: upgrade.name,
                value: upgrade.value,
                cost: upgrade.cost,
                type: upgrade.type,
                power: upgrade.power,
                owned: upgrade.owned,
                category: upgrade.category,
                unlocked: upgrade.unlocked,
                unlockAt: upgrade.unlockAt
            }));

            const gameData = {
                userId: user.id,
                clicks,
                clickPower,
                autoClickRate,
                upgrades: cleanUpgrades,
                securityToken: 'local-' + Date.now(),
                timestamp: Date.now()
            };

            // Sauvegarder dans localStorage
            localStorage.setItem('clickerGameData', JSON.stringify(gameData));

            setLastSavedClicks(clicks);
            setClicksSinceLastSave(0);
            setSaveStatus('saved');

            console.log('Données sauvegardées en local:', gameData);

            // Réinitialiser le statut après 2 secondes
            setTimeout(() => {
                setSaveStatus('');
            }, 2000);
        } catch (error) {
            console.error('Erreur lors de la préparation des données:', error);
            setSaveStatus('error');
        }
    };

    // Fonction pour générer un checksum (anti-triche simple)
    const generateChecksum = () => {
        const data = `${clicks}:${clickPower}:${autoClickRate}:${user?.id}:${securityToken}`;
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir en entier 32 bits
        }
        return hash.toString();
    };

    // Gestion des clics automatiques
    useEffect(() => {
        if (autoClickRate > 0) {
            autoClickIntervalRef.current = setInterval(() => {
                setClicks(prev => prev + autoClickRate);
                setClicksSinceLastSave(prev => prev + autoClickRate);
            }, 1000);
        }

        return () => {
            if (autoClickIntervalRef.current) {
                clearInterval(autoClickIntervalRef.current);
            }
        };
    }, [autoClickRate]);

    // Fonction pour signaler une activité suspecte (remplaçant clickerService.reportSuspiciousActivity)
    const reportSuspiciousActivity = (activityData) => {
        console.warn("Activité suspecte détectée:", activityData);
        // Stocker localement les activités suspectes
        setSuspiciousActivities(prev => [...prev, {
            ...activityData,
            timestamp: Date.now()
        }]);
    };

    // Fonction principale pour gérer le clic
    const handleClick = (e) => {
        // Vérifier que le clic est légitime (anti-triche)
        if (!e.isTrusted) {
            console.warn("Tentative de clic automatisé détectée");
            // Utiliser notre fonction locale au lieu de l'API
            if (user?.id) {
                reportSuspiciousActivity({
                    userId: user.id,
                    type: 'fake_click',
                    timestamp: Date.now()
                });
            }
            return;
        }

        // Vérifier la fréquence des clics (anti-clicker automatique)
        const now = Date.now();
        setClickTimestamps(prev => {
            const newTimestamps = [...prev, now].slice(-10); // Garder les 10 derniers clics

            // Vérifier s'il y a trop de clics en peu de temps
            if (newTimestamps.length >= 5) {
                const interval = now - newTimestamps[newTimestamps.length - 5];
                // Si 5 clics en moins de 500ms (humainement très difficile)
                if (interval < 500) {
                    console.warn("Clics trop rapides détectés");
                    // Utiliser notre fonction locale au lieu de l'API
                    if (user?.id) {
                        reportSuspiciousActivity({
                            userId: user.id,
                            type: 'rapid_clicks',
                            interval,
                            timestamps: newTimestamps,
                            timestamp: Date.now()
                        });
                    }
                }
            }

            return newTimestamps;
        });

        // Ajouter à la valeur des clics
        setClicks(prev => prev + clickPower);
        setClicksSinceLastSave(prev => prev + clickPower);

        // Créer une animation de vague au point de clic
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newWave = {
            id: Date.now(),
            x,
            y
        };

        setClickWaves(prev => [...prev, newWave]);

        // Supprimer la vague après l'animation
        setTimeout(() => {
            setClickWaves(prev => prev.filter(wave => wave.id !== newWave.id));
        }, 800);

        // Sauvegarder seulement toutes les 10 clics pour éviter trop de requêtes
        if (user?.id && clicksSinceLastSave >= 10) {
            saveGameData();
        }
    };

    // Fonction pour acheter une amélioration
    const buyUpgrade = (upgradeId) => {
        const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
        if (upgradeIndex === -1) return;

        const upgrade = upgrades[upgradeIndex];

        if (clicks >= upgrade.cost && upgrade.unlocked) {
            // Mise à jour des clics (soustraction du coût)
            setClicks(prev => prev - upgrade.cost);

            // Mise à jour des upgrades
            const updatedUpgrades = [...upgrades];
            updatedUpgrades[upgradeIndex] = {
                ...upgrade,
                owned: upgrade.owned + 1,
                cost: Math.floor(upgrade.cost * 1.5) // Augmentation du coût pour le prochain achat
            };
            setUpgrades(updatedUpgrades);

            // Application de l'effet de l'amélioration
            if (upgrade.type === "click") {
                setClickPower(prev => prev + upgrade.power);
            } else if (upgrade.type === "auto") {
                setAutoClickRate(prev => prev + upgrade.power);
            } else if (upgrade.type === "multiplier") {
                setClickPower(prev => prev * upgrade.power);
            }

            // Sauvegarder immédiatement après achat d'amélioration
            saveGameData();
        }
    };

    // Filtrer les upgrades par catégorie
    const filteredUpgrades = activeCategory === 'all'
        ? upgrades.filter(u => u.unlocked)
        : upgrades.filter(u => u.category === activeCategory && u.unlocked);

    // Formater les grands nombres
    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
    };

    // Calculer le total des améliorations possédées
    const totalOwnedUpgrades = upgrades.reduce((sum, upgrade) => sum + upgrade.owned, 0);

    return (
        <div className="clicker-container">
            {/* Compteur de points au milieu en haut avec stats à gauche et droite */}
            <div className="click-counter-display">
                <div className="stats-wrapper">
                    <div className="click-power small-stat">Puissance: {formatNumber(clickPower)}/clic</div>
                    <div className="click-counter">{formatNumber(clicks)}</div>
                    <div className="auto-click-rate small-stat">Auto: {formatNumber(autoClickRate)}/sec</div>
                </div>
                {saveStatus === 'saving' && <div className="save-indicator saving">Sauvegarde...</div>}
                {saveStatus === 'saved' && <div className="save-indicator saved">Sauvegardé!</div>}
                {saveStatus === 'error' && <div className="save-indicator error">Erreur de sauvegarde</div>}
            </div>

            {/* Rectangle plus haut pour la zone de clic */}
            <div className="main-clicker-area" onClick={handleClick}>
                {clickWaves.map(wave => (
                    <div
                        key={wave.id}
                        className="click-wave"
                        style={{
                            left: wave.x - 50,
                            top: wave.y - 50,
                        }}
                    />
                ))}
                <div className="click-animation-container">
                    <div className="click-button">
                        <i className="fas fa-mouse-pointer"></i>
                        <span>CLIQUEZ ICI</span>
                    </div>
                </div>
            </div>


            {/* Résumé des améliorations possédées */}
            <div className="upgrades-summary">
                {upgrades.filter(upgrade => upgrade.owned > 0).map(upgrade => (
                    <div key={upgrade.id} className="upgrade-summary-item">
                        <div className="summary-effect">
                            {upgrade.type === "click" && `+${upgrade.power}`}
                            {upgrade.type === "auto" && `+${upgrade.power}/s`}
                            {upgrade.type === "multiplier" && `x${upgrade.power}`}
                        </div>
                        <div className="summary-count">x{upgrade.owned}</div>
                        <div className="summary-total">
                            {upgrade.type === "click" && `+${upgrade.power * upgrade.owned} clics`}
                            {upgrade.type === "auto" && `+${upgrade.power * upgrade.owned}/sec`}
                            {upgrade.type === "multiplier" && `x${Math.pow(upgrade.power, upgrade.owned)}`}
                        </div>
                    </div>
                ))}
                {upgrades.filter(upgrade => upgrade.owned > 0).length === 0 && (
                    <div className="no-upgrades-message">
                        <i className="fas fa-shopping-cart"></i> Achetez des améliorations pour les voir ici
                    </div>
                )}
            </div>

            {/* Barre de progression des améliorations */}
            <div className="upgrade-progress">
                <div className="progress-label">Améliorations débloquées: {upgrades.filter(u => u.unlocked).length}/{upgrades.length}</div>
                <div className="progress-label">Améliorations achetées: {totalOwnedUpgrades}</div>
            </div>

            {/* Filtres de catégories */}
            <div className="upgrade-categories">
                <button
                    className={`category-button ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                >
                    Tous
                </button>
                <button
                    className={`category-button ${activeCategory === 'click' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('click')}
                >
                    Clics
                </button>
                <button
                    className={`category-button ${activeCategory === 'auto' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('auto')}
                >
                    Auto
                </button>
                <button
                    className={`category-button ${activeCategory === 'boost' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('boost')}
                >
                    Boost
                </button>
            </div>

            {/* Grille d'améliorations en forme de cubes */}
            <div className="upgrades-cube-container">
                {filteredUpgrades.map(upgrade => (
                    <div
                        key={upgrade.id}
                        className={`upgrade-cube ${clicks >= upgrade.cost ? 'available' : 'locked'} ${upgrade.owned > 0 ? 'owned' : ''}`}
                        onClick={() => buyUpgrade(upgrade.id)}
                    >
                        <div className="cube-face cube-face-front">
                            <span className="cube-value">
                                {upgrade.type === "click" && `+${upgrade.power}`}
                                {upgrade.type === "auto" && `+${upgrade.power}/s`}
                                {upgrade.type === "multiplier" && `x${upgrade.power}`}
                            </span>
                        </div>
                        <div className="cube-face cube-face-back">
                            {upgrade.owned > 0 && (
                                <div className="cube-owned">x{upgrade.owned}</div>
                            )}
                        </div>
                        <div className="cube-face cube-face-right">
                            <span className="cube-cost">
                                <i className="fas fa-coins"></i> {formatNumber(upgrade.cost)}
                            </span>
                        </div>
                        <div className="cube-face cube-face-left">
                            <span className="cube-type">
                                {upgrade.type === "click" && <i className="fas fa-hand-pointer"></i>}
                                {upgrade.type === "auto" && <i className="fas fa-clock"></i>}
                                {upgrade.type === "multiplier" && <i className="fas fa-bolt"></i>}
                            </span>
                        </div>
                        <div className="cube-face cube-face-top">
                            <span className="cube-name">{upgrade.name}</span>
                        </div>
                        <div className="cube-face cube-face-bottom">
                            <span className="cube-category">{upgrade.category}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message pour les améliorations à débloquer */}
            {upgrades.some(u => !u.unlocked) && (
                <div className="unlock-message">
                    <i className="fas fa-lock"></i>
                    Continuez à cliquer pour débloquer plus d'améliorations!
                </div>
            )}
        </div>
    );
};

export default ClickerGame; 