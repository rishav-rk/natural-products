import razorpay from "../../config/razorpay.js";
import {
  ERROR_MESSAGES,
  ORDER_STATUS,
  STATUS_CODES,
} from "../../config/appConstants.js";
import crypto from "crypto";
import { ADC, Product, Order, User } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import moment from "moment";

const calculateGrandTotal = async (products) => {
  const { tax } = await ADC.findOne({}).lean();

  const itemTotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return parseFloat(
    (itemTotal + (parseFloat(tax) / 100) * itemTotal).toFixed(2),
  );
};

export const createOrder = async (orderData, token) => {
  try {
    const user = await User.findById(
      token.user._id,
      { cart: 1 },
      { lean: true },
    );

    const cart = user.cart;

    if (!cart || cart.products.length === 0) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        "Cannot place order, Cart is empty",
      );
    }

    if (!cart?.deliveryAddress) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        ERROR_MESSAGES.ADDRESS_REQUIRED,
      );
    }

    const productIds = cart.products.map((p) => p.product);
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

    const productPriceMap = {};
    dbProducts.forEach((product) => {
      productPriceMap[product._id] = product.price;
    });

    const updatedProducts = cart.products.map((cartItem) => ({
      ...cartItem,
      price: productPriceMap[cartItem.product],
    }));

    const amount = await calculateGrandTotal(updatedProducts);

    console.log("Amount to be paid: ", amount);

    // ? check for shiprocket service availability


    let razorpayOrder = null;
      razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

    return {
      success: true,
      razorpayOrder: razorpayOrder
        ? {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
          }
        : null,
    };
  } catch (error) {
    throw new OperationalError(STATUS_CODES.ACTION_FAILED, error.message);
  }
};
