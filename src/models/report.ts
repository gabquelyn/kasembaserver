import mongoose from "mongoose";
const reportSchema = new mongoose.Schema(
  {
    inspectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Inspection",
      required: true,
      unique: true
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
