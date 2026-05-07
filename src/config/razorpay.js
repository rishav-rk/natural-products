import config from "../config/config.js"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
    key_id: config.razorpay.id, 
    key_secret: config.razorpay.secret
})

export default razorpay;