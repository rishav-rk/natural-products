import { catchAsync } from "../../utils/universalFunctions.js";
import { Product } from "../../models/index.js";
import { OperationalError } from "../../utils/error.js";
import { ERROR_MESSAGES, STATUS_CODES } from "../../config/appConstants.js";

export const addProduct = async (productData) => {
  const price = parseFloat(productData.price); // parse once, cleanly
  const discount = productData.discount || 0;
  const discountedPrice = (price - (price * discount) / 100).toFixed(2);

  return await Product.create({
    name: productData.name,
    description: productData.description,
    benefits: productData.benefits,
    price,
    stock: productData.stock,
    keywords: productData.keywords,
    "details.useBefore": productData.details.useBefore,
    "details.approvedName": productData.details.approvedName,
    images: productData.images,
    backgroundColor: product.backgroundColor,
    weight: productData.weight,
    discount,
    discountedPrice,
  });
};

export const updateProduct = async (productData, productId) => {
  const updateFields = {};

  // Scalar fields — only set if provided
  const scalarFields = [
    "name",
    "description",
    "benefits",
    "stock",
    "keywords",
    "images",
    "discount",
    "weight",
  ];
  for (const field of scalarFields) {
    if (productData[field] !== undefined)
      updateFields[field] = productData[field];
  }

  // Nested details — guard against missing details object
  if (productData.details !== undefined) {
    if (productData.details.useBefore !== undefined)
      updateFields["details.useBefore"] = productData.details.useBefore;
    if (productData.details.approvedName !== undefined)
      updateFields["details.approvedName"] = productData.details.approvedName;
  }
  

  // Price & discount must stay in sync
  if (productData.price !== undefined || productData.discount !== undefined) {
    const existing = await Product.findOne({
      _id: productId,
      isDeleted: false,
    }).lean();
    if (!existing) {
      throw new OperationalError(
        STATUS_CODES.ACTION_FAILED,
        ERROR_MESSAGES.NO_SUCH_PRODUCT,
      );
    }

    const price = parseFloat(productData.price ?? existing.price);
    const discount = parseFloat(productData.discount ?? existing.discount ?? 0);
    const discountedPrice = (price - (price * discount) / 100).toFixed(2);

    updateFields.price = price;
    updateFields.discount = discount;
    updateFields.discountedPrice = discountedPrice;
  }

  const updated = await Product.findOneAndUpdate(
    { _id: productId, isDeleted: false },
    {
      $set: {
        name: productData.name,
        description: productData.description,
        benefits: productData.benefits,
        price: productData.price,
        stock: productData.stock,
        keywords: productData.keywords,
        "details.useBefore": productData.details.useBefore,
        "details.approvedName": productData.details.approvedName,
        images: productData.images,
        backgroundColor: productData.backgroundColor
      },
    },
    {
      new: true,
      lean: true,
    },
  );

  if (!updated) {
    throw new OperationalError(
      STATUS_CODES.ACTION_FAILED,
      ERROR_MESSAGES.NO_SUCH_PRODUCT,
    );
  }

  return updated;
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
