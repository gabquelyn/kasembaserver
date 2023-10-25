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
    details: {},
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Report", reportSchema);
