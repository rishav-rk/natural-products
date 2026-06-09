import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { successResponse } from "../../utils/response.js";
import * as referralService from "../../services/referral.service.js";
import { catchAsync } from "../../utils/universalFunctions.js";

export const checkCodeAvailability = catchAsync(async (req, res) => {
  await referralService.checkCodeAvailability(req.body, req.token.user._id);
  return successResponse(
    req,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
});

export const getReferralCodes = catchAsync(async (req, res) => {
  const { data, totalCount } = await referralService.getReferralCodes(
    req.token.user._id,
    req.query.page,
    req.query.limit,
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    { data, totalCount },
  );
});

export const getReferralById = catchAsync(async (req, res) => {
  const data = await referralService.getReferralById(
    req.params.codeId,
    req.token.user._id,
    req.query.level,
    req.query.page,
    req.query.limit,
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data,
  );
});

export const getReferralTree = catchAsync(async (req, res) => {
  const data = await referralService.getReferralTree(
    req.params.codeId,
    req.token,
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data,
  );
});

export const getNextLevel = catchAsync(async (req, res) => {
  const data = await referralService.getNextLevel(
    req.params.codeId,
    req.token.user._id,
    req.query.level,
    req.query.parent,
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data,
  );
});