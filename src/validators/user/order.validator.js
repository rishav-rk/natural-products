import { JOI } from "../../config/appConstants.js";
import Joi from "joi"

export const createOrderValidator = {
    body: Joi.object({
        products: Joi.array().items(Joi.object({
            productId: JOI.OBJECTID, 
            quantity: JOI.number().integer().required()
        })), 
        shippingAddress: Joi.object({
            houseNumberAndFloor: Joi.string().required(), 
            buildingAndBlock: Joi.string().example('Block No. 3'), 
            landMarkAndArea: Joi.string().example('Near sports complex'), 
            city: Joi.string().required().example('Banglore'), 
            state: Joi.string().example('Karnataka'), 
            pincode: Joi.string().required().example('560091'), 
            country: Joi.string().example('India'),
        }).required()
    }).required()
}