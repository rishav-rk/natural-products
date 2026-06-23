import app from "./app.js";
import config from "./config/config.js";
import connectDB, { shutdown } from "./config/dbConfig.js";
import CreateAdmin from "./utils/bootstrap.js";
let server;

connectDB()
  .then(async (connObject) => {
    console.log(
      `MONGODB connected successfully HOST - ${connObject.connection.host}`
    );

    await CreateAdmin();

    server = app.listen(config.port, () => {
      console.log(`Server is listening on ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start application", err);
    process.exit(1);
  });

// Graceful shutdown

process.on("SIGINT", () => {
  shutdown(server);
});

process.on("SIGTERM", () => {
  shutdown(server);
});
