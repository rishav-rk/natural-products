import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as staticController from "../../controllers/user/static.controller.js";
import TaskRouterCapability from "twilio/lib/jwt/taskrouter/TaskRouterCapability.js";
import { USER_TYPE } from "../../config/appConstants.js";

const router = Router();

router.get("/contact-us", auth(USER_TYPE.USER), staticController.getContactUs);
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

export default router;
