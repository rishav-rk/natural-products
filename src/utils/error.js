import { ERROR_MESSAGES, STATUS_CODES } from "../configs/appConstants.js";

class ValidationError extends Error {
  constructor(
    data,
    message = ERROR_MESSAGES.VALIDATION_FAILED,
    logError = true,
    statusCode = STATUS_CODES.VALIDATION_FAILED
  ) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
    this.name = this.constructor.name;
    this.message = message;
    this.data = data;
    this.logError = logError;
    this.statusCode = statusCode;
  }
}

class OperationalError extends Error {
  constructor(
    statusCode = STATUS_CODES.ACTION_FAILED,
    message = ERROR_MESSAGES.SERVER_ERROR,
    data,
    logError = true
  ) {
    super(message);

    Object.setPrototypeOf(this, OperationalError.prototype);
    this.name = "";
    this.data = data;
    this.statusCode = statusCode;
    this.logError = logError;
  }
}

class NotFoundError extends Error {
  constructor(
    statusCode = STATUS_CODES.NOT_FOUND,
    message = ERROR_MESSAGES.NOT_FOUND,
    logError = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.logError = logError;
  }
}

class AuthFailedError extends Error {
  constructor(
    message = ERROR_MESSAGES.AUTHENTICATION_FAILED,
    statusCode = STATUS_CODES.AUTH_FAILED
  ) {
    super(message);

    Object.setPrototypeOf(this, AuthFailedError.prototype);

    this.statusCode = statusCode;
    this.name = this.constructor.name;
    this.logError = statusCode === STATUS_CODES.FORBIDDEN;
  }
}

export { ValidationError, OperationalError, NotFoundError, AuthFailedError };
