import mongoose from "mongoose";
import { ADC, Referral, ReferralTransaction } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import {
  ERROR_MESSAGES,
  STATUS_CODES,
  REFERRAL_CONSTANTS,
} from "../../config/appConstants.js";
import { paginationOptions } from "../../utils/universalFunctions.js";

const CODE_MIN = 1_000_000_000; // 1000000000
const CODE_MAX = 9_999_999_999; // 9999999999 — 9 billion possible codes
const MAX_RETRIES = 5;

function generateRandomCode() {
  return Math.floor(Math.random() * (CODE_MAX - CODE_MIN + 1) + CODE_MIN).toString();
}

export async function generateReferralCode() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const code = generateRandomCode();

    const exists = await Referral.exists({ code });
    if (!exists) return code;

    if (attempt === MAX_RETRIES) {
      throw new Error("Failed to generate a unique referral code. Please try again.");
    }
  }
}

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

// export const getReferralCodes = async (userId, page, limit) => {
//   const skip = parseInt(page) * parseInt(limit);
  
//   const result = await Referral.aggregate([
//     {
//       $match: { user: new mongoose.Types.ObjectId(userId) }
//     },
//     {
//       $facet: {
//         metadata: [
//           { $count: "total" }
//         ],
//         data: [
//           { $skip: skip },
//           { $limit: parseInt(limit) },
//           {
//             $project: {
//               codeId: "$_id",
//               code: 1,
//               totalReferrals: { $size: "$transactions" },
//               frequencyTable: {
//                 "1": {
//                   $size: {
//                     $filter: {
//                       input: "$transactions",
//                       as: "txn",
//                       cond: { $eq: ["$$txn.level", 1] }
//                     }
//                   }
//                 },
//                 "2": {
//                   $size: {
//                     $filter: {
//                       input: "$transactions",
//                       as: "txn",
//                       cond: { $eq: ["$$txn.level", 2] }
//                     }
//                   }
//                 },
//                 "3": {
//                   $size: {
//                     $filter: {
//                       input: "$transactions",
//                       as: "txn",
//                       cond: { $eq: ["$$txn.level", 3] }
//                     }
//                   }
//                 },
//                 "4": {
//                   $size: {
//                     $filter: {
//                       input: "$transactions",
//                       as: "txn",
//                       cond: { $eq: ["$$txn.level", 4] }
//                     }
//                   }
//                 }
//               },
//               totalEarnings: { $sum: "$transactions.amount" },
//               _id: 0
//             }
//           }
//         ]
//       }
//     },
//     {
//       $project: {
//         totalCount: { $arrayElemAt: ["$metadata.total", 0] },
//         data: 1
//       }
//     }
//   ]);

//   return {
//     data: result[0].data,
//     totalCount: result[0].totalCount || 0
//   };
// };

// export const getReferralById = async (codeId, userId, level, page, limit) => {
//   const parsedLevel = parseInt(level);

//   // Validate level
//   if (!REFERRAL_CONSTANTS.VALID_LEVELS.includes(parsedLevel)) {
//     throw new OperationalError(
//       STATUS_CODES.ACTION_FAILED,
//       `Invalid level. Valid levels are: ${REFERRAL_CONSTANTS.VALID_LEVELS.join(", ")}`,
//     );
//   }

//   const skip = parseInt(page) * parseInt(limit);

//   const result = await Referral.aggregate([
//     {
//       $match: {
//         _id: new mongoose.Types.ObjectId(codeId),
//         user: new mongoose.Types.ObjectId(userId),
//       },
//     },
//     {
//       $project: {
//         code: 1,
//         user: 1,
//         [`l${level}`]: 1,
//         totalTransactions: {
//           $size: {
//             $filter: {
//               input: "$transactions",
//               as: "txn",
//               cond: { $eq: ["$$txn.level", parsedLevel] },
//             },
//           },
//         },
//         transactions: {
//           $slice: [
//             {
//               $filter: {
//                 input: "$transactions",
//                 as: "txn",
//                 cond: { $eq: ["$$txn.level", parsedLevel] },
//               },
//             },
//             skip,
//             parseInt(limit),
//           ],
//         },
//       },
//     },
//   ]);

//   if (!result.length) {
//     throw new OperationalError(
//       STATUS_CODES.ACTION_FAILED,
//       ERROR_MESSAGES.NO_SUCH_CODE,
//     );
//   }

//   if (result[0]) return result[0];
// };

// const formatTreeData = (transactions) => {
//   return REFERRAL_CONSTANTS.VALID_LEVELS.reduce((acc, level) => {
//     acc[level] = transactions.filter((txn) => txn.level === level);
//     return acc;
//   }, {});
// };

// export const getNextLevel = async (codeId, userId, filter) => {
// const data = await Referral.aggregate([
//     {
//       $match: {
//         _id: new mongoose.Types.ObjectId(codeId),
//         user: new mongoose.Types.ObjectId(userId),
//       },
//     },
//     {
//       $project: {
//         transactions: {
//           $filter: {
//             input: "$transactions",
//             as: "txn",
//             cond: {
//               $and: [
//                 { $eq: ["$$txn.level", filter?.level] },
//                 { $eq: ["$$txn.parent", filter?.parent ? new mongoose.Types.ObjectId(filter.parent) : null] },
//               ],
//             },
//           },
//         },
//       },
//     },
//   ]);

//   if (!data.length) {
//     throw new OperationalError(
//       STATUS_CODES.ACTION_FAILED,
//       ERROR_MESSAGES.NO_SUCH_CODE,
//     );
//   }

//   return data[0].transactions;
// }

// export const getReferralTree = async (codeId, token) => {
//   const data = await Referral.aggregate([
//     {
//       $match: {
//         _id: new mongoose.Types.ObjectId(codeId),
//         user: new mongoose.Types.ObjectId(token.user._id),
//       },
//     },
//     {
//       $project: {
//         code: 1, 
//         name : {$literal: token.user.name},
//         image: {$literal : token.user.image},
//         transactions: {
//           $filter: {
//             input: "$transactions",
//             as: "txn",
//             cond: {
//               $and: [
//                 { $eq: ["$$txn.level", 1] },
//               ],
//             },
//           },
//         },
//       },
//     },
//   ]);

//   return data[0]
// };

// ─── Use Code ────────────────────────────────────────────────────────────────
