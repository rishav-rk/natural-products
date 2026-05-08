import { Router } from "express";
import * as adminValidator from "../../validators/admin/auth.validator.js";
import { validate } from "../../middlewares/validate.js";
import * as adminController from "../../controllers/admin/auth.controller.js";
import auth from "../../middlewares/auth.js";
import { USER_TYPE } from "../../config/appConstants.js";

const router = Router();

router.post(
  "/auth/login",
  validate(adminValidator.loginAdminValidator),
  adminController.login,
);

router.get("/profile", auth(USER_TYPE.ADMIN), adminController.getProfile);

router.patch(
  "/profile/change-password",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.changeAdminPasswordValidator),
  adminController.changePassword,
);

router.put(
  "/profile/update-profile",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.updateAdminProfileValidator),
  adminController.updateProfile,
);

router.post("/auth/logout", auth(USER_TYPE.ADMIN), adminController.logout);

router.get(
  "/dashboard",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.getDashboardValidator),
  adminController.getDashboard,
);

router.get(
  "/transactions", 
  auth(USER_TYPE.ADMIN), 
  validate(adminValidator.getTransactionsValidator), 
  adminController.getTransactions
)

export default router;
