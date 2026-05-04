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

// Calculate grand total with tax
const calculateGrandTotal = (products, tax) => {
  const itemTotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  return {
    itemTotal,
    grandTotalAmount: parseFloat(
      itemTotal + (parseFloat(tax) / 100).toFixed(2) * itemTotal
    ).toFixed(2),
  };
};

// Generate unique order ID based on user name
const generateOrderId = (name) => {
  const userSubstr = name.slice(0, 4).toUpperCase();
  return userSubstr.length === 4
    ? `${userSubstr}-${Math.floor(Math.random() * 1000000)}`
    : userSubstr.padEnd(4, "0");
};

// Validate cart and fetch shipping address
const validateAndGetCart = async (user, cart) => {
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

  const shippingAddress = user.addresses.find(
    (a) => a._id.toString() === cart.deliveryAddress.toString(),
  );

  return shippingAddress;
};

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

// Update cart products with actual prices from database
const updateProductsWithPrices = (cartProducts, priceMap) => {
  return cartProducts.map((cartItem) => ({
    ...cartItem,
    price: priceMap[cartItem.product].price,
    name: priceMap[cartItem.product].name,
  }));
};

// Clear user cart after successful payment
const clearUserCart = async (userId) => {
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "cart.products": [],
        "cart.deliveryAddress": null,
        "cart.tax": 0,
      },
    },
    { new: true },
  );
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
      receipt: `receipt_${Date.now()}`,
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
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      paymentInfo;

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorypay.secret)
      .update(body)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpaySignature),
    );

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

    // Generate order ID
    const orderId = generateOrderId(user.name);

    // Create order in database
    const order = await Order.create({
      orderId,
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
        grandTotalAmount,
        currency: "INR",
        paidAt: moment().toISOString(),
      },
    });

    // Clear user cart after successful payment
    await clearUserCart(token.user._id);

    // TODO: Send order confirmation email

    return { message: "Payment verified" };
  } catch (error) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INVALID_SIGNATURE,
    );
  }
};

export const getMyOrders = async (token, query) => {
  return await Order.find(
    { user: token.user._id },
    { payment: 0 },
    paginationOptions(query.page, query.limit),
  );
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
