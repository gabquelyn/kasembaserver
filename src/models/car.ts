import mongoose from "mongoose";
const carSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    usage: {
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
    description: {
      type: String,
      required: true,
    },
    millage: {
      type: String,
      required: true,
    },
    sell: {
      type: Boolean,
      default: false,
    },
    sell_type: {
      type: String,
      default: "dealer",
    },
    features: [{ type: String }],
    currency: {
      type: String,
      default: "USD",
    },
    cost: {
      type: Number,
      required: false,
    },
    showcase: [
      {
        day: {
          type: String,
        },
        from: {
          type: Number,
        },
        to: {
          type: Number,
        },
      },
    ],
  },

  { timestamps: true }
);

export default mongoose.model("Car", carSchema);
