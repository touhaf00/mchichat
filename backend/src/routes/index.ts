import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { salonRouter } from "../modules/salons/salon.routes";

const router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({
        message: "Mchichat API is running",
    });
});

router.use("/auth", authRouter);
router.use("/salons", salonRouter);

export { router };