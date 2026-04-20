import mongoose from "mongoose";

import {
  TOKEN_TYPE,
  DEVICE_TYPE,
  USER_TYPE,
} from "../config/appConstants.js";

const tokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true },
    user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    admin: { type: mongoose.SchemaTypes.ObjectId, ref: "Admin" },

    role: { type: String, enum: [...Object.values(USER_TYPE)], required: true },
    type: {
      type: String,
      enum: [...Object.values(TOKEN_TYPE)],
      required: true,
    },
    expires: { type: Date, required: true },
    device: {
      type: {
        type: String,
        enum: [...Object.values(DEVICE_TYPE)],
      },
      token: { type: String },
      id: { type: String },
    },
    otp: {
      code: { type: Number },
      expiresAt: {
        type: Date,
      },
    },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

tokenSchema.index({ isDeleted: 1 });
tokenSchema.index({ "device.type": 1, isDeleted: 1 });

const Token = mongoose.model("Token", tokenSchema);

export default Token;
