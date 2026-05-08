import Joi from "joi";
import { objectId, password } from "../validators/custom.validator.js"; // Adjust path as needed

export const TOKEN_TYPE = {
  ACCESS: "access",
  FORGOTPASSWORD: "forgotPassword",
};

export const ADDRESS_TYPE = {
  HOME: "home",
  WORK: "work",
  OTHER: "other",
};

export const PAYMENT_METHOD = {
  CARD: "card",
  UPI: "upi",
  NETBANKING: "netBanking",
  WALLET: "wallet",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed"
};

export const ORDER_STATUS = {
  INPROGRESS: 'In Progress',
  OTW: 'On the Way', 
  DELIVERED: 'Delivered'
};

export const USER_TYPE = {
  ADMIN: "admin",
  NONE: "none",
  USER: "user",
};

export const DEVICE_TYPE = {
  IOS: "ios",
  ANDROID: "android",
  WEB: "web",
};

export const ENVIRONMENT = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
};

export const JOI = {
  EMAIL: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .example("user@example.com"),
  PASSWORD: Joi.string().custom(password).required().example("AbBcd@123"),
  COUNTRY_CODE: Joi.string()
    .pattern(/^\+\d{1,3}$/)
    .message("Enter a valid country code")
    .example("+91"),
  PHONENUMBER: Joi.string()
    .required()
    .pattern(/^\d+$/)
    .max(15)
    .min(8)
    .message("Please enter a valid phone number")
    .example("927348247"),
  LIMIT: Joi.number().default(10).min(10),
  PAGE: Joi.number().default(0),
  OBJECTID: Joi.string()
    .custom(objectId)
    .required()
    .example("6ekc34c23ca736382bc"),
  DEVICE_TYPE: Joi.string()
    .valid(...Object.values(DEVICE_TYPE))
    .required()
    .example("ios"),
  DEVICE_ID: Joi.string().required().example("unique device id"),
  DEVICE_TOKEN: Joi.string().example("fcm token"),
  ROLE: Joi.string()
    .valid(...Object.values(USER_TYPE))
    .required()
    .example("customer"),
  ADDRESS: Joi.array()
    .items(
      Joi.object().keys({
        identifier: Joi.string().required(),
        name: Joi.string().required(),
        mobileNumber: Joi.string()
          .required()
          .pattern(/^\d+$/)
          .max(15)
          .min(8)
          .message("Please enter a valid phone number"),
        countryCode: Joi.string()
          .required()
          .pattern(/^\+\d{1,3}$/)
          .message("Enter a valid country code"),
        state: Joi.string().required(),
        zipCode: Joi.string().required(),
        country: Joi.string().required(),
        addressDetails: Joi.string().required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      }),
    )
    .example("123 oxford street, South Carolina"),
};

export const SUCCESS_MESSAGES = {
  SUCCESS: "Success",
  LOGOUT: "User successfully logged out",
  REQUEST_SENT: "Request has been sent to the admin",
  USER_CREATED: "User created successfully",
  COMPANY_CREATED: "Account for company created successfully",
  ORDER_CREATED: "Order created successfully, Please proceed to payment",
};

export const ERROR_MESSAGES = {
  OUT_OF_STOCK: "Sorry, this product is temporarily out of stock" , 
  NO_SUCH_ORDER: 'No such order',
  INVALID_SIGNATURE: 'Invalid payment signature',
  ADDRESS_REQUIRED: "Address is required",
  ADDRESS_NOT_FOUND: "Address not found",
  PRODUCT_ALREADY_EXISTS: "Product already exists. Try updating it",
  INVALID_TOKEN: "Invalid token",
  NO_SUCH_PRODUCT: "No such product exists",
  NOT_FOUND: "Not found",
  VALIDATION_FAILED: "Validation Failed, Kindly check your parameters",
  SERVER_ERROR: "Something went wrong, Please try again",
  AUTHENTICATION_FAILED: "Please authenticate",
  UNAUTHORIZED: "You are not authorized to perform this action",
  ACCOUNT_NOT_EXIST: "Account does not exist",
  OLD_PASSWORD_MISMATCH: "Incorrect old password",
  WRONG_PASSWORD: "Password is Incorrect",
  ACCOUNT_DELETED: "Your account has been deleted",
  ACCOUNT_BLOCKED: "Your account has been blocked. Please contact the admin",
  USER_NOT_FOUND: "User not found",
  PHONE_NUMBER_ALREADY_EXIST: "Account already exist with this phone number",
  ACCOUNT_NOT_VERIFIED: "Please verify your account first",
  TOKEN_ALREADY_VERIFIED: "Token already verified",
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "Expired OTP",
  OTP_ALREADY_VERIFIED: "OTP already verified",
  PROFILE_ALREADY_COMPLETED: "Profile already completed",
  ACCOUNT_ALREADY_VERIFIED: "Your account already verified",
  EMAIL_ALREADY_EXIST: "Email already exist",
  EMAIL_ALREADY_VERIFIED: "Email already verified",
  PHONE_NUMBER_ALREADY_VERIFIED: "Phone number already verified",
  ACCOUNT_ALREADY_EXIST: "Account already exist",
  ACCOUNT_NOT_FOUND: "Account not found",
  CAN_NOT_CHANGE_EMAIL: "You can not cahnge email",
  CAN_NOT_CHANGE_PHONE_NUMBER: "You can not change mobile number",
  CANNOT_CHANGE_PASSWORD_BEFORE_VERIFICATION:
    "You cannot change password before verification",
};

export const STATUS_CODES = {
  OLD_PASSWORD_MISMATCH: 422,
  SUCCESS: 200,
  CREATED: 201,
  ACTION_PENDING: 202,
  ACTION_COMPLETE: 204,
  ALREADY_EXISTS: 409,

  VALIDATION_FAILED: 400,
  ACTION_FAILED: 400,
  AUTH_FAILED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,

  ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export const DATE_FORMAT = "YYYY-MM-DD";
