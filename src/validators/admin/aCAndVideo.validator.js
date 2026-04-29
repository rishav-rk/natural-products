import Joi from "joi"
import {JOI} from "../../config/appConstants.js"

export const updateConstants = {
    body: Joi.object({
        tax: Joi.string().example("4.2"), 
        video: Joi.string().uri()
    }).required()
}

export const getConstants = {
    body: Joi.object({})
}