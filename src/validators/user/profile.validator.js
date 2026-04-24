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

export const changePasswordValidator = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: JOI.PASSWORD,
  }).required(),
};

export const addAddressValidator = {
  body: Joi.object({
    houseNumberAndFloor: Joi.string().required(),
    builidingAndBlock: Joi.string().example("Block A, Building 5"),
    landMarkAndArea: Joi.string().example("Near Central Park"),
    city: Joi.string().example('Hyderabad'),
    state: Joi.string().example('Telangana'),
    country: Joi.string().example('India'),
    type: Joi.string().required().valid('home', 'work', 'other'),
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
  }).required(),
};

export const updateAddressValidator = {
  body: Joi.object({
    houseNumberAndFloor: Joi.string().required(),
    builidingAndBlock: Joi.string().example("Block A, Building 5"),
    landMarkAndArea: Joi.string().example("Near Central Park"),
    city: Joi.string().example('Hyderabad'),
    state: Joi.string().example('Telangana'),
    country: Joi.string().example('India'),
    type: Joi.string().required().valid('home', 'work', 'other'),
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
  }).required(),
  
  params: Joi.object({
    addressId: JOI.OBJECTID,
  }).required(),
};

export const deleteAddressValidator = {
  body: Joi.object({
    addressId: JOI.OBJECTID,
  }).required(),
};
