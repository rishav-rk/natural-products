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
      required: [true, "Please provide product benefits"],
    },
    price: {
      type: String,
      required: [true, "Please provide product price"],
    },
    discountedPrice: {
      type: String,
    },
    discount: {
      type: String,
      default: "0",
    },
    stock: {
      type: Number,
      required: [true, "Please provide product stock"],
    },
    keywords: [
      {
        type: String,
      },
    ],
    weight: {
      type: Number,
      default: 300,
    },
    isOutOfStock: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
    },
    storeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" }],
    details: {
      manufacturer: {
        type: String,
        default:
          "Back to Nature's Lap, Plot No. 202, Industrial Focal Point, Phase - 9, Bengaluru, KA, India",
      },
      packer: {
        type: String,
        default:
          "Back to Nature's Lap, Plot No. 202, Industrial Focal Point, Phase - 9, Bengaluru, KA, India",
      },
      countryOfOrigin: {
        type: String,
        default: "India",
      },
      useBefore: {
        type: String,
        required: [true, "Please provide product use before date"],
      },
      approvedName: {
        type: String,
        required: [true, "Please provide product approved name"],
      },
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
  { timestamps: true },
);

productSchema.index({ isDeleted: 1, storeIds: 1 }); // compound: most queries filter both

const Product = mongoose.model("Product", productSchema);

export default Product;
