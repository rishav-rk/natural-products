import { successResponse } from "../../utils/response.js";
import * as orderService from "../../services/user/order.service.js";
import { catchAsync } from "../../utils/universalFunctions.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";

export const createOrder = catchAsync(async (req, res) => {
  const { razorpayOrder } = await orderService.createOrder(req.body, req.token);
  return successResponse(
    req,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.ORDER_CREATED,
    { razorpayOrder },
  );
});

export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getMyOrders(req.token, req.query);

  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { orders },
  );
});

export const getMyOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getMyOrderById(req.params.orderId);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { order },
  );
});

export const verifyPayment = catchAsync(async (req, res) => {
  await orderService.verifyPayment(req.body, req.token);
  return successResponse(
    req,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});

export const handleRazorpayWebhook = catchAsync(async (req, res) => {
  await orderService.handleRazorpayWebhook(req);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
  );
});

export const handleRazorpayXWebhook = catchAsync(async (req, res) => {
  await orderService.handleRazorpayXWebhook(req);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
  );
});

export const handleDelhiveryWebhook = catchAsync(async (req, res) => {
  const {message} = await orderService.handleDelhiveryWebhook(req, res);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    message
  );
});
