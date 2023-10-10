import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { Request, Response } from "express";
import Inspection from "../models/insepction";
import Report from "../models/report";
import User from "../models/user";
export const assignController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { inspectorId, inspectionId } = req.params;
    const inspection = await Inspection.findById(inspectionId).lean().exec();
    const inspector = await User.findById(inspectorId).exec();

    if (!inspection || !inspector || !inspection.paid)
      return res
        .status(400)
        .json({ message: `Inspector/inspection not found or not paid` });

    const report = await Report.findOne({ inspectionId }).lean().exec();
    if (report)
      return res.status(405).json({ message: "Inspection already reported" });

    //check if inspection already belongs to the inspector
    const mongoObject = new mongoose.Types.ObjectId(inspectionId);

    if (inspector.inspections.includes(mongoObject))
      return res.status(404).json({
        message: "already assigned to same inspector",
      });
    inspector.inspections.push(mongoObject);
    await inspector.save();
    res.status(200).json({
      message: `assigned inspection of id ${inspectionId} to ${inspector.firstname}`,
    });
  }
);

export const publishReportsController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { reportId } = req.params;
    const report = await Report.findById(reportId).exec();
    if (!report) return res.status(404).json({ message: "report not found!" });
    report.status = "published";
    await report.save();

    const inspection = await Inspection.findById(report.inspectionId)
      .lean()
      .exec();
    if (!inspection)
      return res.status(400).json({ message: "Inspection does not exist" });
    const inspector = await User.findById(report.inspectorId).exec();
    if (inspector && inspector.roles === "inspector") {
      inspector.balance += inspection?.price;
      await inspector.save();
    }
    // send mail to client later!
    return res.status(200).json({ message: "Report published successfully!" });
  }
);
