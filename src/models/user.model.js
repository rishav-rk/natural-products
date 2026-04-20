import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
    },
    countryCode: {
      type: String,
      required: [true, "Please provide your country code"],
      default: "+91",
    },
    password: {
      type: String,
      required: [true, "Please provide your password"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    order: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
  },
  {
    timestamps: true,
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.isBlocked;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret._id;
        return ret;
      }
    }
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
