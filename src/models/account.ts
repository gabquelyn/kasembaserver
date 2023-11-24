import mongoose from "mongoose";
const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    number: {
      type: Number,
      required: true,
    },
    bank: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
