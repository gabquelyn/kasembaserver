import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    sub_categories: [
      {
        name: { type: String, required: true },
        image: { type: String, required: false },
      },
    ],
    cost: {
      type: Number,
      required: true,
    },
    plan: {
      type: String,
      require: true,
      default: "basic",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
