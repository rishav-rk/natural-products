import Joi from "joi"
import {JOI} from "../../config/appConstants.js"

export const updateConstants = {
    body: Joi.object({
        tax: Joi.number().example(4.2), 
        video: Joi.string().uri(),
        shippingFee: Joi.number().example(100)
    }).required()
}

export const getConstants = {
    body: Joi.object({})
}