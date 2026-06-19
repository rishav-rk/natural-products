import passport from "passport";
import {
  USER_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
  TOKEN_TYPE,
} from "../config/appConstants.js";
import { AuthFailedError, OperationalError } from "../utils/error.js";

const isUnauthorized = () =>
  new AuthFailedError(ERROR_MESSAGES.UNAUTHORIZED, STATUS_CODES.AUTH_FAILED);

const verifyOtpRoute = (req) =>
  ["/verify-otp", "/resend-otp"].includes(req.url);

const validateUserStatus = (user) => {
  if (user.isDeleted) {
    throw new OperationalError(
      STATUS_CODES.AUTH_FAILED,
      ERROR_MESSAGES.ACCOUNT_NOT_EXIST,
    );
  }

  if (!user.isVerified) {
    throw new OperationalError(
      STATUS_CODES.AUTH_FAILED,
      ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
    );
  }

  if (!user.isActive) {
    throw new OperationalError(
      STATUS_CODES.AUTH_FAILED,
      ERROR_MESSAGES.ACCOUNT_BLOCKED,
    );
  }
};

const verifyCallback =
  (req, resolve, reject, role, options) => async (err, token, info) => {
    try {
      // Allow unauthenticated access for public routes
      if (!token) {
        if (role.includes(USER_TYPE.NONE)) {
          req.token = { role : USER_TYPE.NONE}
          return resolve();
        }
        throw new AuthFailedError(
          ERROR_MESSAGES.FORBIDDEN,
          STATUS_CODES.FORBIDDEN,
        );
      }

      if (err || info) throw new AuthFailedError();

      if (
        token.type === TOKEN_TYPE.FORGOTPASSWORD &&
        !verifyOtpRoute(req) &&
        !["/forgot-password", "/reset-password"].includes(req.url)
      ) {
        throw new AuthFailedError(
          ERROR_MESSAGES.INVALID_TOKEN,
          STATUS_CODES.ACTION_FAILED,
        );
      }
      // Restrict admin if userOnly is true
      if (role.includes(USER_TYPE.NONE)) {
        req.token = token;
        return resolve();
      } else {
        if (!role.includes(token.role)) {
          throw isUnauthorized();
        }
      }

      // Admin validation
      if (token.role === USER_TYPE.ADMIN) {
        if (!token.admin) throw new AuthFailedError();
        req.token = token;
        return resolve();
      }

      // OTP route validation
      if (verifyOtpRoute(req)) {
        if (!token.otp) {
          throw new AuthFailedError(
            ERROR_MESSAGES.INVALID_TOKEN,
            STATUS_CODES.ACTION_FAILED,
          );
        }
        req.token = token;
        return resolve();
      }

      const user = token.user;
      if (!user) throw new AuthFailedError();

      validateUserStatus(user);

      req.token = token;
      return resolve();
    } catch (error) {
      return reject(error);
    }
  };

const auth =
  (role, options = { userOnly: true }) =>
  (req, res, next) =>
    new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, role, options),
      )(req, res, next);
    })
      .then(() => next())
      .catch(next);

export default auth;
