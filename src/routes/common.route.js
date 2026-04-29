import {Router} from "express"
import auth from "../middlewares/auth.js"
import { USER_TYPE } from "../config/appConstants.js"
import { validate } from "../middlewares/validate.js"
import * as productValidator from "../validators/admin/product.validator.js"
import * as productController from "../controllers/product.controller.js"

const router = Router()

router.get(
    "/products/get-products", 
    auth([USER_TYPE.ADMIN, USER_TYPE.USER]),
    validate(productValidator.getProducts), 
    productController.getProducts
)

router.get(
    "/products/get-product/:productId", 
    auth([USER_TYPE.ADMIN, USER_TYPE.USER]), 
    validate(productValidator.getProductById), 
    productController.getProductById
)

import { getConstants } from "../validators/admin/aCAndVideo.validator.js"
import { getConstants as getConstantsController } from "../controllers/admin/aCAndVideo.controller.js"

router.get('/constants', auth([USER_TYPE.USER,USER_TYPE.ADMIN]), validate(getConstants), getConstantsController)


export default router