import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { uploadProfileMedia } from "../../middlewares/profileUpload.middleware";
import {
    getProfileHandler,
    updateMyProfileHandler,
    deleteMyAccountHandler,
} from "./profile.controller";

const profileRouter = Router();

profileRouter.put(
    "/me/settings",
    authenticate,
    uploadProfileMedia.fields([
        { name: "avatar", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    updateMyProfileHandler
);

profileRouter.delete("/me", authenticate, deleteMyAccountHandler);
profileRouter.get("/:username", authenticate, getProfileHandler);

export { profileRouter };