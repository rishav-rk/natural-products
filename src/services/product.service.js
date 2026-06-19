import {
  STATUS_CODES,
  ERROR_MESSAGES,
  USER_TYPE,
} from "../config/appConstants.js";
import { Product } from "../models/index.js";
import { OperationalError } from "../utils/error.js";
import { paginationOptions } from "../utils/universalFunctions.js";

export const getProducts = async (query, token) => {
  console.log(token)
  const filter = {
    isDeleted: false,
  };

  // Fix: assign object, not property on undefined
  if (token.role === USER_TYPE.USER) {
    filter.stock = { $gt: 0 };
  }

  // Category filter
  if (query.category) {
    filter.category = query.category;
  }

  // // Price range filter
  // if (query.minPrice || query.maxPrice) {
  //   filter.price = {};
  //   if (query.minPrice) filter.price.$gte = Number(query.minPrice);
  //   if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  // }

  // Search — prefer $text index, fall back to $regex
  if (query.search) {
    // Requires: ProductSchema.index({ name: "text", description: "text", benefits: "text", keywords: "text" })
    const search = query.search;
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { benefits: { $regex: search, $options: "i" } },
      { keywords: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const projection = {
    createdAt: 0,
    updatedAt: 0,
    isDeleted: 0,
    __v: 0
  };

  const [products, totalCount] = await Promise.all([
    Product.find(
      filter,
      projection,
      paginationOptions(query.page, query.limit),
    ),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    totalCount,
  };
};

export const getProductById = async (productId) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  }).lean();

  if (!product) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_PRODUCT,
    );
  }

  return product;
};
