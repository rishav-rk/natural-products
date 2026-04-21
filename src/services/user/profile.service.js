import {
  ERROR_MESSAGES,
  STATUS_CODES,
  USER_TYPE,
} from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { User } from "../../models/index.js";
import { deletePreviousToken } from "../token.service.js";
import { successResponse } from "../../utils/response.js";
import bcrypt from "bcrypt";

export const updateProfile = async (profileData, token) => {
  const user = await User.findByIdAndUpdate(token.user._id, profileData, {
    new: true,
  }).lean();
  return user;
};

export const changePassword = async (passwordData, token) => {
  if (!token.user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
  }

  const isMatch = await bcrypt.compare(
    passwordData.currentPassword,
    token.user.password,
  );
  if (!isMatch) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WRONG_PASSWORD,
    );
  }

  const passwordHash = await bcrypt.hash(passwordData.newPassword, 10);

  await User.findByIdAndUpdate(token.user._id, { password: passwordHash });
};

export const deleteAccount = async (token) => {
  if (!token.user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
  }
  await Promise.all([
    await User.findByIdAndUpdate(token.user._id, { $set: { isDeleted: true } }),
    await deletePreviousToken(token._id),
  ]);
};
