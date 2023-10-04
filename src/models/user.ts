import mongoose from "mongoose";

const userSchema = new mongoose.Schema<IUser>(
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
    profile: {
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
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
