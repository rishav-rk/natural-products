import passport from "passport";
import {
  USER_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
} from "../config/appConstants.js";
import { AuthFailedError, OperationalError } from "../utils/error.js";

const isUnauthorized = () =>
  new AuthFailedError(ERROR_MESSAGES.UNAUTHORIZED, STATUS_CODES.AUTH_FAILED);

const verifyOtpRoute = (req) =>
  [`/verify-otp`, `/resend-otp`].includes(req.url);

const validateUserStatus = (user) => {
  if (user.isDeleted) {
    throw new OperationalError(
      STATUS_CODES.AUTH_FAILED,
      ERROR_MESSAGES.ACCOUNT_NOT_EXIST
    );
  }

  if (!user.isActive) {
    throw new OperationalError(
      STATUS_CODES.AUTH_FAILED,
      ERROR_MESSAGES.ACCOUNT_BLOCKED
    );
  }
};

const verifyCallback =
  (req, resolve, reject, role, options) => async (err, token, info) => {
    try {
      // Allow unauthenticated access for public routes
      if (!token) {
        if (role === USER_TYPE.NONE) return resolve();
        throw new AuthFailedError();
      }

      if (err || info) throw new AuthFailedError();

      // Restrict admin if userOnly is true
      if (
        role === USER_TYPE.NONE &&
        options.userOnly &&
        token.role === USER_TYPE.ADMIN
      ) {
        throw isUnauthorized();
      }

      // Role validation
      if (role !== USER_TYPE.NONE && !role.includes(token.role)) {
        throw isUnauthorized();
      }

      // Admin validation
      if (token.role === USER_TYPE.ADMIN) {
        if (!token.admin) throw new AuthFailedError();
        req.token = token;
        return resolve();
      }

      const user = token.user;
      if (!user) throw new AuthFailedError();

      validateUserStatus(user);

      // OTP route validation
      if (verifyOtpRoute(req) && !token.otp) {
        throw new AuthFailedError(
          ERROR_MESSAGES.INVALID_TOKEN,
          STATUS_CODES.ACTION_FAILED
        );
      }

      req.token = token;
      resolve();
    } catch (error) {
      reject(error);
    }
  };

const auth =
  (role, options = { userOnly: true }) =>
  (req, res, next) =>
    new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, role, options)
      )(req, res, next);
    })
      .then(() => next())
      .catch(next);

export default auth;