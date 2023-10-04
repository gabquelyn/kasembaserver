import { Schema, model } from "mongoose";
const tokenSchema = new Schema<IToken>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    default: Date.now(),
    expires: 3600,
  },
});

export default model<IToken>("Token", tokenSchema);
