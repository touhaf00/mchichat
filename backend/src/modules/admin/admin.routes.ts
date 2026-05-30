import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/admin.middleware";
import {
    deleteUserByAdminHandler,
    getAdminStatsHandler,
    getAdminUsersHandler,
    updateUserRoleHandler,
} from "./admin.controller";

const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(requireAdmin);

adminRouter.get("/admin/stats", getAdminStatsHandler);

adminRouter.get("/admin/users", getAdminUsersHandler);

adminRouter.patch("/admin/users/:userId/role", updateUserRoleHandler);

adminRouter.delete("/admin/users/:userId", deleteUserByAdminHandler);

export { adminRouter };