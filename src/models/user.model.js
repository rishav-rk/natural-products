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
    },
    countryCode: {
      type: String,
      default: "+91",
    },
    password: {
      type: String,
      required: [true, "Please provide your password"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    addresses: [
      {
        houseNumberAndFloor: {
          type: String,
        },
        builidingAndBlock:{
          type: String,
        },
        landMarkAndArea:{
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        country: {
          type: String,
          default: "India",
        },
        type: {
          type: String,
          enum: ["home", "work", "other"],
        },
        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: {
            type: [Number],
            default: [0, 0],  // [longitude, latitude]
          }
        }
      }
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
    }, 
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  },
);

userSchema.index({ "addresses.location": "2dsphere" });

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
