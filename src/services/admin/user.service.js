import {
  ERROR_MESSAGES,
  STATUS_CODES,
  TOKEN_TYPE,
  USER_TYPE,
} from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { Admin, Token, User, Referral } from "../../models/index.js";
import { paginationOptions } from "../../utils/universalFunctions.js";

export const getUsers = async (query) => {
  const filter = { isVerified: true };
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { phoneNumber: { $regex: query.search, $options: "i" } },
    ];
  }
  const users = await User.find(
    filter,
    {},
    paginationOptions(query.page, query.limit),
  );
  const totalUsers = await User.countDocuments({ isVerified: true });
  return { users, totalUsers };
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
    { returnDocument: "after" },
  ).lean();

  await Token.findOneAndUpdate(
    { user: userId },
    [{ $set: { isDeleted: { $not: "$isDeleted" } } }],
    { returnDocument: "after" },
  );

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

export const createReferralCode = async (userId, adminId) => {
  const referral = await Referral.create({
    user: userId,
    admin: adminId,
    code: "5823947610",
    byAdmin: true,
    parent: null,
    maxUses: 1, // ← admin codes are single-use
  });

  return referral;
};
