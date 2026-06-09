// walletTransaction.model.js
import mongoose from "mongoose";
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from "../config/appConstants.js";

const { Schema, model } = mongoose;
const { Types: { ObjectId } } = Schema;

const walletTransactionSchema = new Schema(
  {
    wallet: {
      type:     ObjectId,
      ref:      "Wallet",
      required: true,
    },
    user: {
      type:     ObjectId,
      ref:      "User",
      required: true,
    },
    type: {
      type:     String,
      enum:     Object.values(TRANSACTION_TYPES),
      required: true,
    },
    status: {
      type:    String,
      enum:    Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.SUCCESS,
    },
    amount: {
      type:     Number,
      required: true,
      min:      [0.01, "Amount must be greater than 0"],
    },
    balanceBefore: {
      type:     Number,
      required: true,
    },
    balanceAfter: {
      type:     Number,
      required: true,
    },

    // ── Referral context ──────────────────────────────────────────────────
    referral: {
      type:    ObjectId,
      ref:     "Referral",
      default: null,
    },
    level: {
      type:    Number,
      default: null, // null for bonus/withdrawal, 1–4 for referral credits
      min:     1,
      max:     4,
    },

    // Who triggered this earning (the user who made the purchase)
    paidBy: {
      type:    ObjectId,
      ref:     "User",
      default: null,
    },
    paidByUsername: {
      type:    String,
      default: null, // denormalized — shown directly in UI, no populate needed
    },

    // Order reference shown in UI as #12345678
    orderRef: {
      type:    String,
      default: null,
    },

    // ── Withdrawal context (future payout support) ────────────────────────
    payout: {
      method:            { type: String, default: null }, // "upi" | "bank"
      accountIdentifier: { type: String, default: null }, // UPI ID or account no.
      gatewayRef:        { type: String, default: null }, // payment gateway txn ID
      processedAt:       { type: Date,   default: null },
    },

    note: { type: String, default: null },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────────────

// Primary: paginated history for a user, newest first
walletTransactionSchema.index({ user: 1, createdAt: -1 });

// Level + date filter (earnings screen)
walletTransactionSchema.index({ user: 1, level: 1, createdAt: -1 });

// Admin: find pending withdrawals
walletTransactionSchema.index({ type: 1, status: 1 });

// ── Model ─────────────────────────────────────────────────────────────────

export { TRANSACTION_TYPES, TRANSACTION_STATUS };
const WalletTransaction = model("WalletTransaction", walletTransactionSchema);
export default WalletTransaction;