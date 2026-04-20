import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
    },
    benefits: {
        type: String,
    },
    price: {
      type: String,
      required: [true, "Please provide product price"],
    },
    stock: {
      type: Number,
      required: [true, "Please provide product stock"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide product category"],
    },
    images: [
      {
        type: String,
        required: [true, "Please provide product images"],
        },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;