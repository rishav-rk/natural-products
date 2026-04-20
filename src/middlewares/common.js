import { v4 as uuidv4 } from "uuid";
import rateLimit from "express-rate-limit";

import { NotFoundError } from "../utils/error.js";
import { errorResponse } from "../utils/response.js";
import { ERROR_MESSAGES, STATUS_CODES } from "../config/appConstants.js";

const errorHandler = (error, req, res, next) => {
 
  return errorResponse(error, req, res);
};

const routeNotFoundHandler = (req, res, next) => {
  return errorResponse(
    new NotFoundError(STATUS_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND),
    req,
    res
  );
};

const requestHandler = (req, res, next) => {
  //@ts-ignore
  req["reqId"] = uuidv4();
  //  Setting Language incase a header come
  res.setLocale(req.get("languageCode") || "en");
  next();
};

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
});

export { errorHandler, routeNotFoundHandler, requestHandler, authLimiter };
