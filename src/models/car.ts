import mongoose from "mongoose";
const carSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "new",
    },
    images: [{ type: String, required: true }],
    vin: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    plate_number: {
      type: String,
      required: false,
    },
    mode: {
      seller: {
        type: Boolean,
        required: true,
      },
      currency: {
        type: Boolean,
        required: true,
        default: "USD",
      },
      cost: {
        type: Number,
        required: false,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Car", carSchema);
