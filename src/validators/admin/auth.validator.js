import {JOI} from "../../config/appConstants.js"
import Joi from "joi"

export const loginValidator = {
    body : Joi.object({
        "email" : JOI.EMAIL, 
        "password" : JOI.PASSWORD
    }).required()
}

