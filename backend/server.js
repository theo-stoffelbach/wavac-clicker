import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';


try {
    app.listen(PORT, HOST, () => {
        console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
    });
} catch (error) {
    console.error('Impossible de démarrer le serveur:', error);
    process.exit(1);
}