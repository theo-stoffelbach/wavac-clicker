import express from 'express';
import { createGuild, getGuildById, getAllGuilds } from '../controllers/guildController.js';

const guildRouter = express.Router();

guildRouter.post('/create', createGuild);
guildRouter.get('/:id', getGuildById);
guildRouter.get('/', getAllGuilds);

export default guildRouter;
