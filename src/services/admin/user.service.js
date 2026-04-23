import {
  ERROR_MESSAGES,
  STATUS_CODES,
  TOKEN_TYPE,
  USER_TYPE,
} from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { Admin, User } from "../../models/index.js";
import { paginationOptions } from "../../utils/universalFunctions.js";

export const getUsers = async (query) => {

  const filter = (query.search) ? {
    $or: [
      { name: { $regex: query.search, $options: "i" } },
      { phoneNumber: { $regex: query.search, $options: "i" } },
    ],
  } : {};

  const users = await User.find(
    filter,
    {},
    paginationOptions(query.page, query.limit),
  );
  return users;
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId).lean();
  delete user.password;
  delete user.__v;
  return user;
};

export const enableDisableUser = async (userId) => {
  const user = await User.findOneAndUpdate(
    { _id: userId },
    [{ $set: { isActive: { $not: "$isActive" } } }],
    { new: true },
  ).lean();
  
  if (!user) {
    throw new OperationalError(
      STATUS_CODES.NOT_FOUND,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
  }
  delete user.password;
  delete user.__v;
  return user;
};