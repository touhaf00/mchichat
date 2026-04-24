import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
    createSalonHandler,
    deleteSalonHandler,
    getSalon,
    getSalons,
    updateSalonHandler,
} from "./salon.controller";

const salonRouter = Router();

salonRouter.get("/", getSalons);
salonRouter.get("/:id", getSalon);
salonRouter.post("/", authenticate, createSalonHandler);
salonRouter.put("/:id", authenticate, updateSalonHandler);
salonRouter.delete("/:id", authenticate, deleteSalonHandler);

export { salonRouter };