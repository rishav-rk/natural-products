import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import * as orderService from "../../services/admin/order.service.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunctions.js";

export const getOrders = catchAsync(async (req, res) => {
  const { orders, totalOrders, orderCount, completedOrders } = await orderService.getOrders(req.query);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { orders, orderCount, totalOrders, completedOrders },
  );
});

export const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.orderId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { order },
  );
});
