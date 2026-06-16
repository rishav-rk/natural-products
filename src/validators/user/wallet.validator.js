// wallet.validator.js
import { JOI, REFERRAL_CONSTANTS } from "../../config/appConstants.js";
import Joi from "joi";

export const walletTransactionsValidator = {
  query: Joi.object({
    page: JOI.PAGE.required(),
    limit: JOI.LIMIT.required(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref("startDate")) // endDate must be >= startDate
      .optional(),
  }),
};

export const withdrawValidator = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    accountNumber: Joi.string()
      .pattern(/^\d{9,18}$/)
      .required()
      .messages({ "string.pattern.base": "Enter a valid account number" }),
    ifsc: Joi.string()
      .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .required()
      .messages({ "string.pattern.base": "Enter a valid IFSC code" }),
  }).required(),
};
