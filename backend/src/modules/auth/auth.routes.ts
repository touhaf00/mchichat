import { Router } from "express";
import { login, logout, me, refresh, register } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.get("/me", authenticate, me);

export { authRouter };
