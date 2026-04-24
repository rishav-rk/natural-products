import { Router } from "express";
import * as productController from "../../controllers/admin/product.controller.js";
import auth from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { USER_TYPE } from "../../config/appConstants.js";
import * as productValidator from "../../validators/admin/product.validator.js";

const router = Router();

router.post(
  "/add-product",
  auth(USER_TYPE.ADMIN),
  validate(productValidator.addProduct),
  productController.addProduct,
);

router.put(
    "/update-product/:productId", 
    auth(USER_TYPE.ADMIN), 
    validate(productValidator.updateProduct),
    productController.updateProduct
)

router.delete(
    "/delete-product/:productId", 
    auth(USER_TYPE.ADMIN), 
    validate(productValidator.deleteProduct), 
    productController.deleteProduct
)

export default router;
