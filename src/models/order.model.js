import mongoose from "mongoose";
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
} from "../config/appConstants.js";


const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, "Please provide order ID"],
    },
    placedOn: {
      type: Date,
      default: Date.now,
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
          required: [true, "Product id is required"],
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
    itemTotal: {
      type: String, 
      required: [true, 'Please provide item total']
    },
    tax: {
      type: String,
    },
    grandTotalAmount: {
      type: String,
      required: [true, "Please provide total amount"],
    },
    shippingAddress: {
      type: Object,
    },
    status: {
      type: String,
      enum: [...Object.values(ORDER_STATUS)],
      default: ORDER_STATUS.INPROGRESS,
    },
    payment: {
      razorpayOrderId: {
        type: String,
        required: [true, "Razorpay order ID is required"],
      },
      razorpayPaymentId: {
        type: String,
        default: null,
      },
      razorpaySignature: {
        type: String,
        default: null,
      },
      status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
      },
      amount: {
        type: String,
        required: [true, "Payment amount is required"],
      },
      currency: {
        type: String,
        default: "INR",
      },
      paidAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true },
);

orderSchema.index({"orderId": 1})

const Order = mongoose.model("Order", orderSchema);
export default Order;
