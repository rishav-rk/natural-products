import { JOI } from "../../config/appConstants.js";
import Joi from "joi"

export const getUserReferralsValidator = {
    params: Joi.object({
        userId: JOI.OBJECTID
    }).required(), 
    query: Joi.object({
        page: JOI.PAGE, 
        limit: JOI.LIMIT
    }).required()
}

export const getReferralByIdValidator = {
    params: Joi.object({
        userId: JOI.OBJECTID, 
        codeId: JOI.OBJECTID
    }).required(), 
    query: Joi.object({
        page: JOI.PAGE, 
        limit: JOI.LIMIT
    })
}