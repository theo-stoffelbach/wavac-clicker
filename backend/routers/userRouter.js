import express from 'express';
import { getUsers, getUserById, addGuildToUser } from '../controller/userController.js';

const userRouter = express.Router();

userRouter.get('/', getUsers);
userRouter.get('/:id', getUserById);
userRouter.post('/guild/:guild_id', addGuildToUser);

export default userRouter; 