import {
  ERROR_MESSAGES,
  STATUS_CODES,
  USER_TYPE,
} from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { User } from "../../models/index.js";
import {
  deletePreviousToken,
  generateAuthToken,
  generateForgotPasswordToken,
  updateToken,
} from "../token.service.js";
import { successResponse } from "../../utils/response.js";
import { token } from "morgan";

export const signUp = async (userData) => {
  if (await User.findOne({ phoneNumber: userData.phoneNumber })) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ACCOUNT_ALREADY_EXIST,
    );
  }

  const user = await User.create(userData);
  return user.toObject();
};

export const login = async (loginData) => {
  const user = await User.findOne({
    phoneNumber: loginData.phoneNumber,
  }).select("+password");

  if (!user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
  }

  if (!(await user.comparePassword(loginData.password))) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WRONG_PASSWORD,
    );
  }

  const userType = USER_TYPE.USER;
  const authToken = await generateAuthToken(
    user._id,
    userType,
    loginData.deviceToken,
    loginData.deviceType,
    loginData.deviceId,
  );

  return {
    user: user.toObject(),
    token: authToken,
  };
};

export const forgotPassword = async (data) => {
  const user = await User.findOne({ phoneNumber: data.phoneNumber }).lean();

  if (!user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
  }

  const otp = {
    code: Math.floor(1000 + Math.random() * 9000),
    expiresAt: new Date().setSeconds(new Date().getSeconds() + 300),
  };

  // otp sent via sms

  const resetToken = await generateForgotPasswordToken(
    user._id,
    USER_TYPE.USER,
    data.deviceToken,
    data.deviceType,
    data.deviceId,
    otp,
  );

  return resetToken;
};

export const verifyOtp = async (data, token) => {
  if (data.otp === "2222") {
    console.log("Bypassing OTP verification for testing purposes");
    await updateToken(token._id);
    return;
  }
  if (token.isVerified) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.OTP_ALREADY_VERIFIED,
    );
  }

  if (token.otp.code !== data.otp || token.otp.expiresAt < new Date()) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INVALID_OTP,
    );
  }

  await updateToken(token._id);
};

export const resetPassword = async (data, token) => {
  const user = await User.findById(token.user._id);
console.log("User found for password reset:", data, token);

  if (!token.isVerified) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.CANNOT_CHANGE_PASSWORD_BEFORE_VERIFICATION,
    );
  }

  await deletePreviousToken(token._id);

  user.password = data.password;
  await user.save();
};
