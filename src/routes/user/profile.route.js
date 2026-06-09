import { Router } from "express";
import {
  getProfileValidator,
  updateProfileValidator,
  changePasswordValidator,
  addAddressValidator,
  updateAddressValidator,
  deleteAddressValidator,
} from "../../validators/user/profile.validator.js";
import { walletTransactionsValidator } from "../../validators/user/wallet.validator.js";
import { validate } from "../../middlewares/validate.js";
import { USER_TYPE } from "../../config/appConstants.js";
import auth from "../../middlewares/auth.js";
import * as profileController from "../../controllers/user/profile.controller.js";
import * as walletController from "../../controllers/user/wallet.controller.js"

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
router.get(
  "/balance",
  auth(USER_TYPE.USER),
  walletController.getBalance,
);
router.get(
  "/transactions",
  auth(USER_TYPE.USER),
  validate(walletTransactionsValidator),
  walletController.getTransactions,
);
router.get(
  "/earnings",
  auth(USER_TYPE.USER),
  walletController.getEarnings
);

export default router;
