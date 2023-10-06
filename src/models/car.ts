import mongoose from "mongoose";
const carSchema = new mongoose.Schema<ICar>(
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
      required: true,
      default: false,
    },
    sell_type: {
      type: String,
      required: false,
      default: "dealer",
    },
    currency: {
      type: String,
      required: true,
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

export default mongoose.model<ICar>("Car", carSchema);
