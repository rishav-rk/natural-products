import razorpay from "../../config/razorpay.js";
import crypto from "crypto";
import mongoose from "mongoose";
import {
  ERROR_MESSAGES,
  PAYMENT_STATUS,
  STATUS_CODES,
} from "../../config/appConstants.js";
import { ADC, Product, Order, User } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import config from "../../config/config.js";
import { paginationOptions } from "../../utils/universalFunctions.js";
import {
  generateOrderId,
  calculateGrandTotal,
  validateAndGetCart,
  updateProductsWithPrices,
  orderFilter,
} from "../../utils/orderUtils.js";
import { createDelhiveryShipment } from "../../utils/delivery.js"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getProductsWithPrices = async (productIds) => {
  const dbProducts = await Product.find(
    { _id: { $in: productIds }, isDeleted: false },
    { name: 1, price: 1, images: 1 },
  ).lean();

  if (dbProducts.length !== productIds.length) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_PRODUCT,
    );
  }

  return Object.fromEntries(dbProducts.map((p) => [p._id, p]));
};

const clearUserCart = async (userId, session) => {
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        "cart.products": [],
        "cart.deliveryAddress": null,
        "cart.tax": 0,
      },
    },
    { session },
  );
};

// Hook your mailer here — email failure won't affect the payment response
const sendOrderConfirmationEmail = async (user, order) => {
  // TODO: implement email — e.g. with nodemailer, resend, sendgrid
  // await mailer.send({ to: user.email, template: 'order-confirmation', data: { order } });
  console.log(
    `[EMAIL] Order confirmation for ${user.name}, orderId: ${order.orderId}`,
  );
};

// ─── Create Razorpay Order ────────────────────────────────────────────────────
// Saves a pending Order in DB so verifyPayment doesn't need to refetch everything

// export const createOrder = async (orderData, token) => {
//   const user = await User.findById(
//     token.user._id,
//     { cart: 1, name: 1 },
//     { lean: true },
//   )

//   if (!user.cart.deliveryAddress) {
//     throw new OperationalError(
//       STATUS_CODES.ACTION_FAILED,
//       ERROR_MESSAGES.ADDRESS_REQUIRED,
//     );
//   }

//   const shippingAddress = await validateAndGetCart(user, user.cart);
//   const { tax, shippingFee } = await ADC.findOne({}, {tax : 1, shippingFee : 1}).lean();

//   const productIds = user.cart.products.map((p) => p.product);
//   const productMap = await getProductsWithPrices(productIds);
//   const updatedProducts = updateProductsWithPrices(
//     user.cart.products,
//     productMap,
//   );

//   const { itemTotal, grandTotalAmount } = calculateGrandTotal(
//     updatedProducts,
//     tax,
//     shippingFee
//   );
//   const orderId = generateOrderId(user.name);


//   // Create Razorpay order first to get the razorpayOrderId
//   const razorpayOrder = await razorpay.orders.create({
//     amount: Math.round(grandTotalAmount * 100), // in paise
//     currency: "INR",
//     receipt: orderId,
//   });

//   // Persist as pending — verifyPayment will promote this to completed
//   await Order.create({
//     orderId,
//     placedOn: new Date(),
//     user: token.user._id,
//     products: updatedProducts,
//     tax,
//     itemTotal,
//     grandTotalAmount,
//     shippingAddress,
//     payment: {
//       razorpayOrderId: razorpayOrder.id,
//       status: PAYMENT_STATUS.PENDING,
//       amount: grandTotalAmount,
//       currency: "INR",
//     },
//   });

//   return { razorpayOrder };
// };

export const createOrder = async (orderData, token) => {
  const user = await User.findById(
    token.user._id,
    { cart: 1, name: 1, phoneNumber: 1, addresses: 1 }, 
  ).lean();

  if (!user.cart.deliveryAddress) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ADDRESS_REQUIRED,
    );
  }

  const shippingAddress = await validateAndGetCart(user, user.cart);
  const { tax, shippingFee } = await ADC.findOne({}, { tax: 1, shippingFee: 1 }).lean();

  const productIds = user.cart.products.map((p) => p.product);
  const productMap = await getProductsWithPrices(productIds);
  const updatedProducts = updateProductsWithPrices(user.cart.products, productMap);

  const { itemTotal, grandTotalAmount } = calculateGrandTotal(
    updatedProducts,
    tax,
    shippingFee,
  );
  const orderId = generateOrderId(user.name);

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(grandTotalAmount * 100),
    currency: "INR",
    receipt: orderId,
  });

  await Order.create({
    orderId,
    placedOn: new Date(),
    user: token.user._id,
    userName: user.name,                
    userPhone: user.phoneNumber,        
    products: updatedProducts,
    tax,
    shippingFee,
    itemTotal,
    grandTotalAmount,
    shippingAddress,                    
    payment: {
      razorpayOrderId: razorpayOrder.id,
      status: PAYMENT_STATUS.PENDING,
      amount: grandTotalAmount,
      currency: "INR",
    },
  });

  return { razorpayOrder };
};

