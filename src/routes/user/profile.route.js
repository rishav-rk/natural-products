import { Router } from "express";
import {
  getProfileValidator,
  updateProfileValidator,
  changePasswordValidator,
  addAddressValidator,
  updateAddressValidator,
  deleteAddressValidator,
  getNextLevelValidator,
  getReferralCodesValidator,
  getReferralTreeValidator,
  referralDetailsValidator,
  validateContactUs,
  applyCodeValidator,
} from "../../validators/user/profile.validator.js";
import { walletTransactionsValidator } from "../../validators/user/wallet.validator.js";
import { validate } from "../../middlewares/validate.js";
import { USER_TYPE } from "../../config/appConstants.js";
import auth from "../../middlewares/auth.js";
import * as profileController from "../../controllers/user/profile.controller.js";
import * as referralController from "../../controllers/user/referral.controller.js"
import * as walletController from "../../controllers/user/wallet.controller.js";

const router = Router();

router.get(
  "/",
  auth(USER_TYPE.USER),
  validate(getProfileValidator),
  profileController.getProfile,
);

router.patch(
  "/change-password",
  auth(USER_TYPE.USER),
  validate(changePasswordValidator),
  profileController.changePassword,
);

router.delete("/", auth(USER_TYPE.USER), profileController.deleteAccount);

router.put(
  "/",
  auth(USER_TYPE.USER),
  validate(updateProfileValidator),
  profileController.updateProfile,
);

router.post(
  "/add-address",
  auth(USER_TYPE.USER),
  validate(addAddressValidator),
  profileController.addAddress,
);

router.put(
  "/update-address/:addressId",
  auth(USER_TYPE.USER),
  validate(updateAddressValidator),
  profileController.updateAddress,
);

router.delete(
  "/delete-address",
  auth(USER_TYPE.USER),
  validate(deleteAddressValidator),
  profileController.deleteAddress,
);

// wallet.routes.js
router.get("/balance", auth(USER_TYPE.USER), walletController.getBalance);

router.get(
  "/transactions",
  auth(USER_TYPE.USER),
  validate(walletTransactionsValidator),
  walletController.getTransactions,
);
router.get(
  "/earnings",
  auth(USER_TYPE.USER),
  validate(walletTransactionsValidator),
  walletController.getEarnings,
);

// wallet.routes.js
router.get("/summary", auth(USER_TYPE.USER), walletController.getSummary);

router.get(
  "/my-referral-codes",
  auth(USER_TYPE.USER),
  validate(getReferralCodesValidator),
  referralController.getReferralCodes,
);
router.get(
  "/referral-by-id/:codeId",
  auth(USER_TYPE.USER),
  validate(referralDetailsValidator),
  referralController.getReferralById,
);
router.get(
  "/referral-tree/:codeId",
  auth(USER_TYPE.USER),
  validate(getReferralTreeValidator),
  referralController.getReferralTree,
);
router.get(
  "/next-level/:codeId",
  auth(USER_TYPE.USER),
  validate(getNextLevelValidator),
  referralController.getNextLevel,
);

export default router;
