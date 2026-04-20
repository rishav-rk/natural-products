import { JOI } from "../../config/appConstants.js";
import Joi from "joi";

export const getProfileValidator = {
  body: Joi.object({}),
};

export const updateProfileValidator = {
  body: Joi.object({
    name: Joi.string().trim().required(),
    image: Joi.string().uri(),
  }).required(),
};