// ─── Verify Payment ───────────────────────────────────────────────────────────

export const verifyPayment = async (paymentInfo, token) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    paymentInfo;

  // 1. Idempotency check — handles retries and double submissions
  const alreadyProcessed = await Order.findOne({
    "payment.razorpayPaymentId": razorpay_payment_id,
    "payment.status": PAYMENT_STATUS.COMPLETED,
  }).lean();

  if (alreadyProcessed) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      `Payment already verified, orderdId: ${alreadyProcessed.orderId}`,
    );
  }

  // 2. Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac("sha256", config.razorpay.secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(razorpay_signature),
  );

  if (!isValid) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.INVALID_SIGNATURE,
    );
  }

  // 3. Fetch the pending order saved during createOrder
  const pendingOrder = await Order.findOne({
    "payment.razorpayOrderId": razorpay_order_id,
    user: token.user._id,
    "payment.status": PAYMENT_STATUS.PENDING,
  });

  if (!pendingOrder) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_ORDER,
    );
  }

  const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
  // 4. Atomic transaction: promote order + decrement stock + clear cart
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Promote pending order to completed
    pendingOrder.payment.razorpayPaymentId = razorpay_payment_id;
    pendingOrder.payment.razorpaySignature = razorpay_signature;
    pendingOrder.payment.status = PAYMENT_STATUS.COMPLETED;
    pendingOrder.payment.method = paymentDetails.method;
    pendingOrder.payment.paidAt = new Date(paymentDetails.created_at * 1000);
    await pendingOrder.save({ session });

    // Decrement stock — $gte guard prevents negative stock on race condition
    const bulkOps = pendingOrder.products.map((product) => ({
      updateOne: {
        filter: {
          _id: product.product,
          stock: { $gte: product.quantity },
        },
        update: { $inc: { stock: -product.quantity } },
      },
    }));

    const result = await Product.bulkWrite(bulkOps, { session });

    if (result.modifiedCount !== pendingOrder.products.length) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        ERROR_MESSAGES.OUT_OF_STOCK,
      );
    }

    await clearUserCart(token.user._id, session);

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  // 5. Send confirmation email — non-blocking, failure won't affect response
  const user = await User.findById(token.user._id, {
    name: 1,
    email: 1,
  }).lean();
  sendOrderConfirmationEmail(user, pendingOrder).catch((err) =>
    console.error("[EMAIL] Order confirmation failed:", err),
  );
};

// ─── Order Queries ────────────────────────────────────────────────────────────

export const getMyOrders = async (token, query) => {
  return await Order.find(
    { user: token.user._id, "payment.status" : PAYMENT_STATUS.COMPLETED },
    orderFilter,
    paginationOptions(query.page, query.limit),
  );
};

export const getMyOrderById = async (orderId) => {
  const order = await Order.findOne({ _id: orderId, "payment.status": PAYMENT_STATUS.COMPLETED }, orderFilter);
  if (!order) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_ORDER,
    );
  }
  return order;
};

// ─── Razorpay Webhook (use in production instead of verifyPayment) ────────────
// IMPORTANT: mount this with express.raw(), not express.json()
// app.use('/webhook/razorpay', express.raw({ type: 'application/json' }), webhookHandler)

export const handleRazorpayWebhook = async (req) => {
  // 1. Verify webhook signature
  console.log("processing payment")
  const signature = req.headers["x-razorpay-signature"];

  const expected = crypto
    .createHmac("sha256", config.razorpay.secret)
    .update(req.body) // raw Buffer — express.raw() required
    .digest("hex");

  if (expected !== signature) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      "Invalid webhook signature",
    );
  }

  const event = JSON.parse(req.body.toString());
  const payment = event.payload.payment.entity;

  console.log(event)

  switch (event.event) {
    case "payment.captured":
      await handlePaymentCaptured(payment);
      break;

    case "payment.failed":
      await handlePaymentFailed(payment);
      break;

    default:
      console.log("[WEBHOOK] Unhandled event:", event.event);
  }
};

// const handlePaymentCaptured = async (payment) => {
//   // 1. Idempotency check
//   const alreadyProcessed = await Order.findOne({
//     "payment.razorpayPaymentId": payment.id,
//     "payment.status": PAYMENT_STATUS.COMPLETED,
//   }).lean();

//   if (alreadyProcessed) {
//     console.log("[WEBHOOK] Payment already processed:", payment.id);
//     return;
//   }

//   // 2. Fetch pending order
//   const pendingOrder = await Order.findOne({
//     "payment.razorpayOrderId": payment.order_id,
//     "payment.status": PAYMENT_STATUS.PENDING,
//   });

//   if (!pendingOrder) {
//     console.error("[WEBHOOK] No pending order found for:", payment.order_id);
//     return;
//   }

//   // 3. Atomic transaction — same as verifyPayment
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     pendingOrder.payment.razorpayPaymentId = payment.id;
//     pendingOrder.payment.status = PAYMENT_STATUS.COMPLETED;
//     pendingOrder.payment.method = payment.method;
//     pendingOrder.payment.paidAt = new Date(payment.created_at * 1000);
//     await pendingOrder.save({ session });

