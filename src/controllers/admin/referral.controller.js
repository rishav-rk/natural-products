import { SUCCESS_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { successResponse } from "../../utils/response.js";
import { catchAsync } from "../../utils/universalFunctions.js";
import * as referralService from "../../services/admin/referral.service.js";

export const getUserReferrals = catchAsync(async (req, res) => {
  const data = await referralService.getUserReferrals(
    req.params.userId,
    req.query.page,
    req.query.limit,
  );

  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    data
  );
});

export const getReferralById = catchAsync(async (req, res) => {
  const referralStats = await referralService.getReferralById(
    req.params.userId,
    req.params.codeId,
    req.query.page,
    req.query.limit,
  );

  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    referralStats,
  );
});
