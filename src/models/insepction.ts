import mongoose from "mongoose";
const inspectionSchemma = new mongoose.Schema(
  {
    car: {
      type: mongoose.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    state: {
      type: String,
      required: true,
      default: "unapproved",
    },
    location: {
      country: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      zip_code: {
        type: String,
        required: true,
      },
    },
    category: [
      { type: mongoose.Types.ObjectId, ref: "Category", required: true },
    ],
    cost: {
      type: Number,
      required: true,
    },
    paid: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inspection", inspectionSchemma);
