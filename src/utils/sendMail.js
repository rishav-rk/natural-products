import brevoClient from "../config/brevo.js";
import config from "../config/config.js";

const templates = {
  templateForContactUs: 1,
};

const sendTo = [
      { email: config.brevo.senderEmail, name: "Nature Lap Contact Form" },
    ]
if(config.environment === "development"){
  sendTo.push({ email: config.brevo.testMail, name: "Test Mail" })
}

export const sendMail = async (info = {}) => {
  const result = await brevoClient.transactionalEmails.sendTransacEmail({

    to: sendTo,
    templateId: templates.templateForContactUs,
    params: {
      name: info.name,
      email: info.email,
      subject: info.subject,
      message: info.message,
      phoneNumber: info.phoneNumber,
    },
  });
};
