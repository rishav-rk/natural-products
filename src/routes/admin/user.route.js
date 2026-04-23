import { Router } from "express";
import * as userController from "../../controllers/admin/user.controller.js";
import { USER_TYPE } from "../../config/appConstants.js";
import * as userValidator from "../../validators/admin/user.validator.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

const router = Router();

router.get(
  "/",
  auth(USER_TYPE.ADMIN),
  validate(userValidator.getAllUsers),
  userController.getUsers,
);

router.get(
  "/getUser/:id",
  auth(USER_TYPE.ADMIN),
  validate(userValidator.getUserById),
  userController.getUserById,
);

router.put(
  "/enable-disable",
  auth(USER_TYPE.ADMIN),
  validate(userValidator.enableDisableUser),
  userController.enableDisableUser,
);


export default router;
