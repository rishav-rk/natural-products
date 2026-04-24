import * as productService from "../services/product.service.js";
import { successResponse } from "../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../config/appConstants.js";
import { formatProducts, formatUser } from "../utils/formatResponse.js";
import { catchAsync } from "../utils/universalFunctions.js";

export const getProducts = catchAsync(async (req, res) => {
  const products = await productService.getProducts(req.query);
  const fomattedProducts = products.map((product) => formatProducts(product));
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { products: fomattedProducts , totalCount : products.length},
  );
});

export const getProductById = catchAsync(async (req, res) =>{
    const product = await productService.getProductById(req.params.productId)
    return successResponse(
      req, 
      res, 
      STATUS_CODES.SUCCESS, 
      SUCCESS_MESSAGES.SUCCESS, 
      {product : formatProducts(product)}
    )
})