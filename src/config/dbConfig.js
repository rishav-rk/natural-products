import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  mongoose.set("strictQuery", true);

  return mongoose.connect(
    config.mongoose.url,
    config.mongoose.options
  );
}

export async function shutdown(server) {
  console.log("\nShutting down server...");

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);

          console.log("Server closed");
          resolve();
        });
      });
    }

    await mongoose.connection.close();

    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Shutdown failed:", err);
    process.exit(1);
  }
}

export default connectDB;