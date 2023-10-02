import mongoose from "mongoose";
const reportSchema = new mongoose.Schema(
  {
    inspector: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: [
      {
        category: {
          type: String,
          required: true,
        },
        sub_categories: [
          {
            name: {
              type: String,
              required: true,
            },
            state: {
              type: String,
              required: true,
            },
            image: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Report", reportSchema);
