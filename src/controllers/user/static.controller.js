import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { successResponse } from "../../utils/response.js";
import { sendMail } from "../../utils/sendMail.js";

export const submitContactUs = (req, res) => {
  const info = req.body;
  info.phoneNumber = req.token.user.phoneNumber;

  sendMail(info);

  return successResponse(
    req,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
};

export const getAboutUs = (req, res) => {
  res.render("about-us", {
    title: "About Us",
    activePage: "About",
  });
};

export const getPrivacyPolicy = (req, res) => {
  res.render("privacy-policy", {
    title: "Privacy Policy",
    activePage: "Privacy",
  });
};

export const getTermsAndConditions = (req, res) => {
  res.render("terms-and-conditions", {
    title: "Term & Conditions",
    activePage: "Terms & Conditions",
  });
};
