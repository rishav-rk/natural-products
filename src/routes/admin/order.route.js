import { Router } from "express";
import * as orderController from "../../controllers/admin/order.controller.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { USER_TYPE } from "../../config/appConstants.js";
import * as orderValidator from "../../validators/admin/order.validator.js";

const router = Router();

router.get(
  "/",
  auth(USER_TYPE.ADMIN),
  validate(orderValidator.getOrders),
  orderController.getOrders,
);

router.get(
  "/:orderId",
  auth(USER_TYPE.ADMIN),
  validate(orderValidator.getOrderById),
  orderController.getOrderById,
);

export default router;
