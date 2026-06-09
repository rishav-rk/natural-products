import { Wallet, WalletTransaction, Referral } from "../../models/index.js";
import {
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
} from "../../config/appConstants.js";
import mongoose from "mongoose";
import { paginationOptions } from "../../utils/universalFunctions.js";

export const creditWallet = async ({
  userId,
  amount,
  type,
  note = null,
  referralId = null,
  level = null,
  paidBy = null,
  paidByUsername = null,
  orderRef = null,
  session,
}) => {
  let wallet = await Wallet.findOne({ user: userId }).session(session);
  if (!wallet) {
    [wallet] = await Wallet.create([{ user: userId }], { session });
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore + amount;

  await Wallet.updateOne(
    { _id: wallet._id },
    { $inc: { balance: amount, lifetimeEarnings: amount } },
    { session },
  );

  await WalletTransaction.create(
    [
      {
        wallet: wallet._id,
        user: userId,
        type,
        status: TRANSACTION_STATUS.SUCCESS,
        amount,
        balanceBefore,
        balanceAfter,
        referral: referralId,
        level,
        paidBy,
        paidByUsername,
        orderRef,
        note,
      },
    ],
    { session },
  );
};

// wallet.service.js

// ── Get wallet balance + lifetime earnings ───────────────────────────────
export const getBalance = async (userId) => {
  const wallet = await Wallet.findOne(
    { user: userId },
    {
      balance: 1,
      lifetimeEarnings: 1,
      currency: 1,
    },
  ).lean();

  // Return zeroes if wallet doesn't exist yet
  if (!wallet) {
    return { balance: 0, lifetimeEarnings: 0, currency: "INR" };
  }

  return wallet;
};

// ── Get paginated transaction history ────────────────────────────────────
// wallet.service.js

export const getTransactions = async (
  userId,
  { page = 0, limit = 10, level, startDate, endDate },
) => {
  const skip = parseInt(page) * parseInt(limit);
  const filter = { user: new mongoose.Types.ObjectId(userId) };

  // Filter by level — joins ReferralTransaction to check level
  // We store level on WalletTransaction via referralTransaction field
  // Simpler: store level directly on WalletTransaction (see model update below)
  if (level) {
    filter.level = parseInt(level);
  }

  // Filter by date range
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)
      filter.createdAt.$lte = new Date(
        new Date(endDate).setHours(23, 59, 59, 999),
      );
  }

  const [transactions, totalCount, totalEarnings] = await Promise.all([
    WalletTransaction.find(
      filter,
      { wallet: 0, __v: 0 },
      paginationOptions(page, limit),
    ).lean(),
    WalletTransaction.countDocuments(filter),

    // Total earnings matching the current filter (not just this page)
    WalletTransaction.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    totalCount,
    totalEarnings: totalEarnings[0]?.total ?? 0,
    transactions,
  };
};

// ── Earnings breakdown — total per type ──────────────────────────────────
// export const getEarnings = async (userId) => {
//   const [wallet, breakdown] = await Promise.all([
//     // Overall balance
//     Wallet.findOne(
//       { user: userId },
//       {
//         balance: 1,
//         lifetimeEarnings: 1,
//       },
//     ).lean(),

//     // Group by transaction type to show breakdown
//     WalletTransaction.aggregate([
//       { $match: { user: new mongoose.Types.ObjectId(userId) } },
//       {
//         $group: {
//           _id: "$type",
//           total: { $sum: "$amount" },
//           count: { $sum: 1 },
//           lastEarned: { $max: "$createdAt" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           type: "$_id",
//           total: 1,
//           count: 1,
//           lastEarned: 1,
//         },
//       },
//     ]),
//   ]);

//   return {
//     balance: wallet?.balance ?? 0,
//     lifetimeEarnings: wallet?.lifetimeEarnings ?? 0,
//     breakdown, // [ { type: "referral_credit", total: 1400, count: 3 }, ... ]
//   };
// };

// wallet.service.js
export const getEarnings = async (
  userId,
  { page = 0, limit = 10, level, startDate, endDate },
) => {
  const filter = {
    user: new mongoose.Types.ObjectId(userId),
    type: { $in: [TRANSACTION_TYPES.REFERRAL_CREDIT, TRANSACTION_TYPES.BONUS] }, // ← only credits
    status: TRANSACTION_STATUS.SUCCESS,
  };

  if (level) filter.level = parseInt(level);

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)
      filter.createdAt.$lte = new Date(
        new Date(endDate).setHours(23, 59, 59, 999),
      );
  }

  const [transactions, totalCount, totalEarnings] = await Promise.all([
    WalletTransaction.find(
      filter,
      {
        amount: 1,
        level: 1,
        paidByUsername: 1,
        orderRef: 1,
        createdAt: 1,
        type: 1,
      },
      paginationOptions(page, limit),
    ).lean(),

    WalletTransaction.countDocuments(filter),

    // Total credited amount matching current filter — shown in green card
    WalletTransaction.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    totalEarnings: totalEarnings[0]?.total ?? 0, // ← only credited amounts
    totalCount,
    transactions,
  };
};

export const getSummary = async (userId) => {
  const [wallet, totalReferrals] = await Promise.all([
    // Wallet balance + lifetime earnings
    Wallet.findOne(
      { user: userId },
      { balance: 1, lifetimeEarnings: 1 },
    ).lean(),

    // Total referrals = sum of all l1 referrals across all codes owned by user
    Referral.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), byAdmin: false } },
      {
        $group: {
          _id: null,
          total: { $sum: "$l1.referrals" }, // only count direct referrals
        },
      },
    ]),
  ]);

  return {
    referrals: totalReferrals[0]?.total ?? 0, // "4" in UI
    totalEarnings: wallet?.lifetimeEarnings ?? 0, // "₹12,000" in UI
    walletBalance: wallet?.balance ?? 0, // "₹10,000" in UI
  };
};
