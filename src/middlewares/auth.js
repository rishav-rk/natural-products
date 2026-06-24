import passport from "passport";
import {
  USER_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
} from "../config/appConstants.js";
import { AuthFailedError, OperationalError } from "../utils/error.js";

const validateUserStatus = (user) => {
  if (user.isDeleted)
    throw new OperationalError(
      STATUS_CODES.AUTH_FAILED,
      ERROR_MESSAGES.ACCOUNT_NOT_EXIST,
    );
  if (!user.isVerified)
    throw new OperationalError(
      STATUS_CODES.AUTH_FAILED,
      ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED,
    );
  if (!user.isActive)
    throw new OperationalError(
      STATUS_CODES.AUTH_FAILED,
      ERROR_MESSAGES.ACCOUNT_BLOCKED,
    );
};

const verifyCallback =
  (req, resolve, reject, allowedRoles) => async (err, token, info) => {
    try {
      const isPublicRoute = allowedRoles.includes(USER_TYPE.NONE);

      // 1. If no token is provided
      if (!token) {
        if (isPublicRoute) {
          req.token = { role: USER_TYPE.NONE };
          return resolve();
        }
        throw new AuthFailedError(
          ERROR_MESSAGES.FORBIDDEN,
          STATUS_CODES.FORBIDDEN, 
        );
      }

      // 2. If a token IS provided, it MUST be valid (even on public routes)
      if (err || info) {
        throw new AuthFailedError(
          ERROR_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.AUTH_FAILED,
        );
      }

      // 3. User status validation (Run this for ANY authenticated user, even on public routes)
      if (token.user) {
        validateUserStatus(token.user);
      }

      // 4. Admin Specific Check
      if (token.role === USER_TYPE.ADMIN && !token.admin) {
        throw new AuthFailedError(
          ERROR_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.AUTH_FAILED,
        );
      }

      // 5. Role Authorization Check
      if (!isPublicRoute && !allowedRoles.includes(token.role)) {
        throw new AuthFailedError(
          ERROR_MESSAGES.UNAUTHORIZED,
          STATUS_CODES.AUTH_FAILED,
        );
      }

      // Attach valid token to request
      req.token = token;
      return resolve();
    } catch (error) {
      return reject(error);
    }
  };

const auth = (allowedRoles) => (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false },
      verifyCallback(req, resolve, reject, allowedRoles),
    )(req, res, next);
  })
    .then(() => next())
    .catch(next);
};

export default auth;
