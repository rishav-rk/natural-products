import {
  ERROR_MESSAGES,
  STATUS_CODES,
  TOKEN_TYPE,
  USER_TYPE,
} from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { Admin } from "../../models/index.js";
import {
  deletePreviousToken,
  generateAuthToken,
  generateForgotPasswordToken,
  updateToken,
} from "../token.service.js";
import { successResponse } from "../../utils/response.js";
import bcrypt from "bcrypt";
import { formatUser } from "../../utils/formatResponse.js";

export const login = async (loginData) => {
  const admin = await Admin.findOne({
    email: loginData.email,
  })
    .select("+password")
    .lean();

  if (!admin) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ACCOUNT_NOT_FOUND,
    );
  }

  if (!(await bcrypt.compare(loginData.password, admin.password))) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WRONG_PASSWORD,
    );
  }

  const authToken = await generateAuthToken(
    admin._id,
    USER_TYPE.ADMIN,
    loginData.deviceToken,
    loginData.deviceType,
    loginData.deviceId,
  );

  return { admin:formatUser(admin), token: authToken };
};

export const updateProfile = async (updateData, token) => {
  const admin = await Admin.findByIdAndUpdate(
    token.admin._id,
    { $set: updateData },
    { new: true },
  ).lean();

  return admin;
}

export const changePassword = async (passwordData, token) => {

  if (!(await bcrypt.compare(passwordData.oldPassword, token.admin.password))) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WRONG_PASSWORD,
    );
  }

  const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);
  await Admin.findByIdAndUpdate(token.admin._id, {$set: { password: hashedPassword }});
}

export const logout = async (token) => {
  await deletePreviousToken(token._id);
}