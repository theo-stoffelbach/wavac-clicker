import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import socketService from '../../services/socket';

const ClickerGame = () => {
    const { user } = useUser();
    const [gameState, setGameState] = useState({
        clicks: 0,
        clickValue: 1,
        bonusActive: false,
        bonusMultiplier: 1,
        bonusTimeRemaining: 0
    });

    // Initialiser le socket et écouter les mises à jour
    useEffect(() => {
        const socket = socketService.initializeSocket();

        // S'abonner aux mises à jour des clics
        const unsubscribeClickUpdate = socketService.subscribeToEvent('click_update', (data) => {
            if (data.userId === user?.id) {
                setGameState(prevState => ({
                    ...prevState,
                    clicks: data.clicks,
                    clickValue: data.clickValue
                }));
            }
        });

        // S'abonner aux mises à jour des bonus
        const unsubscribeBonusUpdate = socketService.subscribeToEvent('bonus_update', (data) => {
            if (data.userId === user?.id) {
                setGameState(prevState => ({
                    ...prevState,
                    bonusActive: data.active,
                    bonusMultiplier: data.multiplier,
                    bonusTimeRemaining: data.timeRemaining
                }));
            }
        });

        // Nettoyer les abonnements
        return () => {
            unsubscribeClickUpdate();
            unsubscribeBonusUpdate();
            socketService.disconnectSocket();
        };
    }, [user]);

    // Décompte du temps restant pour les bonus
    useEffect(() => {
        let timer;
        if (gameState.bonusActive && gameState.bonusTimeRemaining > 0) {
            timer = setInterval(() => {
                setGameState(prevState => ({
                    ...prevState,
                    bonusTimeRemaining: prevState.bonusTimeRemaining - 1,
                    bonusActive: prevState.bonusTimeRemaining > 1
                }));
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [gameState.bonusActive, gameState.bonusTimeRemaining]);

    // Gérer le clic
    const handleClick = () => {
        // Mise à jour locale immédiate pour une meilleure UX
        const effectiveClickValue = gameState.clickValue * (gameState.bonusActive ? gameState.bonusMultiplier : 1);
        setGameState(prevState => ({
            ...prevState,
            clicks: prevState.clicks + effectiveClickValue
        }));

        // Envoyer l'événement au serveur
        socketService.emitEvent('click', {
            userId: user?.id,
            clickValue: effectiveClickValue
        });
    };

    // Formater le nombre avec des séparateurs de milliers
    const formatNumber = (num) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    return (
        <div className="clicker-game">
            <div className="clicks-display">
                <h2>{formatNumber(gameState.clicks)}</h2>
                <p>Clics totaux</p>
            </div>

            <div className="click-info">
                <p>Valeur de clic: <strong>{gameState.clickValue}</strong></p>
                {gameState.bonusActive && (
                    <div className="bonus-active">
                        <p>
                            Bonus actif! x{gameState.bonusMultiplier} pendant {gameState.bonusTimeRemaining}s
                        </p>
                        <div className="bonus-timer">
                            <div
                                className="bonus-timer-fill"
                                style={{ width: `${(gameState.bonusTimeRemaining / 30) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            <button
                className={`click-button ${gameState.bonusActive ? 'bonus-active' : ''}`}
                onClick={handleClick}
            >
                CLIQUER
            </button>

            <div className="click-stats">
                <div className="stat-item">
                    <h4>Par seconde</h4>
                    <p>0</p>
                </div>
                <div className="stat-item">
                    <h4>Par clic</h4>
                    <p>{gameState.clickValue * (gameState.bonusActive ? gameState.bonusMultiplier : 1)}</p>
                </div>
            </div>
        </div>
    );
};

export default ClickerGame; 