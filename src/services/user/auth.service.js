import {
  ERROR_MESSAGES,
  STATUS_CODES,
  TOKEN_TYPE,
  USER_TYPE,
} from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { User } from "../../models/index.js";
import {
  deletePreviousToken,
  generateAuthToken,
  generateForgotPasswordToken,
  updateToken,
  resendOTP,
} from "../token.service.js";
import { successResponse } from "../../utils/response.js";
import bcrypt from "bcrypt";

export const signUp = async (userData) => {
  if (
    await User.findOne({
      phoneNumber: userData.phoneNumber,
      isDeleted: false,
      isVerified: true,
    })
  ) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ACCOUNT_ALREADY_EXIST,
    );
  }

  const otp = {
    code: Math.floor(1000 + Math.random() * 9000),
    expiresAt: new Date().setSeconds(new Date().getSeconds() + 300),
  };

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const userDataToSave = {
    name: userData.name,
    phoneNumber: userData.phoneNumber,
    password: hashedPassword,
  };

  const user = await User.findOneAndUpdate(
    { phoneNumber: userData.phoneNumber, isDeleted: false, isVerified: false },
    {
      $set: userDataToSave,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  const authToken = await generateAuthToken(
    user._id,
    USER_TYPE.USER,
    userData.deviceToken,
    userData.deviceType,
    userData.deviceId,
    otp,
  );
  return { user: user.toObject(), token: authToken };
};

export const login = async (loginData) => {
  const user = await User.findOne({
    phoneNumber: loginData.phoneNumber,
    isDeleted: false,
    isVerified: true,
  }).select("+password");

  if (!user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ACCOUNT_NOT_EXIST,
    );
  }

  if(!user.isActive) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED, 
      ERROR_MESSAGES.ACCOUNT_BLOCKED
    )
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
  const user = await User.findOne({
    phoneNumber: data.phoneNumber,
    isVerified: true,
    isActive: true,
  }).lean();

  if (!user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ACCOUNT_NOT_EXIST,
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
    Promise.all([
      await User.findByIdAndUpdate(token.user._id, {
        $set: { isVerified: true },
      }),
      await updateToken(token._id),
    ]);
    return;
  }

  if (token.isVerified) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.OTP_ALREADY_VERIFIED,
    );
  }

  if (token.otp.code != data.otp || token.otp.expiresAt < new Date()) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INVALID_OTP,
    );
  }

  Promise.all([
    await User.findByIdAndUpdate(token.user._id, { $set: { isVerified: true } }),
    await updateToken(token._id),
  ]);
};

export const resetPassword = async (data, token) => {
  console.log(token.type !== TOKEN_TYPE.FORGOTPASSWORD);
  if (token.type !== TOKEN_TYPE.FORGOTPASSWORD) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INVALID_TOKEN,
    );
  }

  if (!token.isVerified) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.CANNOT_CHANGE_PASSWORD_BEFORE_VERIFICATION,
    );
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await Promise.all([
    await User.findByIdAndUpdate(token.user._id, {
      $set: { password: hashedPassword },
    }),
    await deletePreviousToken(token._id),
  ]);
};

export const resendOtp = async (token) => {
  const otp = {
    code: Math.floor(1000 + Math.random() * 9000),
    expiresAt: new Date().setSeconds(new Date().getSeconds() + 300),
  };

  // otp sent via sms

  await resendOTP(token._id, otp);
};

export const logout = async (token) => {
  await deletePreviousToken(token._id);
};
