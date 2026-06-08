// walletTransaction.model.js
import mongoose from "mongoose";
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from "../config/appConstants.js";

const { Schema, model } = mongoose;
const { Types: { ObjectId } } = Schema;

const walletTransactionSchema = new Schema(
  {
    wallet: {
      type: ObjectId,
      ref: "Wallet",
      required: true,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true, // denormalized for faster user-level queries
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.SUCCESS,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    balanceBefore: {
      type: Number,
      required: true, // snapshot — critical for debugging & audits
    },
    balanceAfter: {
      type: Number,
      required: true, // snapshot
    },

    // ── Referral context (populated for referral_credit type) ──
    referral: {
      type: ObjectId,
      ref: "Referral",
      default: null,
    },
    referralTransaction: {
      type: ObjectId,
      ref: "ReferralTransaction",
      default: null,
    },
    triggeredBy: {
      type: ObjectId,
      ref: "User",
      default: null, // the user whose referral code was used
    },

    // ── Withdrawal context (for future payout support) ──
    payout: {
      method:            { type: String, default: null }, // "upi" | "bank"
      accountIdentifier: { type: String, default: null }, // UPI ID or account no.
      gatewayRef:        { type: String, default: null }, // payment gateway txn ID
      processedAt:       { type: Date,   default: null },
    },

    note: { type: String, default: null }, // admin notes or reason
  },
  { timestamps: true }
);

// Primary: all transactions for a wallet, newest first
walletTransactionSchema.index({ wallet: 1, createdAt: -1 });

// User-level history
walletTransactionSchema.index({ user: 1, createdAt: -1 });

// Filter by type (e.g. fetch only withdrawals)
walletTransactionSchema.index({ user: 1, type: 1 });

// Admin: find pending withdrawals
walletTransactionSchema.index({ type: 1, status: 1 });

export { TRANSACTION_TYPES, TRANSACTION_STATUS };
const WalletTransaction = model("WalletTransaction", walletTransactionSchema);
export default WalletTransaction;