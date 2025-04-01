import express from "express";
import { handleGetAllUsers, handleGetUserById, handleRegister, handleLogin, handleLogout, addGuildToUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/", handleGetAllUsers);
userRouter.get("/:id", handleGetUserById);
userRouter.post("/guild/:guild_id", addGuildToUser);

userRouter.post("/", handleRegister);
userRouter.post("/login", handleLogin);
userRouter.post("/logout", handleLogout);

export default userRouter; 