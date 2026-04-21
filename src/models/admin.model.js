import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    image: {
        type: String,
        default: "https://img.freepik.com/premium-vector/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4855.jpg",
    },
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
}, {timestamps : true})

const Admin = mongoose.model("Admin", adminSchema)

export default Admin;