import { Router } from "express";
import * as cartController from "../../controllers/user/profile.controller.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { USER_TYPE } from "../../config/appConstants.js";
import {
  addToCart,
  updateCart,
  deleteFromCart,
} from "../../validators/user/profile.validator.js";

const router = Router();

router.post(
  "/add",
  auth(USER_TYPE.USER),
  validate(addToCart),
  cartController.addToCart,
);
router.get("/", auth(USER_TYPE.USER), cartController.getCart);

router.put(
  "/",
  auth(USER_TYPE.USER),
  validate(updateCart),
  cartController.updateCart,
);
router.delete("/clear", auth(USER_TYPE.USER), cartController.clearCart);
router.delete(
  "/remove-product/:productId",
  auth(USER_TYPE.USER),
  validate(deleteFromCart),
  cartController.deleteFromCart,
);

export default router;
