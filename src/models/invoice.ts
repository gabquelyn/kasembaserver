import mongoose from "mongoose";
const invoiceSchema = new mongoose.Schema(
  {
    inspectorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Account",
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
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Invoice", invoiceSchema);
