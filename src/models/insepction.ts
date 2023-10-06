import mongoose from "mongoose";
const inspectionSchemma = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    reportId: {
      type: mongoose.Types.ObjectId,
      ref: "Report",
      required: false,
      unique: true
    },
    assigedTo: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false,
      unique: true
    },
    carId: {
      type: mongoose.Types.ObjectId,
      ref: "Car",
      required: true,
      unique: true,
    },
    status: {
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
    price: {
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
