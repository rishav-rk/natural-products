import { Router } from "express";
import auth from "../middlewares/auth.js";
import { USER_TYPE } from "../config/appConstants.js";
import { validate } from "../middlewares/validate.js";
import * as productValidator from "../validators/admin/product.validator.js";
import * as productController from "../controllers/product.controller.js";
import { getConstants } from "../validators/admin/aCAndVideo.validator.js";
import { getConstants as getConstantsController } from "../controllers/admin/aCAndVideo.controller.js";
import { Token } from "../models/index.js";
import { token } from "morgan";
import { getNotificationToken } from "../services/token.service.js";


const router = Router();

router.get(
  "/products/get-products",
  auth([USER_TYPE.ADMIN, USER_TYPE.USER]),
  validate(productValidator.getProducts),
  productController.getProducts,
);

router.get(
  "/products/get-product/:productId",
  auth([USER_TYPE.ADMIN, USER_TYPE.USER]),
  validate(productValidator.getProductById),
  productController.getProductById,
);
router.get(
  "/constants",
  auth([USER_TYPE.USER, USER_TYPE.ADMIN]),
  validate(getConstants),
  getConstantsController,
);

router.get("/get-tokens", async function getTokens(req, res) {
  await getNotificationToken('6a30e800018d661d1096774a');
  return res.status(200).send('Sent succeffully')
}
);

export default router;
