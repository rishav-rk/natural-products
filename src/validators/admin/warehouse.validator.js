import Joi from "joi";
import { JOI } from "../../config/appConstants.js";

export const createWarehouseValidator = {
  body: Joi.object({
    name: Joi.string().required(),
    phone: JOI.PHONENUMBER,
    email: JOI.EMAIL,
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().default("India"),
    pin: Joi.string().required(),
    gstNumber: Joi.string().optional().allow(""),
    return_address: Joi.string().optional(),
    return_pin: Joi.string().optional(),
    return_city: Joi.string().optional(),
    return_state: Joi.string().optional(),
    return_country: Joi.string().default("India").optional(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
  }).required(),
};
export const updateWarehouseValidator = {
  params: Joi.object({
    id: JOI.OBJECTID,
  }),

  body: Joi.object({
    name: Joi.string().optional(),
    phone: JOI.PHONENUMBER.optional(),
    email: JOI.EMAIL.optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    pin: Joi.string().optional(),
    gstNumber: Joi.string().optional(),
    return_address: Joi.string().optional(),
    return_pin: Joi.string().optional(),
    return_city: Joi.string().optional(),
    return_state: Joi.string().optional(),
    return_country: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
  }).required(),
};

export const getWarehousesValidator = {
  query: Joi.object({
    search: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    page: JOI.PAGE,
    limit: JOI.LIMIT,
  }),
};

export const getWarehouseByIdValidator = {
  params: Joi.object({
    id: JOI.OBJECTID,
  }),
};

export const deleteWarehouseValidator = {
  params: Joi.object({
    id: JOI.OBJECTID,
  }),
};
