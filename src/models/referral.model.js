import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
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
      }
    },
  ],
});

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
