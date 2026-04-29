import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from "../config/appConstants.js";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: [true, "Please provide order ID"],
    },
    placedOn: {
        type: Date, 
        default: Date.now
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user reference"],
    },
    referralUser: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    products: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: [true],
        },
        name: {
          type: String,
        },
        quantity: {
          type: Number,
          required: [true, "Please provide quantity"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Please provide product price"],
        },
      },
    ],
    handlingCharge: {
      type: String,
    },
    tax: {
      type: String,
    },
    shippingFee: {
      type: String,

    },
    totalAmount: {
      type: String,
      required: [true, "Please provide total amount"],
    },
    shippingAddress: {
      houseNumberAndFloor: {
        type: String,
        required: [true, "Please provide house number"],
      },
      buildingAndBlock: {
        type: String,
        required: [true, "Please provide building name"],
      },
      landMarkAndArea: {
        type: String,
        required: [true, "Please provide landmark/area"],
      },
      city: {
        type: String,
        required: [true, "Please provide city"],
      },
      state: {
        type: String,
        required: [true, "Please provide state"],
      },
      pincode: {
        type: String,
        required: [true, "Please provide pincode"],
      },
      country: {
        type: String,
        default: "India",
      },
    },
    status: {
      type: String,
      enum: [...Object.values(ORDER_STATUS)],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: [...Object.values(PAYMENT_METHOD)],
    },
    paymentStatus: {
      type: String,
      enum: [...Object.values(PAYMENT_STATUS)],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