//     const bulkOps = pendingOrder.products.map((product) => ({
//       updateOne: {
//         filter: {
//           _id: product.product,
//           stock: { $gte: product.quantity },
//         },
//         update: { $inc: { stock: -product.quantity } },
//       },
//     }));

//     const result = await Product.bulkWrite(bulkOps, { session });

//     if (result.modifiedCount !== pendingOrder.products.length) {
//       throw new OperationalError(
//         STATUS_CODES.ACTION_FAILED,
//         ERROR_MESSAGES.OUT_OF_STOCK,
//       );
//     }

//     await clearUserCart(pendingOrder.user, session);

//     await session.commitTransaction();
//   } catch (err) {
//     await session.abortTransaction();
//     throw err;
//   } finally {
//     session.endSession();
//   }

//   // 4. Send confirmation email — non-blocking
//   const user = await User.findById(pendingOrder.user, { name: 1, email: 1 }).lean();
//   sendOrderConfirmationEmail(user, pendingOrder).catch((err) =>
//     console.error("[EMAIL] Order confirmation failed:", err),
//   );

//   console.log("[WEBHOOK] Payment captured and order fulfilled:", pendingOrder.orderId);
// };

const handlePaymentCaptured = async (payment) => {
  // 1. Idempotency check
  const alreadyProcessed = await Order.findOne({
    "payment.razorpayPaymentId": payment.id,
    "payment.status": PAYMENT_STATUS.COMPLETED,
  }).lean();

  if (alreadyProcessed) {
    console.log("[WEBHOOK] Payment already processed:", payment.id);
    return;
  }

  // 2. Fetch pending order
  const pendingOrder = await Order.findOne({
    "payment.razorpayOrderId": payment.order_id,
    "payment.status": PAYMENT_STATUS.PENDING,
  });

  if (!pendingOrder) {
    console.error("[WEBHOOK] No pending order found for:", payment.order_id);
    return;
  }

  // 3. Atomic transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    pendingOrder.payment.razorpayPaymentId = payment.id;
    pendingOrder.payment.status = PAYMENT_STATUS.COMPLETED;
    pendingOrder.payment.method = payment.method;
    pendingOrder.payment.paidAt = new Date(payment.created_at * 1000);
    await pendingOrder.save({ session });

    const bulkOps = pendingOrder.products.map((product) => ({
      updateOne: {
        filter: {
          _id: product.product,
          stock: { $gte: product.quantity },
        },
        update: { $inc: { stock: -product.quantity } },
      },
    }));

    const result = await Product.bulkWrite(bulkOps, { session });

    if (result.modifiedCount !== pendingOrder.products.length) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        ERROR_MESSAGES.OUT_OF_STOCK,
      );
    }

    await clearUserCart(pendingOrder.user, session);
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  // 4. Find nearest warehouse from address location.coordinates [lng, lat]
  const [longitude, latitude] = pendingOrder.shippingAddress?.location?.coordinates ?? [];

  if (!longitude || !latitude) {
    console.error("[SHIPMENT] Missing coordinates on shippingAddress for order:", pendingOrder.orderId);
  } else {
    const nearestWarehouse = await Warehouse.findOne({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 1500000, 
        },
      },
    }).lean();

    if (!nearestWarehouse) {
      console.error("[SHIPMENT] No warehouse found for order:", pendingOrder.orderId);
    } else {
      // 5. Create Delhivery shipment — non-blocking
      createDelhiveryShipment({ order: pendingOrder, warehouse: nearestWarehouse })
        .then(async (shipment) => {
          await Order.findByIdAndUpdate(pendingOrder._id, {
            "shipment.waybillNumber": shipment.waybillNumber,
            "shipment.courierName":   shipment.courierName,
            "shipment.warehouseId":   nearestWarehouse._id,
            status: ORDER_STATUS.CONFIRMED,
          });
          console.log("[SHIPMENT] Created successfully:", shipment.waybillNumber);
        })
        .catch((err) =>
          console.error("[SHIPMENT] Creation failed for order:", pendingOrder.orderId, err.message)
        );
    }
  }

  // 6. Send confirmation email — non-blocking
  const user = await User.findById(pendingOrder.user, { name: 1, email: 1 }).lean();
  sendOrderConfirmationEmail(user, pendingOrder).catch((err) =>
    console.error("[EMAIL] Order confirmation failed:", err),
  );

  console.log("[WEBHOOK] Payment captured and order fulfilled:", pendingOrder.orderId);
};

const handlePaymentFailed = async (payment) => {
  const order = await Order.findOneAndUpdate(
    {
      "payment.razorpayOrderId": payment.order_id,
      "payment.status": PAYMENT_STATUS.PENDING, // only update if still pending
    },
    { "payment.status": PAYMENT_STATUS.FAILED },
  );

  if (!order) {
    console.error("[WEBHOOK] No pending order found to mark failed:", payment.order_id);
    return;
  }

  console.log("[WEBHOOK] Payment failed, order marked:", order.orderId);
};
