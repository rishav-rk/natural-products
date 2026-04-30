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
    houseNumberAndFloor: Joi.string().required().example('H.No. 123, Sector - 23'),
    buildingAndBlock: Joi.string().example("Block A, Building 5"),
    landMarkAndArea: Joi.string().example("Near Central Park"),
    pincode: Joi.string().required().example('560091'),
    city: Joi.string().example("Banglore"),
    state: Joi.string().example("Karnataka"),
    country: Joi.string().example("India"),
    type: Joi.string().required().valid("home", "work", "other"),
    addressLabel: Joi.string().example('friends home'),
    latitude: Joi.number().required().min(-90).max(90),
    longitude: Joi.number().required().min(-180).max(180),
  }).required(),
};

export const updateAddressValidator = {
  body: Joi.object({
    houseNumberAndFloor: Joi.string().required(),
    buildingAndBlock: Joi.string().example("Block A, Building 5"),
    landMarkAndArea: Joi.string().example("Near Central Park"),
    pincode: Joi.string().required().example('560091'),
    city: Joi.string().example("Banglore"),
    state: Joi.string().example("Karnataka"),
    country: Joi.string().example("India"),
    type: Joi.string().required().valid("home", "work", "other"),
    addressLabel: Joi.string().example('friends home'),
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

export const addToCart = {
  body: Joi.object({
    products: Joi.array()
      .items(
        Joi.object({
          productId: JOI.OBJECTID,
          quantity: Joi.number().integer().min(1).required(),
        }),
      )
      .min(1)
      .required(),
  }).required(),
};

export const getCart = {};

export const updateCart = {
  body: Joi.object({
    products: Joi.array().items(
      Joi.object({
        productId: JOI.OBJECTID,
        quantity: Joi.number().integer().min(0).required(), // 0 = remove item
      }),
    ).required(),
    addressId: JOI.OBJECTID.alter({
        request: (schema) => schema.optional(),
      }),
  }).required(),
};

export const deleteFromCart = {
  params: Joi.object({
    productId: JOI.OBJECTID.required(),
  }),
};
