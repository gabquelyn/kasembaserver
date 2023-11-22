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
        category: { type: String, required: true },
        sub_categories: [
          {
            _id: { type: String, required: true },
            state: { type: String, required: true },
            comment: { type: String, required: false },
            image: { type: String, required: true },
            name: { type: String, required: true },
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
