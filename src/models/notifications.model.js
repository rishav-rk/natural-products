import mongoose from "mongoose";
import { NOTIFICATION_TYPE } from "../config/appConstants.js";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [...Object.values(NOTIFICATION_TYPE)],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    data: { type: mongoose.SchemaTypes.Mixed },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1, isDeleted: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
