import { successResponse } from "../../utils/response.js";
import {
    createOrder
} from "../../services/user/order.service.js"
import {catchAsync} from "../../utils/universalFunctions.js"

export const createOrder = catchAsync(async(req, res)=>{
    const order = await createOrder(req.body, req.token);
})

export const getMyOrders = catchAsync(async (req, res)=>{

})