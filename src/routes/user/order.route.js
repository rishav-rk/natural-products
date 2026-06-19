import { Router, raw } from "express";
import { USER_TYPE } from "../../config/appConstants.js";
import {
  createOrderValidator,
  verifyPaymentValidator,
  getMyOrderValidator,
  getMyOrderByIdValidator,
} from "../../validators/user/order.validator.js";
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getMyOrderById,
  handleRazorpayWebhook,
  handleDelhiveryWebhook,
} from "../../controllers/user/order.controller.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { User } from "../../models/index.js";
import mongoose from "mongoose";

const router = Router();

router.post(
  "/create-order",
  auth(USER_TYPE.USER),
  validate(createOrderValidator),
  createOrder,
);

// router.post(
//   "/verify-payment",
//   auth(USER_TYPE.USER),
//   validate(verifyPaymentValidator),
//   verifyPayment,
// );

router.get(
  "/my-orders",
  auth(USER_TYPE.USER),
  validate(getMyOrderValidator),
  getMyOrders,
);

router.get(
  "/my-orders/:orderId",
  auth(USER_TYPE.USER),
  validate(getMyOrderByIdValidator),
  getMyOrderById,
);

router.post("/webhooks/delhivery", handleDelhiveryWebhook);

export default router;
