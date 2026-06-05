import mongoose from "mongoose";
import { PAYMENT_STATUS, WALLET_TRANSAC_TYPE } from "../config/appConstants.js";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user for transaction"],
    },
    type: {
      type: String,
      enum: [...Object.values(WALLET_TRANSAC_TYPE)],
      required: [true, "Please specify transaction type"],
    },
    amount: {
      type: Number,
      required: [true, "Please provide amount"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: [...Object.values(PAYMENT_STATUS)],
      default: "pending",
    },
    balanceBefore: {
      type: Number,
      default: 0,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["bank", "wallet", "card", "upi", "crypto"],
      default: null,
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;