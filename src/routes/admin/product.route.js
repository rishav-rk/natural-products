import {Router} from "express"
import * as productController from "../../controllers/admin/product.controller.js";

const router = Router()

router.post("/add-product", productController.addProduct)

export default router;