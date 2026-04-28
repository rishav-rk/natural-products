import mongoose from "mongoose"

const additionalChargesSchema = new mongoose.Schema({
    handlingCharge: {
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
    }, 
    video: {
        type: String, 
        default: "https://youtu.be/dQw4w9WgXcQ?si=Ra2nYfm9iKK2c5j-"
    }
}, {timestamps : true})

const AdditionalCharges = mongoose.model("AdditionalCharge", additionalChargesSchema)
export default AdditionalCharges