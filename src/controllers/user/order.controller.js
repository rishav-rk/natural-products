import { successResponse } from "../../utils/response.js";
import * as orderService from "../../services/user/order.service.js";
import { catchAsync } from "../../utils/universalFunctions.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";

export const createOrder = catchAsync(async (req, res) => {
  const orderDetails = await orderService.createOrder(req.body, req.token);
  return successResponse(
    req,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.ORDER_CREATED,
    { orderDetails },
  );
});

export const getMyOrders = catchAsync(async (req, res) => {});

export const verifyPayment = catchAsync(async (req, res) => {
  const payment = await orderService.verifyPayment(req.body, req.token);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { payment },
  );
});
