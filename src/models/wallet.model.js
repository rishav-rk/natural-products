// wallet.model.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;
const {
  Types: { ObjectId },
} = Schema;

const walletSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
      unique: true, // one wallet per user
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    lifetimeEarnings: {
      type: Number,
      default: 0, // never decrements — useful for analytics
    },
    currency: {
      type: String,
      default: "INR",
    },
    isWithdrawable: {
      type: Boolean,
      default: false, // flip to true when you enable payouts
    },
    withdrawalInProgress: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

walletSchema.index({ user: 1 });

const Wallet = model("Wallet", walletSchema);
export default Wallet;
