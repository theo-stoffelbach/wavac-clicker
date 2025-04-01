import express from 'express';

const otherRouter = express.Router();

otherRouter.get('/teapot', (req, res) => {
    try {
        if (req.body.tea === 'coffee') {
            const error = new Error('Je suis une théière, pas une cafetière ! 😠☕');
            error.statusCode = 418
            throw error;
        }
        res.send('Je suis une théière. Je ne peux pas préparer de café.');
    } catch (error) {
        if (error.statusCode) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    }
});

export default otherRouter;
