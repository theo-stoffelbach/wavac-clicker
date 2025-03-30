import express from 'express';
import { login, register, logout } from '../controller/middleware.js';

const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/logout', logout);


export default authRouter;
