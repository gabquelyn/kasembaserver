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
    details: [
      {
        name: {
          type: String,
          required: true,
        },
        condition: {
          type: String,
          required: true,
        },
        position: {
          type: String,
          required: false,
        },
        image: {
          type: String,
          required: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Report", reportSchema);
