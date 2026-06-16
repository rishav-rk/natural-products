import jwt from "jsonwebtoken";
import moment from "moment";
import mongoose from "mongoose";
import config from "../config/config.js";
import {
  TOKEN_TYPE,
  USER_TYPE,
  STATUS_CODES,
  ERROR_MESSAGES,
} from "../config/appConstants.js";
import { Token } from "../models/index.js";

export const generateToken = (data, secret = config.jwt.secret) => {
  const payload = {
    exp: data.tokenExpires.unix(),
    type: data.tokenType,
    id: data.tokenId,
    role: data.userType,
  };

  return jwt.sign(payload, secret);
};

export const saveToken = async (data) => {
  let dataToBeSaved = {
    expires: data.tokenExpires.toDate(),
    type: data.tokenType,
    _id: data.tokenId,
    device: {
      type: data.deviceType,
      token: data.deviceToken,
      id: data.deviceId,
    },
    role: data.userType,
    token: data.token,
  };

  if (data.otp) {
    dataToBeSaved.otp = data.otp;
  }
  if (data.userType === USER_TYPE.ADMIN) {
    dataToBeSaved.admin = data.user;
  } else if (data.userType === USER_TYPE.USER) {
    dataToBeSaved.user = data.user;
  }

  // await deletePreviousToken(dataToBeSaved)

  const tokenDoc = await Token.create(dataToBeSaved);

  return tokenDoc;
};

export const generateAuthToken = async (
  user,
  userType,
  deviceToken,
  deviceType,
  deviceId,
  otp,
) => {
  const tokenExpires = moment().add(config.jwt.accessExpirationDays, "days");

  const tokenId = new mongoose.Types.ObjectId();

  const accessToken = generateToken({
    tokenExpires,
    tokenType: TOKEN_TYPE.ACCESS,
    userType,
    tokenId,
  });

  await saveToken({
    token: accessToken,
    tokenExpires,
    tokenId,
    deviceToken,
    deviceType,
    tokenType: TOKEN_TYPE.ACCESS,
    userType,
    user,
    deviceId,
    otp,
  });

  if (!otp) {
    await updateToken(tokenId);
  }
  return {
    token: accessToken,
    expires: tokenExpires.toDate(),
    tokenId,
  };
};

export const updateToken = async (tokenId) => {
  await Token.updateOne(
    { _id: tokenId },
    {
      $set: { isVerified: true, otp: null },
    },
  );
};

export const generateForgotPasswordToken = async (
  user,
  userType,
  deviceToken,
  deviceType,
  deviceId,
  otp,
) => {
  const tokenExpires = moment().add(config.jwt.accessExpirationDays, "days");

  var tokenId = new mongoose.Types.ObjectId();

  const accessToken = generateToken({
    tokenExpires,
    tokenType: TOKEN_TYPE.FORGOTPASSWORD,
    userType,
    tokenId,
  });

  await saveToken({
    token: accessToken,
    tokenExpires,
    tokenId,
    deviceToken,
    deviceType,
    tokenType: TOKEN_TYPE.FORGOTPASSWORD,
    userType,
    user,
    deviceId,
    otp,
  });

  return {
    token: accessToken,
    expires: tokenExpires.toDate(),
  };
};

export const resendOTP = async (token, otp) => {
  await Token.updateOne({ _id: token._id }, { otp, isVerified: false });
};

export const deletePreviousToken = async (tokenId) => {
  await Token.updateMany(
    { _id: tokenId },
    { $set: { isDeleted: true } },
    { lean: true },
  );
};

export const logOutFromAll = async (userId) => {
  await Token.updateMany(
    {
      user: new mongoose.Types.ObjectId(userId),
    },
    { $set: { isDeleted: true } },
    { lean: true },
  );
};

export const logOutFromAllAdmin = async (adminId) => {
  await Token.updateMany(
    {
      admin: new mongoose.Types.ObjectId(adminId),
    },
    { $set: { isDeleted: true } },
    { lean: true },
  );
};
