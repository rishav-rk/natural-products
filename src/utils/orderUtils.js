import { OperationalError } from "./error.js";
import { STATUS_CODES, ERROR_MESSAGES } from "../config/appConstants.js";
const calculateGrandTotal = (products, tax, shippingFee) => {
  const itemTotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const taxAmount = (itemTotal * tax) / 100;
  let grandTotalAmount = itemTotal + taxAmount;

  grandTotalAmount += parseFloat(shippingFee)
  grandTotalAmount = grandTotalAmount.toFixed(2)
  // const grandTotalInCents = Math.round(grandTotalWithShipping * 100); // ✓ safe integer

  

  return {
    itemTotal,
    grandTotalAmount
  };
};

// Generate unique order ID based on user name
const generateOrderId = (name) => {
  const prefix = (name || "USER")
    .replace(/\s+/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "0");

  const time = new Date();
  const datePart = time.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD

  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prefix}-${datePart}-${random}`;
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

  if (!shippingAddress) {
    cart.deliveryAddress = null;
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ADDRESS_REQUIRED,
    );
    cart.deliveryAddress = null;
  }

  return shippingAddress;
};

// Update cart products with actual prices from database
const updateProductsWithPrices = (cartProducts, productMap) => {
  return cartProducts.map((cartItem) => ({
    ...cartItem,
    price: productMap[cartItem.product].price,
    name: productMap[cartItem.product].name,
    images: productMap[cartItem.product].images,
    weight: productMap[cartItem.product].weight,
  }));
};

const orderFilter = {
  "payment.razorpayOrderId": 0,
  "payment.razorpayPaymentId": 0,
  "payment.razorpaySignature": 0,
};

export {
  generateOrderId,
  calculateGrandTotal,
  validateAndGetCart,
  updateProductsWithPrices,
  orderFilter,
};
