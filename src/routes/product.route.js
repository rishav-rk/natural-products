import {Router} from "express"
import auth from "../middlewares/auth.js"
import { USER_TYPE } from "../config/appConstants.js"
import { validate } from "../middlewares/validate.js"
import * as productValidator from "../validators/admin/product.validator.js"
import * as productController from "../controllers/product.controller.js"

const router = Router()

router.get(
    "/get-products", 
    auth(USER_TYPE.NONE, { userOnly: false}),
    validate(productValidator.getProducts), 
    productController.getProducts
)

router.get(
    "/get-product/:productId", 
    auth(USER_TYPE.NONE, { userOnly: false}), 
    validate(productValidator.getProductById), 
    productController.getProductById
)

export default router