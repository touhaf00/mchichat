import { Router } from "express";
import { login, me, register } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authenticate, me);

export { authRouter };