import mongoose from "mongoose";

const { Schema, model } = mongoose;
const {
  Types: { ObjectId },
} = Schema;

// ── Schema ────────────────────────────────────────────────────────────────

const referralTransactionSchema = new Schema(
  {
    // Which referral code earned this credit
    referral: {
      type: ObjectId,
      ref: "Referral",
      required: [true, "Please provide referral id"],
    },

    // The user who used a code (triggering this earning)
    paidBy: {
      type: ObjectId,
      ref: "User",
      required: [true, "Please provide paidBy user id"],
    },

    // Denormalised for display — avoids joins on every tree render
    paidByUsername: { type: String, default: null },
    paidByImage: { type: String, default: null },

    paidOn: { type: Date, default: Date.now },

    codeUsed: {
      type: String,
      default: null,
    },

    amount: {
      type: Number,
      required: [true, "Please provide amount"],
      min: [0, "Amount cannot be negative"],
    },

    // 1 = direct referral, 2–4 = ancestor levels
    level: {
      type: Number,
      required: [true, "Please provide level"],
      min: 1,
      max: 4,
    },

    // The user who originally made the referral at level 1.
    // null for L1 transactions, set for L2–L4 so the tree
    // can group children under the correct parent node.
    parent: { type: ObjectId, ref: "User", default: null },
  },
  { timestamps: false }, // paidOn already serves as the timestamp
);

// ── Indexes ───────────────────────────────────────────────────────────────

// Primary: fetch all transactions for a referral code, newest first
referralTransactionSchema.index({ referral: 1, paidOn: -1 });

// Covers both getReferralById (level filter) and getNextLevel (level + parent filter)
// as a compound index serves its own prefix queries — no need for { referral, level } separately
referralTransactionSchema.index({ referral: 1, level: 1, parent: 1 });

// ── Model ─────────────────────────────────────────────────────────────────

const ReferralTransaction = model(
  "ReferralTransaction",
  referralTransactionSchema,
);

export default ReferralTransaction;
