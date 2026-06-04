import { ADC, Referral } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { paginationOptions } from "../../utils/universalFunctions.js";

export const getConstants = async () => {
  let constants = await ADC.findOne();

  if (!constants) {
    constants = await ADC.create({});
  }

  return constants;
};

export const updateConstants = async (updateData) => {
  console.log(updateData);
  const constants = await ADC.findOneAndUpdate({}, updateData, {
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
  const { aboutUs } = await ADC.findOne({}, { aboutUs: 1 }).lean();
  if (!aboutUs) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.SERVER_ERROR,
    );
  }
  return aboutUs;
};

export const getTerms = async () => {
  const { termsAndConditions } = await ADC.findOne(
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
  const { privacyAndPolicy } = await ADC.findOne(
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

const createFrequencyTable = (transactions) => {
  const frequencyTable = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
  let totalEarnings = 0;
  transactions.forEach((transaction) => {
    frequencyTable[transaction.level] = frequencyTable[transaction.level] + 1;
    totalEarnings += transaction.amount;
  });
  return { frequencyTable, totalEarnings };
};

export const getReferralCodes = async (userId, page, limit) => {
  const referralCodes = await Referral.find(
    { user: userId },
    {},
    paginationOptions(page, limit),
  ).lean();
  const data = referralCodes.map((code) => ({
    codeId: code._id,
    code: code.code,
    totalReferrals: code.transactions.length,
    ...createFrequencyTable(code.transactions)
  }));
  
  return data;
};

export const getReferralById = async (codeId, level, page, limit) => {
  const details = await Referral.find({_id: codeId, "transactions.level" : {$eq : level}})
}