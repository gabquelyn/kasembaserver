import mongoose from "mongoose";
const stripeSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  inspectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Inspection",
    unique: true,
  },
});

export default mongoose.model("Session", stripeSessionSchema);
