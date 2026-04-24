import * as productService from "../../services/admin/product.service.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { formatUser } from "../../utils/formatResponse.js";
import { catchAsync } from "../../utils/universalFunctions.js";

export const createProduct = catchAsync(async (req, res)=>{
    const productData = req.body;
    
})

