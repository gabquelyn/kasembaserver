import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sub_categories: [
      {
        name: { type: String, required: true },
        options: [{ type: String, required: true }],
        image_upload: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Category", categorySchema);
