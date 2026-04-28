import * as constantsService from "../../services/admin/additionalCharges.service.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { catchAsync } from "../../utils/universalFunctions.js";

export const getConstants = catchAsync(async (req, res) => {
  const constants = await constantsService.getConstants();
  return successResponse(
    req, 
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    constants
  );
});

export const updateConstants = catchAsync(async (req, res) => {
  const constants = await constantsService.updateConstants(req.body);
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    constants
  );
});