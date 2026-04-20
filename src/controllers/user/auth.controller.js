import * as authService from "../../services/user/auth.service.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { formatUser } from "../../utils/formatResponse.js";
import { catchAsync } from "../../utils/universalFunctions.js";

export const signUp = catchAsync(async (req, res) => {
  const user = await authService.signUp(req.body);
  return successResponse(
    res,
    res,
    STATUS_CODES.CREATED,
    SUCCESS_MESSAGES.USER_CREATED,
    formatUser(user),
  );
})

export const login = catchAsync(async (req, res) => {
  const user = await authService.login(req.body);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    {token: user.token, user: user.user}, 
  );
})

export const forgotPassword = catchAsync(async (req, res) => {
  const resetToken = await authService.forgotPassword(req.body);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    'OTP sent successfully',
    { token: resetToken }
  );
})

export const verifyOtp = catchAsync(async (req, res) => {
  await authService.verifyOtp(req.body, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    'OTP verified successfully',
  );
})

export const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS,
  );
})

export const logout = catchAsync(async (req, res) => {
  // await authService.logout(req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.LOGOUT,
  );
})