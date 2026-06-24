import passport from "passport";
import {
  TOKEN_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
} from "../config/appConstants.js";
import { AuthFailedError } from "../utils/error.js";

const verifyOtpCallback =
  (req, resolve, reject, expectedTokenType) => async (err, token, info) => {
    try {
      // 1. A token is strictly required for these actions
      if (!token || err || info) {
        throw new AuthFailedError(
          ERROR_MESSAGES.AUTHENTICATION_FAILED,
          STATUS_CODES.AUTH_FAILED  ,
        );
      }

      // 2. Validate token type matches what the route expects (e.g., FORGOTPASSWORD)
      if (token.type !== expectedTokenType) {
        throw new AuthFailedError(
          ERROR_MESSAGES.INVALID_TOKEN,
          STATUS_CODES.ACTION_FAILED,
        );
      }

      // 3. Ensure the token contains the necessary payload (like token.otp) if verifying OTP
      if (expectedTokenType === TOKEN_TYPE.FORGOTPASSWORD && !token.otp) {
        throw new AuthFailedError(
          ERROR_MESSAGES.INVALID_TOKEN,
          STATUS_CODES.ACTION_FAILED,
        );
      }

      // Attach valid token to request for controller use
      req.token = token;
      return resolve();
    } catch (error) {
      return reject(error);
    }
  };

/**
 * Middleware strictly for handling specialized actions like OTP verification and password resets.
 * @param {string} expectedTokenType - The required TOKEN_TYPE from constants
 */
const otpAuth = (expectedTokenType) => (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      "jwt",
      { session: false },
      verifyOtpCallback(req, resolve, reject, expectedTokenType),
    )(req, res, next);
  })
    .then(() => next())
    .catch(next);
};

export default otpAuth;
