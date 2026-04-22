import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import * as authController from "../../controllers/user/auth.controller.js";
import * as authValidator from "../../validators/user/auth.validator.js";
import { USER_TYPE } from "../../config/appConstants.js";
import auth from "../../middlewares/auth.js";

const router = Router();

router.post(
  "/signup",
  validate(authValidator.signUpValidator),
  authController.signUp,
);

router.get('/test', (req, res) => {
  res.json({ message: "Test route is working!" });
});

router.post(
  "/login",
  validate(authValidator.loginValidator),
  authController.login,
);

router.post(
  "/forgot-password",
  validate(authValidator.forgotPasswordValidator),
  authController.forgotPassword,
);

router.post(
  "/verify-otp",
  auth(USER_TYPE.USER),
  validate(authValidator.verifyOtpValidator),
  authController.verifyOtp,
);

router.post(
  "/reset-password",
  auth(USER_TYPE.USER),
  validate(authValidator.resetPasswordValidator),
  authController.resetPassword,
);

router.post(
  "/resend-otp",
  auth(USER_TYPE.USER),
  validate(authValidator.resendOtpValidator),
  authController.resendOtp,
);

router.post(
  "/logout",
  auth(USER_TYPE.USER),
  validate(authValidator.logoutValidator),
  authController.logout,
);
export default router;
