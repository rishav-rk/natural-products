import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { formatUser } from "../../utils/formatResponse.js";
import { catchAsync } from "../../utils/universalFunctions.js";
import * as profileService from "../../services/user/profile.service.js";

export const getProfile = catchAsync(async (req, res) => {
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    formatUser(req.token.user), 
  );
})

export const updateProfile = catchAsync(async (req, res) => {
  const user = await profileService.updateProfile(req.body, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    formatUser(user),
  );
})

export const changePassword = catchAsync(async (req, res) => {
  await profileService.changePassword(req.body, req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
})

export const deleteAccount = catchAsync(async (req, res) => {
  await profileService.deleteAccount(req.token);
  return successResponse(
    res,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
})