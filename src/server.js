import app from "./app.js";
import config from "./config/config.js";
import connectDB, { shutdown } from "./config/dbConfig.js";
import CreateAdmin from "./utils/bootstrap.js";

let server;
let isShuttingDown = false;

const gracefulShutdown = async () => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  try {
    await shutdown(server);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

async function startServer() {
  try {
    await connectDB();

    console.log("MongoDB connection opened");

    await CreateAdmin();

    server = app.listen(config.port, () => {
      console.log(`Server is listening on port ${config.port}`);
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
}

// Start application
startServer();

// Graceful shutdown signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Handle unexpected errors
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  gracefulShutdown();
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  gracefulShutdown();
});
