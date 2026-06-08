// import mongoose from "mongoose";

// const referralSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default : null
//     },
//     code: {
//       type: String,
//       required: [true, "Please provide referral code"],
//       unique: true,
//     },
//     isActive: {
//       type: Boolean,
//       default: true
//     },
//     admin: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Admin",
//       default : null
//     },
//     timesUsed: {
//       type: Number,
//       default: 0,
//     },
//     maxUses: {
//       type: Number,
//       default: 10,
//     },
//     parent: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//     l1: {
//       earnings: { type: Number, default: 0 },
//       referrals: { type: Number, default: 0 },
//     },
//     l2: {
//       earnings: { type: Number, default: 0 },
//       referrals: { type: Number, default: 0 },
//     },
//     l3: {
//       earnings: { type: Number, default: 0 },
//       referrals: { type: Number, default: 0 },
//     },
//     l4: {
//       earnings: { type: Number, default: 0 },
//       referrals: { type: Number, default: 0 },
//     },
//     hasUsedItsOwnCode: {
//       type: Boolean,
//       default: false,
//     },
//     byAdmin: {
//       type: Boolean,
//       default: false,
//     },
//     transactions: [
//       {
//         paidBy: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//         },
//         paidByUsername: {
//           type: String,
//         },
//         paidByImage: {
//           type: String,
//         },
//         paidOn: {
//           type: Date,
//           default: Date.now,
//         },
//         amount: {
//           type: Number,
//           required: [true, "Please provide amount for referral transaction"],
//         },
//         level: {
//           type: Number,
//           required: [true, "Please provide level for referral transaction"],
//         },
//         parent: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User"
//         }
//       },
//     ],
//   },
//   { timestamps: true },
// );

// const Referral = mongoose.model("Referral", referralSchema);

// export default Referral;

import mongoose from "mongoose";
import { REFERRAL_CONSTANTS } from "../config/appConstants.js ";

const { Schema, model } = mongoose;
const {
  Types: { ObjectId },
} = Schema;

// ── Reusable sub-schema for per-level stats ───────────────────────────────

const levelStatsSchema = new Schema(
  {
    earnings: { type: Number, default: 0 },
    referrals: { type: Number, default: 0 },
  },
  { _id: false },
);

// ── Helper: generate l1–l4 fields without repetition ─────────────────────

function buildLevelFields(count = 4) {
  const fields = {};
  for (let i = 1; i <= count; i++) {
    fields[`l${i}`] = { type: levelStatsSchema, default: () => ({}) };
  }
  return fields;
}

// ── Main schema ───────────────────────────────────────────────────────────

const referralSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", default: null },
    admin: { type: ObjectId, ref: "Admin", default: null },

    code: {
      type: String,
      required: [true, "Please provide referral code"],
      unique: true,
    },

    isActive: { type: Boolean, default: true },
    byAdmin: { type: Boolean, default: false },

    timesUsed: { type: Number, default: 0 },
    maxUses: {
      type: Number,
      default: REFERRAL_CONSTANTS.MAX_USES,
    },

    // Points to the Referral doc of whoever referred this user.
    // Used to walk the ancestor chain via $graphLookup.
    parent: { type: ObjectId, ref: "Referral", default: null },

    ...buildLevelFields(4),

    hasUsedItsOwnCode: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ── Indexes ───────────────────────────────────────────────────────────────

// `code` is already indexed via unique: true
referralSchema.index({ user: 1 });
referralSchema.index({ parent: 1 }); // speeds up $graphLookup

// ── Model ─────────────────────────────────────────────────────────────────

const Referral = model("Referral", referralSchema);

export default Referral;
