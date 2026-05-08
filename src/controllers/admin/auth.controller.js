import * as authService from "../../services/admin/auth.service.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { formatUser } from "../../utils/formatResponse.js";
import { catchAsync } from "../../utils/universalFunctions.js";

export const login = catchAsync(async (req, res) => {
  const { admin, token } = await authService.login(req.body);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { user: formatUser(admin), token },
  );
});

export const getProfile = catchAsync(async (req, res) => {
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { user: formatUser(req.token.admin) },
  );
});

export const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.body, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.LOGOUT_SUCCESS,
  );
});

export const updateProfile = catchAsync(async (req, res) => {
  const admin = await authService.updateProfile(req.body, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { user: formatUser(admin) },
  );
});

export const getDashboard = catchAsync(async (req, res) => {
  const dashboardData = await authService.getDashboardData();
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { ...dashboardData },
  );
});

export const getTransactions = catchAsync(async (req, res) => {
  const transationsData = await authService.getTransactionsData(req.query);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { ...transationsData },
  );
});
