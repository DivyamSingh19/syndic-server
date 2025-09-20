import express, { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  me,
  refreshTokens,
} from "../controllers/auth";
import { authMiddleware } from "../middlewares/auth";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/me", authMiddleware, me);
authRouter.post("/refresh", refreshTokens);

export default authRouter;
