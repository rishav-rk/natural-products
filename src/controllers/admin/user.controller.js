import * as userService from "../../services/admin/user.service.js";
import { successResponse } from "../../utils/response.js";
import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { formatUser } from "../../utils/formatResponse.js";
import { catchAsync } from "../../utils/universalFunctions.js";

export const getUsers = catchAsync(async (req, res) => {
  const { users, totalUsers } = await userService.getUsers(req.query);
  const formattedUsers = users.map((user) => {
    delete user.password;
    delete user.__v;
  });
  successResponse(req, res, STATUS_CODES.SUCCESS, SUCCESS_MESSAGES.SUCCESS, {
    users,
    totalUsers,
  });
});

export const getUserById = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const user = await userService.getUserById(userId);
  if (!user) {
    return res
      .status(STATUS_CODES.NOT_FOUND)
      .json({ message: "User not found" });
  }
  successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    user,
  );
});

export const enableDisableUser = catchAsync(async (req, res) => {
  const updatedUser = await userService.enableDisableUser(req.body.userId);

  successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS,
    updatedUser,
  );
});

export const createReferralCode = catchAsync(async (req, res) => {
  const code = await userService.createReferralCode(
    req.body.userId,
    req.token.admin._id,
  );
  return successResponse(
    req,
    res,
    STATUS_CODES.SUCCESS,
    SUCCESS_MESSAGES.SUCCESS, 
    code,
  );
})
