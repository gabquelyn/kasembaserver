import mongoose from "mongoose";
const logSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
  comment: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Log", logSchema);
