import razorpay from "../../config/razorpay.js";
import crypto from "crypto";
import {
  ERROR_MESSAGES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  STATUS_CODES,
} from "../../config/appConstants.js";
import { ADC, Product, Order, User } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import moment from "moment";
import config from "../../config/config.js";
import { paginationOptions } from "../../utils/universalFunctions.js";
import {
  generateOrderId,
  calculateGrandTotal,
  validateAndGetCart,
  clearUserCart,
  updateProductsWithPrices,
  orderFilter,
} from "../../utils/orderUtils.js";

// Fetch and validate products, build price map
const getProductsWithPrices = async (productIds) => {
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
    productPriceMap[product._id] = {
      price: product.price,
      name: product.name,
    };
  });

  return productPriceMap;
};

export const createOrder = async (orderData, token) => {
  try {
    // Fetch user data
    const user = await User.findById(
      token.user._id,
      { cart: 1, addresses: 1, name: 1 },
      { lean: true },
    );

    // Validate cart
    await validateAndGetCart(user, user.cart);

    // Fetch tax
    const { tax } = await ADC.findOne({}).lean();

    // Get products with prices
    const productIds = user.cart.products.map((p) => p.product);
    const priceMap = await getProductsWithPrices(productIds);

    // Update products with actual prices
    const updatedProducts = updateProductsWithPrices(
      user.cart.products,
      priceMap,
    );

    // Calculate total amount
    const { itemTotal, grandTotalAmount } = calculateGrandTotal(
      updatedProducts,
      tax,
    );

    console.log(grandTotalAmount * 100);
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: grandTotalAmount * 100, // paise
      currency: "INR",
      receipt: generateOrderId(user.name),
    });

    console.log(razorpayOrder);

    return {
      razorpayOrder,
    };
  } catch (error) {
    throw error;
  }
};

// ? update this -> when payment is done , received acknowledgement from razorpay's webhook then the verification step is to be done.
export const verifyPayment = async (paymentInfo, token) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentInfo;

  // Verify signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", config.razorypay.secret)
    .update(body)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(razorpaySignature)
  );

  console.log(isValid);

  if (!isValid) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INVALID_SIGNATURE,
    );
  }

  // Fetch user data
  const user = await User.findById(
    token.user._id,
    { cart: 1, addresses: 1, name: 1 },
    { lean: true },
  );

  // Validate cart
  const shippingAddress = await validateAndGetCart(user, user.cart);

  // Fetch tax
  const { tax } = await ADC.findOne({}).lean();

  // Get products with prices
  const productIds = user.cart.products.map((p) => p.product);
  const priceMap = await getProductsWithPrices(productIds);

  // Update products with actual prices
  const updatedProducts = updateProductsWithPrices(
    user.cart.products,
    priceMap,
  );

  // Calculate total amount
  const { grandTotalAmount, itemTotal } = calculateGrandTotal(
    updatedProducts,
    tax,
  );

  // Create order in database
  const order = await Order.create({
    orderId: generateOrderId(user.name),
    placedOn: moment().toISOString(),
    user: token.user._id,
    products: updatedProducts,
    tax,
    itemTotal,
    grandTotalAmount,
    shippingAddress,
    payment: {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: PAYMENT_STATUS.COMPLETED,
      amount: grandTotalAmount,
      currency: "INR",
      paidAt: moment().toISOString(),
    },
  });

  // Update product stock using bulkWrite for efficiency
  const bulkOps = updatedProducts.map((product) => ({
    updateOne: {
      filter: { _id: product.product },
      update: { $inc: { stock: -product.quantity } },
    },
  }));
  await Product.bulkWrite(bulkOps);

  // Clear user cart after successful payment
  await clearUserCart(user._id);

  // TODO: Send order confirmation email

  return { message: "Payment verified" };
};

export const getMyOrders = async (token, query) => {
  return await Order.find(
    { user: token.user._id },
    orderFilter,
    paginationOptions(query.page, query.limit),
  );
};

export const getMyOrderById = async (orderId) => {
  const order = await Order.findOne({ _id: orderId }, orderFilter);
  if (!order) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_ORDER,
    );
  }

  return order;
};
// ! implement webhook based payment on production environemnt
// export const updateOrderAndProduct = async (req) => {
//   const signature = req.headers["x-razorpay-signature"];
//   const secret = config.razorypay.webhookSecret;

//   // Verify the webhook came from Razorpay
//   const expected = crypto
//     .createHmac("sha256", secret)
//     .update(req.body) // req.body is raw Buffer here
//     .digest("hex");

//   if (expected !== signature) {
//     return res.status(400).json({ error: "Invalid webhook" });
//   }

//   const event = JSON.parse(req.body.toString());

//   switch (event.event) {
//     case "payment.captured":
//       // Payment successful — fulfill order
//       console.log("Payment captured:", event.payload.payment.entity.id);
//       break;

//     case "payment.failed":
//       // Notify user, don't fulfill
//       console.log("Payment failed:", event.payload.payment.entity.id);
//       break;

//     default:
//       console.log("Unhandled event:", event.event);
//   }
// };
