import mongoose from "mongoose";
const inspectionSchemma = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carId: {
      type: mongoose.Types.ObjectId,
      ref: "Car",
      required: true,
      unique: true,
    },
    status: {
      type: String,
      default: "unacknowledged",
    },
    distance: {
      type: Number,
      required: true,
    },
    location: {
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
      default: 0
    },
    paid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Inspection", inspectionSchemma);

// populate the category to calculate the total price