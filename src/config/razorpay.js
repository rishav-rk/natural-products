import config from "../config/config.js"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
    key_id: config.razorypay.id, 
    key_secret: config.razorypay.secret
})

export default razorpay;