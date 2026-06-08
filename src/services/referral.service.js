import mongoose from "mongoose";
import { ADC, Referral, ReferralTransaction } from "../models/index.js";
import { OperationalError } from "../utils/error.js";
import {
  ERROR_MESSAGES,
  STATUS_CODES,
  REFERRAL_CONSTANTS,
} from "../config/appConstants.js";
import { paginationOptions } from "../utils/universalFunctions.js";

const CODE_MIN = 1_000_000_000; // 1000000000
const CODE_MAX = 9_999_999_999; // 9999999999 — 9 billion possible codes
const MAX_RETRIES = 5;

function generateRandomCode() {
  return Math.floor(
    Math.random() * (CODE_MAX - CODE_MIN + 1) + CODE_MIN,
  ).toString();
}

export async function generateReferralCode() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const code = generateRandomCode();

    const exists = await Referral.exists({ code });
    if (!exists) return code;

    if (attempt === MAX_RETRIES) {
      throw new Error(
        "Failed to generate a unique referral code. Please try again.",
      );
    }
  }
}

export const checkCodeAvailability = async ({code}, userId) => {
  const referral = await Referral.findOne({
    code,
    isActive: true,
    $expr: { $lt: ["$timesUsed", "$maxUses"] }, // respects the actual maxUses field
  });

  if (!referral) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INVALID_CODE,
    );
  }

  const isOwnCode = referral.user?.toString() === userId.toString();

  if (isOwnCode && referral.hasUsedItsOwnCode) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INVALID_CODE,
    );
  }
};

export const useReferralCode = async ({ order, user, session }) => {
  const { codeId, code, isActivated } = order.referral ?? {};

  // Skip if no referral code was applied or already activated
  if (!codeId || isActivated) return;

  const userId    = order.user;
  const userName  = user.name;
  const userImage = user.image;

  // 1. Fetch the referral — no need to re-validate since timesUsed
  //    was already incremented and validated in createOrder
  const referral = await Referral.findById(codeId).session(session).lean();
  if (!referral) {
    console.error("[REFERRAL] Referral not found for codeId:", codeId);
    return;
  }

  const isOwnCode = referral.user?.toString() === userId.toString();

  // 2. Fetch ancestor chain via $graphLookup in one query
  const [ancestorChain] = await Referral.aggregate([
    { $match: { _id: referral._id } },
    {
      $graphLookup: {
        from:             "referrals",
        startWith:        "$parent",
        connectFromField: "parent",
        connectToField:   "_id",
        as:               "ancestors",
        maxDepth:         REFERRAL_CONSTANTS.MAX_LEVEL - 2,
        depthField:       "depth",
      },
    },
    {
      $project: {
        ancestors: {
          $sortArray: { input: "$ancestors", sortBy: { depth: 1 } },
        },
      },
    },
  ]).session(session);

  const ancestors = ancestorChain?.ancestors ?? [];

  // 3. Build bulk ops + transactions
  const bulkReferralOps      = [];
  const transactionsToInsert = [];

  // L1 — earnings + referral count only, timesUsed already incremented in createOrder
  const l1Amount = REFERRAL_CONSTANTS.LEVEL_AMOUNTS[1];

  bulkReferralOps.push({
    updateOne: {
      filter: { _id: referral._id },
      update: {
        $inc: {
          "l1.earnings":  l1Amount,
          "l1.referrals": 1,
        },
        ...(isOwnCode && { $set: { hasUsedItsOwnCode: true } }),
      },
    },
  });

  transactionsToInsert.push({
    referral:        referral._id,
    paidBy:          userId,
    paidByUsername:  userName,
    paidByImage:     userImage,
    amount:          l1Amount,
    level:           1,
    parent:          null,
  });

  // L2–L4 — ancestors
  for (const ancestor of ancestors) {
    const level = ancestor.depth + 2;
    if (level > REFERRAL_CONSTANTS.MAX_LEVEL) break;

    const amount = REFERRAL_CONSTANTS.LEVEL_AMOUNTS[level];

    bulkReferralOps.push({
      updateOne: {
        filter: { _id: ancestor._id },
        update: {
          $inc: {
            [`l${level}.earnings`]:  amount,
            [`l${level}.referrals`]: 1,
          },
        },
      },
    });

    transactionsToInsert.push({
      referral:       ancestor._id,
      paidBy:         userId,
      paidByUsername: userName,
      paidByImage:    userImage,
      amount,
      level,
      parent:         referral.user,
    });
  }

  // 4. Generate new referral code for the user who just used a code
  const newCode = await generateReferralCode();

  // 5. Execute all referral writes — shares the caller's session
  await Promise.all([
    Referral.bulkWrite(bulkReferralOps, { session }),
    ReferralTransaction.insertMany(transactionsToInsert, { session }),
    Referral.create([{ user: userId, code: newCode, parent: referral._id }], { session }),
  ]);
};

