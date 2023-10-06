import mongoose from "mongoose";
const carSchema = new mongoose.Schema(
  {
    userId: {
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
    description: {
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
          type: String,
        },
        to: {
          type: String,
        },
      },
    ],
  },

  { timestamps: true }
);

export default mongoose.model("Car", carSchema);
