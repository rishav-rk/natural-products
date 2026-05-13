import { catchAsync } from "../../utils/universalFunctions.js";
import { Product } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";

export const addProduct = async (productData) => {

  return await Product.create({
    name: productData.name,
    description: productData.description,
    benefits: productData.benefits,
    price: productData.price,
    stock: productData.stock,
    keywords: productData.keywords,
    "details.useBefore": productData.details.useBefore,
      "details.approvedName": productData.details.approvedName,
    images: productData.images,
  });
};

export const updateProduct = async (productData, productId) => {
  const product = await Product.findOneAndUpdate({_id: productId, isDeleted: false}, {$set : {
    name: productData.name,
    description: productData.description,
    benefits: productData.benefits,
    price: productData.price,
    stock: productData.stock,
    keywords: productData.keywords,
    "details.useBefore": productData.details.useBefore,
      "details.approvedName": productData.details.approvedName,
    images: productData.images,
  }}, {
    new: true,
    lean: true,
  });

  if (!product) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_PRODUCT,
    );
  }
  return product;
};

export const deleteProduct = async (productId) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true, lean: true },
  );

  if (!product) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_PRODUCT,
    );
  }
};
