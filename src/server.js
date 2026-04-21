import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./config/dbConfig.js";
import CreateAdmin from "./utils/bootstrap.js"

connectDB().then((connObject) => {
  console.log(`MONGODB connected successfully HOST - ${connObject.connection.host}`);
  CreateAdmin()
})
app.listen(config.port, ()=>{
  console.log(`Server is listening on ${config.port}`)
});
