import mongoose from "mongoose";
const invoiceSchema = new mongoose.Schema(
  {
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
    },
    details: {
      bank: String,
      name: String,
      number: Number,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Invoice", invoiceSchema);
