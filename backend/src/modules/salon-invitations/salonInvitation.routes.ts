import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
    acceptSalonInvitationHandler,
    getMySalonInvitationsHandler,
    inviteToSalonHandler,
    rejectSalonInvitationHandler,
} from "./salonInvitation.controller";

const salonInvitationRouter = Router();

salonInvitationRouter.post(
    "/salons/:id/invite",
    authenticate,
    inviteToSalonHandler
);

salonInvitationRouter.get(
    "/salon-invitations",
    authenticate,
    getMySalonInvitationsHandler
);

salonInvitationRouter.post(
    "/salon-invitations/:id/accept",
    authenticate,
    acceptSalonInvitationHandler
);

salonInvitationRouter.post(
    "/salon-invitations/:id/reject",
    authenticate,
    rejectSalonInvitationHandler
);

export { salonInvitationRouter };