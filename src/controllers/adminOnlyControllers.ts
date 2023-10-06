import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Inspection from "../models/insepction";
import Report from "../models/report";
import User from "../models/user";
export const assignController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { inspectorId, inspectionId } = req.params;
    const inspection = await Inspection.findById(inspectionId).exec();
    const inspector = await Inspection.findById(inspectorId).exec();

    if (!inspection || !inspector || !inspection.paid)
      return res
        .status(400)
        .json({ message: `Inspector/inspection not found or not paid` });

    const report = await Report.findOne({ inspectionId }).lean().exec();
    if (report)
      return res.status(405).json({ message: "Inspection already reported" });
  }
);
