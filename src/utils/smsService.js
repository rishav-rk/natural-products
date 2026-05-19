import axios from "axios"
import config from "../config/config.js"

// Use MSG91 only to SEND the SMS with your OTP
const senderId = '1701177640263980723'
const templates = {
    templateIdForSignupOTP : '69f1b7e8c69e44a6f9002802'
}
export const sendOTPViaSMS = async (phoneNumber, otp) => {
  const response = await axios.post(
    "https://api.msg91.com/api/v5/flow/",
    {
      template_id: templates.templateIdForSignupOTP, // your DLT template
      sender: senderId,
      mobiles: `91${phoneNumber}`,
      OTP: otp,  // this maps to ##OTP## in your template
    },
    {
      headers: {
        authkey: config.msg91Secret,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

