// wallet.validator.js
import { JOI, REFERRAL_CONSTANTS } from "../../config/appConstants.js";
import Joi from "joi";

export const walletTransactionsValidator = {
  query: Joi.object({
    page: JOI.PAGE.required(),
    limit: JOI.LIMIT.required(),
    level: Joi.number()
      .integer()
      .valid(...REFERRAL_CONSTANTS.VALID_LEVELS) // 1, 2, 3, 4
      .optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref("startDate")) // endDate must be >= startDate
      .optional(),
  }),
};
