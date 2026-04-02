import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
    res.status(200).json({
        message: "Mchichat API is running",
    });
});

export { router };