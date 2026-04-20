import Joi from "joi";
import {JOI} from "../../config/appConstants.js";

export const signUpValidator = {
  body: Joi.object({
    name: Joi.string().required().trim().example('John Doe'),
    countryCode: JOI.COUNTRY_CODE,
    phoneNumber: JOI.PHONENUMBER,
    password: JOI.PASSWORD,
  }).required(),
};

export const loginValidator = {
  body: Joi.object({
    countryCode: JOI.COUNTRY_CODE,
    phoneNumber: JOI.PHONENUMBER,
    password: JOI.PASSWORD,
    deviceId: JOI.DEVICE_ID,
    deviceType: JOI.DEVICE_TYPE,
    deviceToken: Joi.string(),
  }).required(),
};

export const forgotPasswordValidator = {
  body: Joi.object({
    countryCode: JOI.COUNTRY_CODE,
    phoneNumber: JOI.PHONENUMBER,
    deviceId: Joi.string().required(),
    deviceType: JOI.DEVICE_TYPE,
    deviceToken: Joi.string()
  }).required(),
};

export const verifyOtpValidator = {
  body: Joi.object({
    otp: Joi.string().required(),
  }).required(),
};

export const resetPasswordValidator = {
  body: Joi.object({
    password: JOI.PASSWORD,
  }).required(),
};

export const logoutValidator = {
  body: Joi.object({
    deviceId: Joi.string().required(),
    deviceType: JOI.DEVICE_TYPE,
    deviceToken: Joi.string()
  }).required(),
};