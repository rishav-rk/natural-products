import mongoose from "mongoose";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { User, Referral } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import { paginationOptions } from "../../utils/universalFunctions.js";

export const getUserReferrals = async (userId, page, limit) => {
  const skip = parseInt(page) * parseInt(limit);

  const [result] = await Referral.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $project: {
              _id: 0,
              codeId: "$_id",
              code: 1,
              timesUsed: 1,
              maxUses: 1,
              isActive: 1,
              totalEarnings: {
                $add: [
                  "$l1.earnings",
                  "$l2.earnings",
                  "$l3.earnings",
                  "$l4.earnings",
                ],
              },
              frequencyTable: {
                1: "$l1.referrals",
                2: "$l2.referrals",
                3: "$l3.referrals",
                4: "$l4.referrals",
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalCount: { $arrayElemAt: ["$metadata.total", 0] },
        data: 1,
      },
    },
  ]);

  return { referralStats: result.data, totalCount: result.totalCount ?? 0 };
};

export const getReferralById = async (userId, codeId, page, limit) => {
  if (!(await User.findById(userId, { _id: 1 }))) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
  }

  const referrals = await Referral.find(
    {
      _id: new mongoose.Types.ObjectId(codeId),
      user: new mongoose.Types.ObjectId(userId),
    },
    { createdAt: 0, _v: 0, updatedAt: 0 },
    paginationOptions(page, limit),
  ).lean();

  return {
    referrals,
    totalCount: await Referral.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
    }),
  };
};
