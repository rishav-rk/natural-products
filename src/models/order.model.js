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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user reference"],
    },
    referral: {
      codeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Referral",
        default: null,
      },
      code: { type: String, default: null },
      referralUserName: { type: String, default: null },
      referralUserImage: { type: String, default: null },
      isActivated: { type: Boolean, default: false },
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product id is required"],
        },
        images: [
          {
            type: String,
          },
        ],
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
        weight: {
          type: Number,
          required: [true, "Please provide product weight"],
        },
      },
    ],
    itemTotal: {
      type: String,
      required: [true, "Please provide item total"],
    },
    tax: {
      type: String,
    },
    shippingFee: {
      type: String,
      default: "100.00",
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
    userName: {
      type: String,
    },
    userPhone: {
      type: String,
    },
    shipment: {
      waybillNumber: String,
      courierName: String,
      warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
      },
      status: String,

      deliveredAt: Date,

      trackingEvents: [
        {
          status: String,
          location: String,
          timestamp: Date,
        },
      ],
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
      method: {
        type: String,
        enum: Object.values(PAYMENT_METHOD),
        default: PAYMENT_METHOD.UPI,
      },
    },
  },
  { timestamps: true },
);

orderSchema.index({ paidAt: 1 });
orderSchema.index({ "shipment.waybillNumber": 1 });

orderSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 3600,
    partialFilterExpression: { "payment.status": PAYMENT_STATUS.PENDING },
  },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
