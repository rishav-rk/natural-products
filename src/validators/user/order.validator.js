import { JOI } from "../../config/appConstants.js";
import Joi from "joi"

export const createOrderValidator = {
    body: Joi.object({})
}

export const verifyPaymentValidator = {
    body: Joi.object({
        razorpay_order_id : Joi.string().required().example('order_@#$2824ihuiu'),
        razorpay_payment_id : Joi.string().required().example('pay_!284924hfusf93'),
        razorpay_signature: Joi.string().required().example('8b537919ebaac93fb23iu234nse60da015d872032da31034f0abba7f573ddad67')
    }).required()
}

export const getMyOrderValidator = {
    query : Joi.object({
        page: JOI.PAGE, 
        limit: JOI.LIMIT,
    })
}

export const getMyOrderByIdValidator = {
    params: Joi.object({
        orderId: JOI.OBJECTID
    })
}