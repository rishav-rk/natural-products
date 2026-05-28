import Joi from "joi"
import {JOI} from "../../config/appConstants.js"

export const updateConstants = {
    body: Joi.object({
        tax: Joi.number().example(4.2), 
        video: Joi.string().uri(),
        shippingFee: Joi.number().example(100),
        privacyAndPolicy: Joi.string().example("Privacy Policy Content"),
        termsAndConditions: Joi.string().example("Terms and Conditions Content"),
        aboutUs: Joi.string().example("About Us Content")
    }).required()
}

export const getConstants = {
    body: Joi.object({})
}