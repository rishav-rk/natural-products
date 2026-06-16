// wallet.controller.js
import { catchAsync } from "../../utils/universalFunctions.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import * as walletService from "../../services/user/wallet.service.js";

export const getBalance = catchAsync(async (req, res) => {
  const data = await walletService.getBalance(req.token.user._id);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data,
  );
});

export const getTransactions = catchAsync(async (req, res) => {
console.log(req.query)
  const data = await walletService.getTransactions(
    req.token.user._id,
    req.query,
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data,
  );
});

export const getEarnings = catchAsync(async (req, res) => {
  const data = await walletService.getEarnings(req.token.user._id, req.query);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data,
  );
});

export const getSummary = catchAsync(async (req, res) => {
  const data = await walletService.getSummary(req.token.user._id);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data,
  );
});

export const withdrawFunds = catchAsync(async (req, res) => {
  const data = await walletService.withdrawFunds(
    req.token.user._id,
    req.token.user.phoneNumber,
    req.body,
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data,
  );
});
