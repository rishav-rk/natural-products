import AdditionalCharges from "../../models/additionalCharges.model.js";
import { OperationalError } from "../../utils/error.js";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";

export const getConstants = async () => {
  let constants = await AdditionalCharges.findOne();

  if (!constants) {
    constants = await AdditionalCharges.create({});
  }

  return constants;
};

export const updateConstants = async (updateData) => {
  console.log(updateData)
  const constants = await AdditionalCharges.findOneAndUpdate({}, updateData, {
    new: true,
    upsert: true,
  });

  if (!constants) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }

  return constants;
};

export const getAboutInfo = async () => {
  const { aboutUs } = await AdditionalCharges.findOne(
    {},
    { aboutUs: 1 },
  ).lean();
  if (!aboutUs) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
  return aboutUs;
};

export const getTerms = async () => {
  const { termsAndConditions } = await AdditionalCharges.findOne(
    {},
    { termsAndConditions: 1 },
  ).lean();

  if (!termsAndConditions) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }

  return termsAndConditions;
};

export const getPrivacyPolicy = async () => {
  const { privacyAndPolicy } = await AdditionalCharges.findOne(
    {},
    { privacyAndPolicy: 1 },
  ).lean();

  if (!privacyAndPolicy) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }

  return privacyAndPolicy;  
};
