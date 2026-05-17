import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { uploadProfileImage } from "../../middlewares/profileUpload.middleware";
import {
    getMyProfileHandler,
    getProfileHandler,
    updateAvatarHandler,
    updateBannerHandler,
    updateMyProfileHandler,
} from "./profile.controller";

const profileRouter = Router();

profileRouter.get("/me", authenticate, getMyProfileHandler);
profileRouter.put("/me", authenticate, updateMyProfileHandler);

profileRouter.post(
    "/me/avatar",
    authenticate,
    uploadProfileImage.single("avatar"),
    updateAvatarHandler
);

profileRouter.post(
    "/me/banner",
    authenticate,
    uploadProfileImage.single("banner"),
    updateBannerHandler
);

profileRouter.get("/:username", authenticate, getProfileHandler);

export { profileRouter };