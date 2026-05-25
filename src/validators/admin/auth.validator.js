import {DATA_FILTER, JOI, PAYMENT_METHOD} from "../../config/appConstants.js"
import Joi from "joi"

export const loginAdminValidator = {
    body : Joi.object({
        "email" : JOI.EMAIL, 
        "password" : JOI.PASSWORD, 
        "deviceType" : JOI.DEVICE_TYPE,
        "deviceToken" : JOI.DEVICE_TOKEN, 
        "deviceId" : JOI.DEVICE_ID
    }).required()
}

export const updateAdminProfileValidator = {
    body : Joi.object({
        "name" : Joi.string().min(3).max(30),
        "image" : Joi.string().uri(),
    }).required()
}

export const changeAdminPasswordValidator = {
    body : Joi.object({
        "oldPassword" : JOI.PASSWORD,
        "newPassword" : JOI.PASSWORD
    }).required()
}

export const getDashboardValidator = {
    body : Joi.object({}),
    query: Joi.object({
        data: Joi.string().valid(...Object.values(DATA_FILTER))
    })
}

export const getTransactionsValidator = {
    query : Joi.object({
        mode: Joi.string().valid(...Object.values(PAYMENT_METHOD)).allow(""), 
        search: Joi.string(), 
        page: JOI.PAGE, 
        limit: JOI.LIMIT
    })
}