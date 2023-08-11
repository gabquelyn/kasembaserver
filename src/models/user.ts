import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles:{
    type: String,
    default: "client"
  },
  firstname: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
});

export default mongoose.model('User', userSchema) ;