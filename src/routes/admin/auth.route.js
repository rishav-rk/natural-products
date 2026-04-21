import { Router } from "express";
import * as adminValidator from "../../validators/admin/auth.validator.js";
import { validate } from "../../middlewares/validate.js";
import * as adminController from "../../controllers/admin/auth.controller.js";
import auth from "../../middlewares/auth.js";
import { USER_TYPE } from "../../config/appConstants.js";

const router = Router();

router.post(
  "/auth/login",
  validate(adminValidator.loginValidator),
  adminController.login,
);

router.get(
  "/profile",
  auth(USER_TYPE.ADMIN),
  adminController.getProfile,
);

router.patch(
  "/change-password",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.changePasswordValidator),
  adminController.changePassword,
);

router.put("/update-profile",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.updateProfileValidator),
  adminController.updateProfile,
);

router.post(
  "/logout",
  auth(USER_TYPE.ADMIN),
  validate(adminValidator.logoutValidator),
  adminController.logout,
);

export default router;
