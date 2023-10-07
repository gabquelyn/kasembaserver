import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import mongoose from "mongoose";
import Inspection from "../models/insepction";
import User from "../models/user";
interface CustomRequest extends Request {
  email: string;
  roles: string;
  userId: string;
}
export const acknowledgeInspectionController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { inspectionId } = req.params;
    const inspection = await Inspection.findById(inspectionId).exec();
    if (!inspection)
      return res.status(404).json({ message: "Inspection does not exist" });
    const inspectionObjectId = new mongoose.Types.ObjectId(inspectionId);
    const inspector = await User.findById((req as CustomRequest).userId)
      .lean()
      .exec();
    if (!inspector?.inspections.includes(inspectionObjectId))
      return res
        .status(400)
        .json({ message: "Cannot interact with inspection" });

    inspection.status = "acknowledged";
    await inspection.save();
    return res.status(200).json({ message: "Inspection acknowledged!" });
  }
);
