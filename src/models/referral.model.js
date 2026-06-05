import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user for referral code"],
    },
    code: {
      type: String,
      required: [true, "Please provide referral code"],
      unique: true,
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
    maxUses: {
      type: Number,
      default: 10,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    l1: {
      earnings: { type: Number, default: 0 },
      referrals: { type: Number, default: 0 },
    },
    l2: {
      earnings: { type: Number, default: 0 },
      referrals: { type: Number, default: 0 },
    },
    l3: {
      earnings: { type: Number, default: 0 },
      referrals: { type: Number, default: 0 },
    },
    l4: {
      earnings: { type: Number, default: 0 },
      referrals: { type: Number, default: 0 },
    },
    hasUsedItsOwnCode: {
      type: Boolean,
      default: false,
    },
    byAdmin: {
      type: Boolean,
      default: false,
    },
    transactions: [
      {
        paidBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        paidByUsername: {
          type: String,
        },
        paidByImage: {
          type: String,
        },
        paidOn: {
          type: Date,
          default: Date.now,
        },
        amount: {
          type: Number,
          required: [true, "Please provide amount for referral transaction"],
        },
        level: {
          type: Number,
          required: [true, "Please provide level for referral transaction"],
        },
      },
    ],
  },
  { timestamps: true },
);

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
