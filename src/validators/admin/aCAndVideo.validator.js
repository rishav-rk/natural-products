import Joi from "joi"
import {JOI} from "../../config/appConstants.js"

export const updateConstants = {
    body: Joi.object({
        handlingCharge: Joi.string().example("9.6"), 
        tax: Joi.string().example("4.2"), 
        shippingFee: Joi.string().example("5.0"),
        video: Joi.string().uri()
    }).required()
}

export const getConstants = {
    body: Joi.object({})
}