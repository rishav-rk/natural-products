import mongoose from "mongoose"

const additionalChargesSchema = new mongoose.Schema({
    tax : {
        type: String, 
        default: "4.2"
    }, 
    shippingFee : {
        type: String, 
        default: "100.00"
    },
    video: {
        type: String, 
        default: "https://youtu.be/dQw4w9WgXcQ?si=Ra2nYfm9iKK2c5j-"
    }, 
    privacyAndPolicy: {
        type: String, 
        default: "We respect your privacy and we do not share your data with third parties."
    }, 
    termsAndConditions: {
        type: String, 
        default: "By using our service, you agree to our terms and conditions."
    },
    aboutUs: {
        type: String, 
        default: "We are a company that sells nature products."
    }
}, {timestamps : true})

const AdditionalCharges = mongoose.model("AdditionalCharge", additionalChargesSchema)
export default AdditionalCharges