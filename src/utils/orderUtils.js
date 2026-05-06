import { OperationalError } from "./error.js";
import { STATUS_CODES, ERROR_MESSAGES } from "../config/appConstants.js";
const calculateGrandTotal = (products, tax) => {
  const itemTotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const taxAmount = (itemTotal * tax) / 100;
  const grandTotal = (itemTotal + taxAmount).toFixed(2);
  return {
    itemTotal,
    grandTotal,
  };
};

// Generate unique order ID based on user name
const generateOrderId = (name) => {
  const userSubstr = name.slice(0, 4).toUpperCase();
  return userSubstr.length === 4
    ? `${userSubstr}-${Date.now()}`
    : `${userSubstr.padEnd(4, "0")}-${Date.now()}`;
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

// Update cart products with actual prices from database
const updateProductsWithPrices = (cartProducts, productMap) => {
  return cartProducts.map((cartItem) => ({
    ...cartItem,
    price: productMap[cartItem.product].price,
    name: productMap[cartItem.product].name,
    images: productMap[cartItem.product].images,
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
