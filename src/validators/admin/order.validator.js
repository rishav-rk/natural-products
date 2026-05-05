import { JOI, ORDER_STATUS } from "../../config/appConstants.js";
import Joi from "joi";

export const getOrders = {
  query: Joi.object({
    page: JOI.PAGE,
    limit: JOI.LIMIT,
    // search: Joi.string().optional().example("order123"),
    startDate: Joi.date().optional().example("2024-01-01"),
    endDate: Joi.date().optional().example("2024-12-31"),
    status : Joi.string().valid(...Object.values(ORDER_STATUS))
  }).optional(),
};

export const getOrderById = {
  params: Joi.object({
    orderId: JOI.OBJECTID,
  }),
};
