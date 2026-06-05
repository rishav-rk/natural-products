import mongoose from "mongoose";
import { ADC, Referral } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import {
  ERROR_MESSAGES,
  STATUS_CODES,
  REFERRAL_CONSTANTS,
} from "../../config/appConstants.js";
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
  const frequencyTable = {};
  REFERRAL_CONSTANTS.VALID_LEVELS.forEach((level) => {
    frequencyTable[level] = 0;
  });
  let totalEarnings = 0;
  transactions.forEach((transaction) => {
    if (frequencyTable[transaction.level] !== undefined) {
      frequencyTable[transaction.level] += 1;
      totalEarnings += transaction.amount;
    }
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
    ...createFrequencyTable(code.transactions),
  }));

  return data;
};

export const getReferralById = async (codeId, level, page, limit) => {
  const parsedLevel = parseInt(level);

  // Validate level
  if (!REFERRAL_CONSTANTS.VALID_LEVELS.includes(parsedLevel)) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      `Invalid level. Valid levels are: ${REFERRAL_CONSTANTS.VALID_LEVELS.join(", ")}`,
    );
  }

  const skip = parseInt(page) * parseInt(limit);

  const result = await Referral.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(codeId) } },
    {
      $project: {
        code: 1,
        [`l${level}`]: 1,
        transactions: {
          $slice: [
            {
              $filter: {
                input: "$transactions",
                as: "txn",
                cond: { $eq: ["$$txn.level", parsedLevel] },
              },
            },
            skip,
            parseInt(limit),
          ],
        },
      },
    },
  ]);

  if (!result.length) {
    return {
      code: null,
      total: 0,
      transactions: [],
    };
  }
  return result[0];
};
