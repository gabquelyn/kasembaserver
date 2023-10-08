import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Types } from "mongoose";
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
    const inspectionObjectId: Types.ObjectId = new Types.ObjectId(inspectionId);
    const inspector = await User.findById((req as CustomRequest).userId)
      .lean()
      .exec();

    const belongsto = inspector?.inspections.some((inspId) =>
      inspId.equals(inspectionObjectId)
    );

    if (!belongsto)
      return res
        .status(400)
        .json({ message: "Cannot interact with inspection" });

    inspection.status = "acknowledged";
    await inspection.save();
    return res.status(200).json({ message: "Inspection acknowledged!" });
  }
);
