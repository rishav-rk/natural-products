import { Router } from "express";
import {
  getProfileValidator,
  updateProfileValidator,
} from "../../validators/user/profile.validator.js";
import { validate } from "../../middlewares/validate.js";
import { USER_TYPE } from "../../config/appConstants.js";
import auth from "../../middlewares/auth.js";
import * as profileController from "../../controllers/user/profile.controller.js";

const router = Router();

router.get(
  "/",
  auth(USER_TYPE.USER),
  validate(getProfileValidator),
  profileController.getProfile,
);

router.post(
  "/change-password",
  auth(USER_TYPE.USER),
  validate(updateProfileValidator),
  profileController.updateProfile,
);

router.put(
  "/",
  auth(USER_TYPE.USER),
  validate(updateProfileValidator),
  profileController.updateProfile,
);

export default router;
