import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import * as authController from "../../controllers/user/auth.controller.js";
import * as authValidator from "../../validators/user/auth.validator.js";
import { USER_TYPE, TOKEN_TYPE } from "../../config/appConstants.js";
import auth from "../../middlewares/auth.js";
import otpAuth from "../../middlewares/otpAuth.js"; // Import the specialized middleware

const router = Router();

// ==========================================
// 1. COMPLETELY PUBLIC ROUTES
// ==========================================
router.post(
  "/signup",
  validate(authValidator.signUpValidator),
  authController.signUp,
);

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

// ==========================================
// 2. SPECIALIZED OTP / ACTIONS ROUTES
// Ensures the user has a valid FORGOTPASSWORD/OTP token type.
// Bypasses the strict standard profile active/verified user checks.
// ==========================================
router.post(
  "/verify-otp",
  otpAuth(TOKEN_TYPE.FORGOTPASSWORD), // Enforces specialized token criteria
  validate(authValidator.verifyOtpValidator),
  authController.verifyOtp,
);

router.post(
  "/reset-password",
  otpAuth(TOKEN_TYPE.FORGOTPASSWORD), // Enforces specialized token criteria
  validate(authValidator.resetPasswordValidator),
  authController.resetPassword,
);

router.post(
  "/resend-otp",
  otpAuth(TOKEN_TYPE.FORGOTPASSWORD), // Enforces specialized token criteria
  validate(authValidator.resendOtpValidator),
  authController.resendOtp,
);

// ==========================================
// 3. FULLY PROTECTED ROUTES
// Requires a fully active, verified standard user token.
// ==========================================
router.post(
  "/logout",
  auth([USER_TYPE.USER]), // Standard RBAC check
  validate(authValidator.logoutValidator),
  authController.logout,
);

export default router;