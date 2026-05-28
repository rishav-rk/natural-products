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

export const updateProfileConstants = {
    body: Joi.object({
        about: Joi.string().example("We are a company that sells nature products."), 
        privacyAndPolicy: Joi.string().example("We respect your privacy and we do not share your data with third parties."),
        termsAndConditions: Joi.string().example("By using our service, you agree to our terms and conditions.")
    }).required()
}