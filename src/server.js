import app from "./app.js";
import config from "./configs/config.js";
import connectDB from "./configs/dbConfig.js";
import CreateAdmin from "./utils/bootstrap.js"
import Customer from "./models/customer.model.js";

connectDB().then((connObject) => {
  console.log(`MONGODB connected successfully HOST - ${connObject.connection.host}`);
  CreateAdmin()
})
app.listen(config.port, ()=>{
  console.log(`Server is listening on ${config.port}`)
});
