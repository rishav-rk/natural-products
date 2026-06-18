import * as productService from "../../services/admin/product.service.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { formatProducts, formatUser } from "../../utils/formatResponse.js";
import { catchAsync } from "../../utils/universalFunctions.js";

export const addProduct = catchAsync(async (req, res) => {
  const product = await productService.addProduct(req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.SUCCESS,
    { product },
  );
});

export const updateProduct = catchAsync(async (req, res) => {
  const updatedProduct = await productService.updateProduct(req.body, req.params.productId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { updatedProduct: formatProducts(updatedProduct) },
  );
});

export const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.params.productId);
  return successResponse(
    req,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});
