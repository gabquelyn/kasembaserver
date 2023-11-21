import mongoose from "mongoose";
const reportSchema = new mongoose.Schema(
  {
    inspectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Inspection",
      required: true,
      unique: true,
    },
    inspectorId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      default: "unpublished",
    },
    reports: [
      {
        category: {
          type: mongoose.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        sub_categories: [
          {
            id: { type: String, required: true },
            status: { type: String, required: true },
            comment: String,
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