// ─── Query Services ──────────────────────────────────────────────────────────

// Uses l1/l2/l3/l4 counters directly — no array scanning
export const getReferralCodes = async (userId, page, limit) => {
  const skip = parseInt(page) * parseInt(limit);

  const [result] = await Referral.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
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

  return { data: result.data, totalCount: result.totalCount ?? 0 };
};

// Now queries ReferralTransaction collection — works at any scale
export const getReferralById = async (codeId, userId, level, page, limit) => {
  const parsedLevel = parseInt(level);

  if (!REFERRAL_CONSTANTS.VALID_LEVELS.includes(parsedLevel)) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      `Invalid level. Valid levels are: ${REFERRAL_CONSTANTS.VALID_LEVELS.join(", ")}`,
    );
  }

  const referral = await Referral.findOne(
    { _id: codeId, user: userId },
    { code: 1, [`l${parsedLevel}`]: 1 },
  ).lean();

  if (!referral) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_CODE,
    );
  }

  const [transactions, totalTransactions] = await Promise.all([
    ReferralTransaction.find({ referral: codeId, level: parsedLevel })
      .sort({ paidOn: -1 })
      .skip(parseInt(page) * parseInt(limit))
      .limit(parseInt(limit))
      .lean(),
    ReferralTransaction.countDocuments({
      referral: codeId,
      level: parsedLevel,
    }),
  ]);

  return {
    code: referral.code,
    levelStats: referral[`l${parsedLevel}`],
    totalTransactions,
    transactions,
  };
};

// Root of tree — returns L1 nodes for a given referral code
export const getReferralTree = async (codeId, token) => {
  const referral = await Referral.findOne(
    { _id: codeId, user: token.user._id },
    { code: 1 },
  ).lean();

  if (!referral) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_CODE,
    );
  }

  const l1Nodes = await ReferralTransaction.find({ referral: codeId, level: 1 })
    .select("paidBy paidByUsername paidByImage amount paidOn")
    .lean();

  return {
    codeId: referral._id,
    code: referral.code,
    name: token.user.name,
    image: token.user.image,
    children: l1Nodes,
  };
};

// Lazy-loads children of a node when user expands the tree
// GET /next-level/:codeId?level=2&parent=<userId>
export const getNextLevel = async (codeId, userId, level, parentUserId) => {
  const parsedLevel = parseInt(level);

  if (!REFERRAL_CONSTANTS.VALID_LEVELS.includes(parsedLevel)) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      `Invalid level. Valid levels are: ${REFERRAL_CONSTANTS.VALID_LEVELS.join(", ")}`,
    );
  }

  // Verify the codeId belongs to the requesting user
  const referral = await Referral.exists({ _id: codeId, user: userId });
  if (!referral) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_CODE,
    );
  }

  const children = await ReferralTransaction.find({
    referral: codeId,
    level: parsedLevel,
    parent: parentUserId ? new mongoose.Types.ObjectId(parentUserId) : null,
  })
    .select("paidBy paidByUsername paidByImage amount paidOn")
    .lean();

  return children;
};
