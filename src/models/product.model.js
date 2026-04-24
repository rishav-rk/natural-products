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
        required: [true, "Please provide product benefits"]
    },
    price: {
      type: String,
      required: [true, "Please provide product price"],
    },
    stock: {
      type: Number,
      required: [true, "Please provide product stock"],
    },
    keywords: {
      type: [String], 
    },
    details: {
      manufacturer: {
        type: String,
        default: "Back to Nature's Lap, Plot No. 202, Industrial Focal Point, Phase - 9, Bengaluru, KA, India",
      },
      packer: {
        type: String,
        default: "Back to Nature's Lap, Plot No. 202, Industrial Focal Point, Phase - 9, Bengaluru, KA, India",
      }, 
      userBefore: {
        type: String, 
        required: [true, "Please provide product user before date"]
      }, 
      approvedName: {
        type: String, 
        required: [true, "Please provide product approved name"]
      }
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