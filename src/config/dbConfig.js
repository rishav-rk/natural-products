import mongoose, { mongo } from "mongoose";
import config from "./config.js";
import { OperationalError } from "../utils/error.js";

async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    return await mongoose.connect(config.mongoose.url, config.mongoose.options);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

export async function shutdown(server) {
  console.log("Shutting down server...");

  server.close(async () => {
    try {
      console.log("HTTP server closed");

      await mongoose.connection.close();

      console.log("MongoDB connection closed");
      process.exit(0);
    } catch (err) {
      console.error("Shutdown failed:", err);
      process.exit(1);
    }
  });
}

export default connectDB;
