import {
  Wallet,
  WalletTransaction,
  Referral,
  Order,
} from "../../models/index.js";
import {
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  ERROR_MESSAGES,
  STATUS_CODES,
  PAYMENT_STATUS,
} from "../../config/appConstants.js";
import mongoose from "mongoose";
import { paginationOptions } from "../../utils/universalFunctions.js";
import { initiateRazorpayPayout } from "../../utils/razorpayPayout.js";

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
// amount spent on transactions

export const getTransactions = async (
  userId,
  { page = 0, limit = 10, startDate, endDate },
) => {
  const filter = {
    user: new mongoose.Types.ObjectId(userId),
    "payment.status": PAYMENT_STATUS.COMPLETED,
  };

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate)
      filter.createdAt.$lte = new Date(
        new Date(endDate).setHours(23, 59, 59, 999),
      );
  }

  const [transactions, totalCount, totalSpendings] = await Promise.all([
    Order.find(
      filter,
      { orderId: 1, grandTotalAmount: 1, "payment.paidAt" : 1, createdAt : 1, userName : 1},
      paginationOptions(page, limit),
    ).lean(),
    Order.countDocuments(filter),

    // Total earnings matching the current filter (not just this page)
    Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$grandTotalAmount" } },
        },
      },
    ]),
  ]);

  return {
    totalCount,
    totalSpendings: totalSpendings[0]?.total ?? 0,
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

// ── Debit wallet ──────────────────────────────────────────────────────────
export const debitWallet = async ({
  userId,
  amount,
  type,
  status = TRANSACTION_STATUS.PENDING,
  note = null,
  accountIdentifier = null,
  session,
}) => {
  const wallet = await Wallet.findOne({ user: userId }).session(session);

  if (!wallet)
    throw new OperationalError(
      STATUS_CODES.NOT_FOUND,
      ERROR_MESSAGES.WALLET_NOT_FOUND,
    );
  if (wallet.balance < amount)
    throw new OperationalError(
      STATUS_CODES.BAD_REQUEST,
      ERROR_MESSAGES.INSUFFICIENT_BALANCE,
    );

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore - amount;

  await Wallet.updateOne(
    { _id: wallet._id },
    { $inc: { balance: -amount } },
    { session },
  );

  const [transaction] = await WalletTransaction.create(
    [
      {
        wallet: wallet._id,
        user: userId,
        type,
        status,
        amount,
        balanceBefore,
        balanceAfter,
        note,
        payout: {
          method: "bank",
          accountIdentifier, // masked account number stored here
        },
      },
    ],
    { session },
  );

  return transaction;
};

// ── Withdraw funds ────────────────────────────────────────────────────────
export const withdrawFunds = async (
  userId,
  contact,
  { name, email, accountNumber, ifsc },
) => {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet)
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WALLET_NOT_FOUND,
    );
  if (!wallet.isWithdrawable)
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WITHDRAWAL_NOT_ENABLED,
    );
  if (wallet.balance <= 0)
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INSUFFICIENT_BALANCE,
    );
  if (wallet.withdrawalInProgress)
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WITHDRAWAL_IN_PROGRESS,
    );

  const amount = wallet.balance;

  // ── Lock ────────────────────────────────────────────────────────────────
  await Wallet.updateOne({ _id: wallet._id }, { withdrawalInProgress: true });

  // ── Debit ───────────────────────────────────────────────────────────────
  const session = await mongoose.startSession();
  session.startTransaction();
  let transaction;

  try {
    transaction = await debitWallet({
      userId,
      amount,
      type: TRANSACTION_TYPES.WITHDRAWAL,
      status: TRANSACTION_STATUS.PENDING,
      accountIdentifier: `****${accountNumber.slice(-4)}`,
      note: `Withdrawal to bank account ****${accountNumber.slice(-4)}`,
      session,
    });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    // Debit failed — nothing was charged, just release lock and throw
    await Wallet.updateOne(
      { _id: wallet._id },
      { withdrawalInProgress: false },
    );
    throw err;
  } finally {
    session.endSession();
  }

  // ── Payout ──────────────────────────────────────────────────────────────
  // Debit is committed at this point — must handle all failures from here manually
  try {
    const payout = await initiateRazorpayPayout({
      userId,
      name,
      email,
      accountNumber,
      ifsc,
      amount,
      transactionId: transaction._id,
      contact,
    });

    await WalletTransaction.updateOne(
      { _id: transaction._id },
      {
        "payout.gatewayRef": payout.id,
        "payout.processedAt": new Date(),
      },
    );

    await Wallet.updateOne(
      { _id: wallet._id },
      { withdrawalInProgress: false },
    );

    return { success: true, payoutId: payout.id, amount };
  } catch (err) {
    // Razorpay failed — balance already debited, must refund
    console.error("[WALLET] Payout failed, initiating refund", {
      userId,
      amount,
      transactionId: transaction._id,
      error: err.message,
    });

    const refundSession = await mongoose.startSession();
    refundSession.startTransaction();

    try {
      await creditWallet({
        userId,
        amount,
        type: TRANSACTION_TYPES.REFUND,
        note: "Refund: payout initiation failed",
        session: refundSession,
      });

      await WalletTransaction.updateOne(
        { _id: transaction._id },
        { status: TRANSACTION_STATUS.FAILED },
        { session: refundSession },
      );

      await refundSession.commitTransaction();
    } catch (refundErr) {
      await refundSession.abortTransaction();
      // CRITICAL — needs manual fix, log everything
      console.error(
        "[WALLET] CRITICAL: Refund failed, manual intervention required",
        {
          userId,
          amount,
          transactionId: transaction._id,
          error: refundErr.message,
        },
      );
    } finally {
      refundSession.endSession();
    }

    await Wallet.updateOne(
      { _id: wallet._id },
      { withdrawalInProgress: false },
    );
    throw err; // let global handler return error response to user
  }
};
