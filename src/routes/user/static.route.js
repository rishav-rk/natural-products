import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as staticController from "../../controllers/user/static.controller.js";
import TaskRouterCapability from "twilio/lib/jwt/taskrouter/TaskRouterCapability.js";
import { USER_TYPE } from "../../config/appConstants.js";
import {
  getReferralCodesValidator,
  getReferralTreeValidator,
  referralDetailsValidator,
  validateContactUs,
} from "../../validators/user/profile.validator.js";

import { OperationalError } from "../../utils/error.js";
import Referral from "../../models/referral.model.js";
import { catchAsync } from "../../utils/universalFunctions.js";

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

router.get(
  "/my-referral-codes",
  auth(USER_TYPE.USER),
  validate(getReferralCodesValidator),
  staticController.getReferralCodes,
);

router.get(
  "/referral-by-id/:codeId",
  auth(USER_TYPE.USER),
  validate(referralDetailsValidator),
  staticController.getReferralById,
);

router.get(
  "/referral-tree/:codeId",
  auth(USER_TYPE.USER),
  validate(getReferralTreeValidator),
  staticController.getReferralTree,
);

router.post(
  "/use-code",
  auth(USER_TYPE.USER),
  catchAsync(async (req, res) => {
    const { code } = req.body;
    const token = req.token;
    let amount = 500;
    let level = 1;

    const referral = await Referral.findOne({
      code: code,
      timesUsed: { $lt: 10 },
    });

    if (!referral) {
      throw new OperationalError(400, "INVALID CODE");
    }

    // same person is not allowed to use the same referral code more than once, but can use it once (to prevent fake referrals)

    if (
      referral.user.toString() === token.user._id.toString() &&
      referral.hasUsedItsOwnCode
    ) {
      throw new OperationalError(
        400,
        "YOU CANNOT USE YOUR OWN REFERRAL CODE TWICE",
      );
    } else if (referral.user.toString() === token.user._id.toString()) {
      referral.hasUsedItsOwnCode = true;
    }

    // make an entry in referral transactions for the current user
    await Referral.create({
      user: token.user._id,
      code: Math.floor(Math.random() * 10000000000),
      parent: referral._id,
    });

    referral.transactions.push({
      paidBy: token.user._id,
      paidOn: new Date(),
      amount: amount,
      level: level,
    });

    referral.timesUsed += 1;
    referral.l1.earnings += amount;
    referral.l1.referrals += 1;

    let parent = referral.parent;
    while (parent && level < 5) {
      level += 1;
      amount -= 100;
      const parentReferral = await Referral.findById(parent);

      parentReferral.transactions.push({
        paidBy: token.user._id,
        paidOn: new Date(),
        amount: amount,
        level: level,
      });

      parentReferral[`l${level}`].earnings += amount;
      parentReferral[`l${level}`].referrals += 1;

      await parentReferral.save();
      parent = parentReferral.parent;
    }

    await referral.save();
    return res.json({ message: "Referral code used successfully", referral });
  }),
);

export default router;
