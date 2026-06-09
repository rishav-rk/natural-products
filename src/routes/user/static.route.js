import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as staticController from "../../controllers/user/static.controller.js";
import {
  USER_TYPE,
  STATUS_CODES,
  ERROR_MESSAGES,
} from "../../config/appConstants.js";
import { validateContactUs, applyCodeValidator } from "../../validators/user/profile.validator.js";
import { checkCodeAvailability } from "../../controllers/user/referral.controller.js";
import { OperationalError } from "../../utils/error.js";

const router = Router();

router.post(
  "/contact-us",
  auth(USER_TYPE.USER),
  validate(validateContactUs),
  staticController.submitContactUs,
);
router.get("/about-us", auth(USER_TYPE.USER), staticController.getAboutUs);
router.get(
  "/privacy-policy",
  auth(USER_TYPE.USER),
  staticController.getPrivacyPolicy,
);
router.get(
  "/terms-and-conditions",
  auth(USER_TYPE.USER),
  staticController.getTermsAndConditions,
);

router.post(
  "/check-code",
  auth(USER_TYPE.USER),
  validate(applyCodeValidator), 
  checkCodeAvailability
);

export default router;