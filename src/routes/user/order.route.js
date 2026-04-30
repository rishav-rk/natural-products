import { Router } from "express";
import { USER_TYPE } from "../../config/appConstants.js";
import { createOrderValidator } from "../../validators/user/order.validator.js";
import { createOrder } from "../../controllers/user/order.controller.js";
import auth from "../../middlewares/auth.js"
import { validate } from "../../middlewares/validate.js";

const router = Router();


router.post(
  "/create-order",
  auth(USER_TYPE.USER),
  validate(createOrderValidator),
  createOrder,
);
export default router