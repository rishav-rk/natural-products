import { STATUS_CODES, SUCCESS_MESSAGES } from "../../config/appConstants.js";
import { successResponse } from "../../utils/response.js";
import { sendMail } from "../../utils/sendMail.js";
import * as constantsService from "../../services/admin/additionalCharges.service.js";
import { catchAsync } from "../../utils/universalFunctions.js";

export const submitContactUs = catchAsync((req, res) => {
  const info = req.body;
  info.phoneNumber = req.token.user.phoneNumber;

  sendMail(info);

  return successResponse(
    req,
    res,
    STATUS_CODES.ACTION_COMPLETE,
    SUCCESS_MESSAGES.SUCCESS,
  );
})

export const getAboutUs = catchAsync(async (req, res) => {
  const aboutUs = await constantsService.getAboutInfo();
  res.render("about-us", {
    title: "About Us",
    activePage: "About",
    aboutUs: aboutUs
  });
});

export const getPrivacyPolicy = catchAsync(async (req, res) => {
  const privacyPolicy = await constantsService.getPrivacyPolicy();
  res.render("privacy-policy", {
    title: "Privacy Policy",
    activePage: "Privacy",
    privacyPolicy: privacyPolicy
  });
});

export const getTermsAndConditions = catchAsync(async (req, res) => {
  const termsAndConditions = await constantsService.getTerms();
  res.render("terms-and-conditions", {
    title: "Term & Conditions",
    activePage: "Terms & Conditions",
    termsAndConditions: termsAndConditions
  });
})
