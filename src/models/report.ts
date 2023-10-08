import mongoose from "mongoose";
const reportSchema = new mongoose.Schema(
  {
    inspectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Inspection",
      required: true,
      unique: true,
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
