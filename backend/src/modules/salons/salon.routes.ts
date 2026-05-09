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

salonRouter.get("/", authenticate, getSalons);
salonRouter.get("/:id", authenticate, getSalon);
salonRouter.post("/", authenticate, createSalonHandler);
salonRouter.put("/:id", authenticate, updateSalonHandler);
salonRouter.delete("/:id", authenticate, deleteSalonHandler);

export { salonRouter };