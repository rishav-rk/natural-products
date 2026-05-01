import razorpay from "../../config/razorpay.js";
import crypto from "crypto";
import {
  ERROR_MESSAGES,
  ORDER_STATUS,
  STATUS_CODES,
} from "../../config/appConstants.js";
import { ADC, Product, Order, User } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import moment from "moment";
import config from "../../config/config.js";

const calculateGrandTotal = async (products, tax) => {
  const itemTotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return parseFloat(
    (itemTotal + (parseFloat(tax) / 100) * itemTotal).toFixed(2),
  );
};

const generateOrderId = (name) => {
  const userSubstr = name.slice(0, 4).toUpperCase();
  return userSubstr.length === 4
    ? `${userSubstr}-${Math.floor(Math.random() * 1000000)}`
    : userSubstr.padEnd(4, "0");
};

export const createOrder = async (orderData, token) => {
    // Fetch user data
    const user = await User.findById(
      token.user._id,
      { cart: 1, addresses: 1 , name : 1},
      { lean: true }
    );

    const cart = user.cart;

    // Validate cart exists
    if (!cart || cart.products.length === 0) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        "Cannot place order, Cart is empty"
      );
    }

    // Validate delivery address
    if (!cart?.deliveryAddress) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        ERROR_MESSAGES.ADDRESS_REQUIRED
      );
    }

    const shippingAddress = user.addresses.find(
      (a) => a._id.toString() === cart.deliveryAddress.toString()
    );

    // Fetch tax and product details
    const { tax } = await ADC.findOne({}).lean();
    const productIds = cart.products.map((p) => p.product);
    const dbProducts = await Product.find({
      _id: { $in: productIds },
      isDeleted: false,
    }).lean();

    if (dbProducts.length !== productIds.length) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        ERROR_MESSAGES.NO_SUCH_PRODUCT
      );
    }

    // Build product price map
    const productPriceMap = {};
    dbProducts.forEach((product) => {
      productPriceMap[product._id] = {
        price: product.price,
        name: product.name,
      };
    });

    // Update cart products with actual prices
    const updatedProducts = cart.products.map((cartItem) => ({
      ...cartItem,
      price: productPriceMap[cartItem.product].price,
      name: productPriceMap[cartItem.product].name,
    }));

    // Calculate total amount
    const amount = await calculateGrandTotal(updatedProducts, tax);

    // Generate unique order ID
    const orderId = generateOrderId(user.name);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Save order to database
    await Order.create({
      orderId,
      placedOn: moment().toISOString(),
      user: token.user._id,
      products: updatedProducts,
      tax,
      grandTotalAmount: amount,
      shippingAddress,
      payment: {
        razorpayOrderId: razorpayOrder.id,
        status: PAYMENT_STATUS.PENDING,
        amount,
        currency: "INR",
      },
    });

    return {
      razorpayOrder,
    }
}

export const verifyPayment = async (paymentInfo, token) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentInfo;
  console.log(razorpayOrderId, razorpayPaymentId, razorpaySignature);

  const body = razorpayOrderId + "|" + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac("sha256", config.razorypay.secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INVALID_SIGNATURE,
    );
  }

  // ? update order details in database & empty the cart

  return { message: "Payment verified" };
};
