import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Warehouse name is required"],
    },
    phone: {
      type: String,
      required: [true, "Contact person's phone is required"],
    },
    email: {
      type: String,
      required: [true, "Contact person's email is required"],
    },
    address: {
      type: String,
      required: [true, "Warehouse address is required"],
    },
    city: {
      type: String,
      required: [true, "Warehouse city is required"],
    },
    state: {
      type: String,
      required: [true, "Warehouse state is required"], 
    },
    country: {
      type: String,
      default: "India",
    },
    pin: {
      type: String,
      required: [true, "Warehouse pincode is required"],
    },
    gstNumber: {
      type: String,                                    
    },
    return_address: {
      type: String,
    },
    return_pin: {
      type: String,
    },
    return_city: {
      type: String,
    },
    return_state: {
      type: String,
    },
    return_country: {
      type: String,
      default: "India",
    },
    isActive: {
      type: Boolean, 
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },  
    location: {
      type: {
        type: String,
        enum: ["Point"],                              
        default: "Point",
      },
      coordinates: {
        type: [Number],                              
        required: [true, "Warehouse coordinates are required"],
      },
    },
  },
  { timestamps: true },
);

warehouseSchema.index({ location: "2dsphere" });

const Warehouse = mongoose.model("Warehouse", warehouseSchema);
export default Warehouse;