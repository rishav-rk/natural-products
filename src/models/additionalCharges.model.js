import mongoose from "mongoose"

const additionalChargesSchema = new mongoose.Schema({
    "handlingCharge": {
        type: String, 
        default: "9.6"
    }, 
    tax : {
        type: String, 
        default: "4.2"
    }, 
    shippingFee: {
        type: String, 
        default: "5.0"
    }
}, {timestamps : true})

const AdditionalCharges = mongoose.model("AdditionalCharge", additionalChargesSchema)
export default AdditionalCharges