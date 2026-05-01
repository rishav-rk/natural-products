import { Router } from "express";
import { USER_TYPE } from "../../config/appConstants.js";
import {
  createOrderValidator,
  verifyPaymentValidator,
  getMyOrderValidator,
} from "../../validators/user/order.validator.js";
import {
  createOrder,
  verifyPayment,
  getMyOrders,
} from "../../controllers/user/order.controller.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { User } from "../../models/index.js";
import mongoose from "mongoose";
// import { token } from "morgan";

const router = Router();

router.post(
  "/create-order",
  auth(USER_TYPE.USER),
  validate(createOrderValidator),
  createOrder,
);

router.get("/test", async (req, res) => {
  const id = "69f1e37b6df72aa60ebeca27";
  const user = await User.findById(id, { cart: 1 }, { lean: true });
  const itemTotal = user.cart.products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );

  const amount = (
    itemTotal +
    (parseFloat(user.cart.tax) / 100) * itemTotal
  ).toFixed(2);
  // console.log(amount)
  return res.render("payment-test", {
    amount: amount,
  });
});

router.post(
  "/verify-payment",
  auth(USER_TYPE.USER),
  validate(verifyPaymentValidator),
  verifyPayment,
);

router.get(
  "/my-orders",
  auth(USER_TYPE.USER),
  validate(getMyOrderValidator),
  getMyOrders,
);

export default router;
