import {
  ERROR_MESSAGES,
  STATUS_CODES,
  USER_TYPE,
} from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { User } from "../../models/index.js";
import { successResponse } from "../../utils/response.js";

export const updateProfile = async (profileData, token) => {
  const user = await User.findById(token.user._id);

  if (!user) {
    throw new OperationalError(
      STATUS_CODES.NOT_FOUND,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
  }

  Object.assign(user, profileData);
  await user.save();

  return user.toObject();
};