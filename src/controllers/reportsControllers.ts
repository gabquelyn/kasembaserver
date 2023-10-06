import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Report from "../models/report";
import User from "../models/user";
interface CustomRequest extends Request {
  roles?: string;
  email?: string;
  userId?: string;
}
export const getReportsController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as CustomRequest).userId;
    const roles = (req as CustomRequest).roles;
    if (roles === "administrator") {
      const allReports = await Report.find({}).lean().exec();
      return res.status(200).json({ message: allReports });
    }

    const inspectorReports = await User.findById(userId)
      .populate("reports")
      .lean()
      .exec();
    return res.status(200).json({ message: inspectorReports });
  }
);
