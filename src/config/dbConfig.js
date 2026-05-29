import mongoose, { mongo } from "mongoose"
import config from "./config.js"
import { OperationalError } from "../utils/error.js";

async function connectDB(){
    try {
        mongoose.set('strictQuery', true);
        return await mongoose.connect(config.mongoose.url, config.mongoose.options);
    } catch (err) {
        throw new OperationalError(500)
        process.exit(1)
    }
}

export default connectDB;