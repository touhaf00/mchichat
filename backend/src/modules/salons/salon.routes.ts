import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
    acceptSalonMembershipRequestHandler,
    createSalonHandler,
    deleteSalonHandler,
    getSalon,
    getSalonMembershipRequestsHandler,
    getSalons,
    rejectSalonMembershipRequestHandler,
    requestSalonMembershipHandler,
    updateSalonHandler,
} from "./salon.controller";

const salonRouter = Router();

salonRouter.get("/", authenticate, getSalons);
salonRouter.get("/membership-requests", authenticate, getSalonMembershipRequestsHandler);

salonRouter.get("/:id", authenticate, getSalon);
salonRouter.post("/", authenticate, createSalonHandler);
salonRouter.put("/:id", authenticate, updateSalonHandler);
salonRouter.delete("/:id", authenticate, deleteSalonHandler);

salonRouter.post("/:id/membership-requests", authenticate, requestSalonMembershipHandler);
salonRouter.post(
    "/membership-requests/:requestId/accept",
    authenticate,
    acceptSalonMembershipRequestHandler
);
salonRouter.post(
    "/membership-requests/:requestId/reject",
    authenticate,
    rejectSalonMembershipRequestHandler
);

export { salonRouter };