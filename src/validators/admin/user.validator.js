import { JOI } from "../../config/appConstants.js";
import Joi from "joi";

export const getAllUsers = {
  query: Joi.object({
    page: JOI.PAGE,
    limit: JOI.LIMIT,
  }),
};

export const getUserByPhoneOrName = {
  query: Joi.object({
    search: Joi.string().required(),
    page: JOI.PAGE,
    limit: JOI.LIMIT,
  }),
};

export const getUserById = {
  params: Joi.object({
    id: JOI.OBJECTID,
  }).required(),
};

export const enableDisableUser = {
  body: Joi.object({
    userId: JOI.OBJECTID,
  }).required(),
};
