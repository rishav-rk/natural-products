import brevoClient from "../config/brevo.js";
import config from "../config/config.js";

const templates = {
  templateForContactUs: 1,
};

export const sendMail = async (info = {}) => {
  const result = await brevoClient.transactionalEmails.sendTransacEmail({
    to: [
      { email: config.senderEmail, name: "Nature Lap Contact Form" },
      // { email: "hasiv41424@marineso.com", name: "Testing purpose" },
    ],
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
