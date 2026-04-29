import razorpay from "../../config/razorpay.js";
import { ORDER_STATUS, STATUS_CODES } from "../../config/appConstants.js";
import crypto from "crypto";
import Order from "../../models/index.js";
import { ADC, Product } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";

export const createOrder = async (orderData, token) => {
  try {
  const userId = token.user._id; // from auth middleware

  const cart = user

 const productIds = products.map((p) => p.productId);
  const dbProducts = await Product.find({
    _id: { $in: productIds },
    isDeleted: false,
  }).lean();

  if (dbProducts.length !== productIds.length) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_PRODUCT,
    );
  }

    let razorpayOrder = null;
    if (paymentMethod !== "cod") {
      razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(totalAmount * 100), // paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
    } else {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        "COD Not accepted",
      );
    }

    // Save order in DB
    const order = await Order.create({
      orderId: razorpayOrder ? razorpayOrder.id : `COD-${Date.now()}`,
      user: userId,
      products,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      status: ORDER_STATUS.PENDING,
    });

    res.status(201).json({
      success: true,
      order,
      // Send these to frontend for Razorpay checkout
      razorpayOrder: razorpayOrder
        ? {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
