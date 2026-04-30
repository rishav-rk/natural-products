import {
  ADDRESS_TYPE,
  ERROR_MESSAGES,
  STATUS_CODES,
} from "../../config/appConstants.js";
import { OperationalError } from "../../utils/error.js";
import { User, Product, ADC } from "../../models/index.js";

// profile
import { deletePreviousToken } from "../token.service.js";
import { successResponse } from "../../utils/response.js";
import bcrypt from "bcrypt";

export const updateProfile = async (profileData, token) => {
  const user = await User.findByIdAndUpdate(token.user._id, profileData, {
    new: true,
  }).lean();
  return user;
};

export const changePassword = async (passwordData, token) => {
  if (!token.user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
  }

  const isMatch = await bcrypt.compare(
    passwordData.currentPassword,
    token.user.password,
  );
  if (!isMatch) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.WRONG_PASSWORD,
    );
  }

  const passwordHash = await bcrypt.hash(passwordData.newPassword, 10);

  await User.findByIdAndUpdate(token.user._id, { password: passwordHash });
};

export const deleteAccount = async (token) => {
  if (!token.user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
  }
  await Promise.all([
    await User.findByIdAndUpdate(token.user._id, { $set: { isDeleted: true } }),
    await deletePreviousToken(token._id),
  ]);
};

export const updateAddress = async (addressData, addressId, token) => {
  const addressFields = [
    "houseNumberAndFloor",
    "buildingAndBlock",
    "landMarkAndArea",
    "pincode",
    "addressLabel",
    "city",
    "state",
    "country",
    "type",
  ];

  const setData = {};

  // Build setData only with provided fields
  addressFields.forEach((field) => {
    if (addressData[field] !== undefined) {
      setData[`addresses.$.${field}`] = addressData[field];
    }
  });

  if (setData["addresses.$.type"] !== ADDRESS_TYPE.OTHER) {
    delete setData[["addresses.$.addressLabel"]];
  }

  // Handle location separately
  if (
    addressData.longitude !== undefined &&
    addressData.latitude !== undefined
  ) {
    setData["addresses.$.location"] = {
      type: "Point",
      coordinates: [addressData.longitude, addressData.latitude],
    };
  }

  const user = await User.findOneAndUpdate(
    { _id: token.user._id, "addresses._id": addressId },
    {
      $set: setData,
    },
    { new: true, lean: true },
  );

  if (!user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ADDRESS_NOT_FOUND,
    );
  }

  return user.addresses;
};

export const addAddress = async (addressData, token) => {
  if (addressData.type !== ADDRESS_TYPE.OTHER) {
    delete addressData.addressLabel;
  }
  const user = await User.findByIdAndUpdate(
    token.user._id,
    {
      $push: { addresses: addressData },
    },
    { new: true },
  ).lean();

  return user.addresses;
};

export const deleteAddress = async (addressId, token) => {
  const user = await User.findOneAndUpdate(
    { _id: token.user._id },
    {
      $pull: { addresses: { _id: addressId } },
    },
    { new: true },
  ).lean();

  if (!user) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.ADDRESS_NOT_FOUND,
    );
  }

  return user.addresses;
};

// cart

const recalculateCharges = async (cart) => {
  const { tax } = await ADC.findOne({}).lean();

  const itemTotal = cart.products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );

  cart.tax = parseFloat(tax).toFixed(2);
  cart.itemTotal = itemTotal;
};

const validateStock = (dbProduct, requestedQty, currentCartQty = 0) => {
  const totalRequested = requestedQty + currentCartQty;
  if (totalRequested > dbProduct.stock) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      `Only ${dbProduct.stock} unit(s) of "${dbProduct.name}" are available. You already have ${currentCartQty} in your cart. You can add ${dbProduct.stock - currentCartQty} more.`,
    );
  }
};

export const addToCart = async (cartData, token) => {
  const { products } = cartData;

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

  const priceMap = {};
  const productMap = {};
  dbProducts.forEach((p) => {
    priceMap[p._id.toString()] = p.price;
    productMap[p._id.toString()] = p;
  });

  const user = await User.findById(token.user._id);
  if (!user)
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );

  for (const incoming of products) {
    const dbProduct = productMap[incoming.productId];
    const existing = user.cart.products.find(
      (p) => p.product.toString() === incoming.productId,
    );

    validateStock(dbProduct, incoming.quantity, existing?.quantity ?? 0);

    if (existing) {
      existing.quantity += incoming.quantity;
    } else {
      user.cart.products.push({
        product: incoming.productId,
        quantity: incoming.quantity,
        price: priceMap[incoming.productId],
      });
    }
  }

  await recalculateCharges(user.cart);

  if (!user.cart?.deliveryAddress) {
    user.cart.deliveryAddress = user.addresses.length
      ? user.addresses[0]._id
      : null;
  }

  await user.save();
  return await populateCart(user);
};

export const getCart = async (token) => {
  const user = await User.findById(token.user._id);

  const cart = {...await populateCart(user)}

  if (!cart || cart.products.length === 0) {
    throw new OperationalError(STATUS_CODES.ACTION_FAILED, "Cart is empty");
  }

  if (cart?.deliveryAddress) {
    cart.selectedAddress = user.addresses.find(
      (a) => a._id.toString() === cart.deliveryAddress.toString(),
    );
    cart.deliveryAddress = null;
  }

  cart.itemTotal = parseFloat(
    cart.products.reduce((sum, p) => sum + p.price * p.quantity, 0),
  ).toFixed(2);

  console.log(cart)

  return cart;
};

export const updateCart = async (cartData, token) => {
  const { products, addressId } = cartData;

  const user = await User.findById(token.user._id);
  if (!user)
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );
    

  if (products) {
    const productIds = products.map((p) => p.productId);
    const dbProducts = await Product.find({
      _id: { $in: productIds },
      isDeleted: false,
    }).lean();
    const productMap = {};
    dbProducts.forEach((p) => (productMap[p._id.toString()] = p));

    for (const incoming of products) {
      const idx = user.cart.products.findIndex(
        (p) => p.product.toString() === incoming.productId,
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
    // ! add check for courier availability for shiprocket
    const addressExists = user.addresses.id(addressId);
    if (!addressExists) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        "Address not found",
      );
    }
    user.cart.deliveryAddress = addressExists._id;
  }

  await recalculateCharges(user.cart);
  await user.save();
  return await populateCart(user);
};

export const deleteFromCart = async (productId, token) => {
  const user = await User.findById(token.user._id);

  const before = user.cart.products.length;
  user.cart.products = user.cart.products.filter(
    (p) => p.product.toString() !== productId,
  );

  if (user.cart.products.length === before) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      "Product not in cart",
    );
  }

  await recalculateCharges(user.cart);
  await user.save();
  return await populateCart(user);
};

export const clearCart = async (token) => {
  const user = await User.findById(token.user._id);
  if (!user)
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.USER_NOT_FOUND,
    );

  user.cart.products = [];
  user.cart.deliveryAddress = null;
  user.cart.tax = 0;

  await user.save();
  return { message: "Cart cleared" };
};

const populateCart = async (user) => {
  const populatedUser = await user.populate(
    "cart.products.product",
    "name images",
  );
  return populatedUser.cart;
};
