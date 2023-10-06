import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: String,
      default: "client",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    firstname: {
      type: String,
      required: false,
    },
    lastname: {
      type: String,
      required: false,
    },
    phone_number: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    zip_code: {
      type: Number,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    cars: [{ type: Schema.Types.ObjectId, ref: "Car" }],
    reports: [{ type: Schema.Types.ObjectId, ref: "Report" }],
    inspections: [{ type: Schema.Types.ObjectId, ref: "Inspection" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
