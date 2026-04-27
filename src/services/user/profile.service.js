import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { User, Product, ADC } from "../../models/index.js";

const recalculateCharges = async (cart) => {
  const { handlingCharge, shippingFee, tax } = await ADC.findOne({}).lean();

  const itemTotal = cart.products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  // ✅ parseFloat wrapping toFixed so values stay Numbers, not Strings
  cart.handlingCharge = parseFloat(parseFloat(handlingCharge).toFixed(2));
  cart.shippingFee    = parseFloat(parseFloat(shippingFee).toFixed(2));
  cart.tax            = parseFloat(parseFloat(tax).toFixed(2));
};

const validateStock = (dbProduct, requestedQty, currentCartQty = 0) => {
  const totalRequested = requestedQty + currentCartQty;
  if (totalRequested > dbProduct.stock) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      `Only ${dbProduct.stock} unit(s) available for "${dbProduct.name}", you already have ${currentCartQty} in your cart`
    );
  }
};

export const addToCart = async (cartData, token) => {
  const { products } = cartData;

  const productIds = products.map((p) => p.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds } , isDeleted : false}).lean();

  if (dbProducts.length !== productIds.length) {
    throw new OperationalError(STATUS_CODES.ACTION_FAILED, ERROR_MESSAGES.NO_SUCH_PRODUCT);
  }

  const priceMap   = {};
  const productMap = {};
  dbProducts.forEach((p) => {
    priceMap[p._id.toString()]   = p.price;
    productMap[p._id.toString()] = p;
  });

  const user = await User.findById(token.user._id);
  if (!user) throw new OperationalError(STATUS_CODES.ACTION_FAILED, ERROR_MESSAGES.USER_NOT_FOUND);

  for (const incoming of products) {
    const dbProduct = productMap[incoming.productId];
    const existing  = user.cart.products.find(
      (p) => p.product.toString() === incoming.productId
    );

    validateStock(dbProduct, incoming.quantity, existing?.quantity ?? 0);

    if (existing) {
      existing.quantity += incoming.quantity;
    } else {
      user.cart.products.push({
        product:  incoming.productId,
        quantity: incoming.quantity,
        price:    priceMap[incoming.productId],
      });
    }
  }

  await recalculateCharges(user.cart);

  // ✅ Bug 3 fixed — store _id not full object
  if (!user.cart?.deliveryAddress) {
    user.cart.deliveryAddress = user.addresses.length ? user.addresses[0]._id : null;
  }

  await user.save();
  return populateCart(user);
};

export const getCart = async (token) => {
  const user = await User.findById(token.user._id)
    .populate("cart.products.product")
    .lean();

  if (!user) throw new OperationalError(STATUS_CODES.ACTION_FAILED, ERROR_MESSAGES.USER_NOT_FOUND);

  const cart = user.cart;
  if (!cart) throw new OperationalError(STATUS_CODES.ACTION_FAILED, "Cart is empty");

  if (cart?.deliveryAddress) {
    cart.selectedAddress = user.addresses.find(
      (a) => a._id.toString() === cart.deliveryAddress.toString()
    );
  }

  // ✅ Bug 4 fixed — parse charges back to Number before adding
  cart.grandTotal = parseFloat((
    cart.products.reduce((sum, p) => sum + p.price * p.quantity, 0) +
    parseFloat(cart.handlingCharge) +
    parseFloat(cart.shippingFee) +
    parseFloat(cart.tax)
  ).toFixed(2));

  return cart;
};

export const updateCart = async (cartData, token) => {
  const { products, addressId } = cartData;

  const user = await User.findById(token.user._id);
  if (!user) throw new OperationalError(STATUS_CODES.ACTION_FAILED, ERROR_MESSAGES.USER_NOT_FOUND);

  if (products) {
    const productIds = products.map((p) => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } , isDeleted: false}).lean();
    const productMap = {};
    dbProducts.forEach((p) => (productMap[p._id.toString()] = p));

    for (const incoming of products) {
      const idx = user.cart.products.findIndex(
        (p) => p.product.toString() === incoming.productId
      );

      if (idx === -1) continue;

      if (incoming.quantity === 0) {
        user.cart.products.splice(idx, 1);
      } else {
        const dbProduct = productMap[incoming.productId];
        validateStock(dbProduct, incoming.quantity);
        user.cart.products[idx].quantity = incoming.quantity;
      }
    }
  }

  if (addressId) {
    const addressExists = user.addresses.id(addressId);
    if (!addressExists) {
      throw new OperationalError(STATUS_CODES.ACTION_FAILED, "Address not found");
    }
    // ✅ Bug 2 fixed — store _id not full object
    user.cart.deliveryAddress = addressExists._id;
  }

  await recalculateCharges(user.cart);
  await user.save();
  return populateCart(user);
};

export const deleteFromCart = async (productId, token) => {
  const user = await User.findById(token.user._id);
  if (!user) throw new OperationalError(STATUS_CODES.ACTION_FAILED, ERROR_MESSAGES.USER_NOT_FOUND);

  const before = user.cart.products.length;
  user.cart.products = user.cart.products.filter(
    (p) => p.product.toString() !== productId
  );

  if (user.cart.products.length === before) {
    throw new OperationalError(STATUS_CODES.ACTION_FAILED, "Product not in cart");
  }

  await recalculateCharges(user.cart);
  await user.save();
  return populateCart(user);
};

export const clearCart = async (token) => {
  const user = await User.findById(token.user._id);
  if (!user) throw new OperationalError(STATUS_CODES.ACTION_FAILED, ERROR_MESSAGES.USER_NOT_FOUND);

  user.cart.products        = [];
  user.cart.deliveryAddress = null;
  user.cart.handlingCharge  = 0;
  user.cart.shippingFee     = 0;
  user.cart.tax             = 0;

  await user.save();
  return { message: "Cart cleared" };
};

const populateCart = (user) => {
  return user.populate("cart.products.product").then((u) => u.cart);
};