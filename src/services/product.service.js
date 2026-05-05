import { STATUS_CODES, ERROR_MESSAGES, USER_TYPE } from "../config/appConstants.js";
import { Product } from "../models/index.js";
import { OperationalError } from "../utils/error.js";
import { paginationOptions } from "../utils/universalFunctions.js";

export const getProducts = async (query, token) => {
  const filter = {
    isDeleted: false,
  };
  if(token.type === USER_TYPE.USER){
    filter.stock.$gt = 0
  }
  const { search } = query;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { benefits: { $regex: search, $options: "i" } },
      { keywords: { $in: [new RegExp(search, "i")] } },
    ];
  }

  return await Product.find(
    filter,
    {},
    paginationOptions(query.page, query.limit),
  );
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
