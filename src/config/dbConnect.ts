import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URI as string);
  } catch (err) {
    console.log(err);
  }
}
