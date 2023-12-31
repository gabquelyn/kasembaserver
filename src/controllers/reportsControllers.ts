import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Report from "../models/report";
import User from "../models/user";
import Insepction from "../models/insepction";
import { Types } from "mongoose";

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
      const allReports = await Report.find({})
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      return res.status(200).json([...allReports]);
    }

    const inspectorReports = await User.findById(userId)
      .populate({
        path: "reports",
        options: { sort: { createdAt: -1 } },
      })
      .lean()
      .exec();
    if (!inspectorReports) return res.status(200).json([]);
    return res.status(200).json([...inspectorReports.reports]);
  }
);

export const createReportsController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const inspectorId = (req as CustomRequest).userId;

    const { inspectionId, details } = req.body;
    const inspection = await Insepction.findById(inspectionId)
      .populate("category")
      .exec();
    if (!inspection)
      return res.status(404).json({ message: "Inspection not found" });
    if (!inspection.paid)
      res.status(400).json({ message: "Inspection not paid for" });
    const inspectionObjectId: Types.ObjectId = new Types.ObjectId(inspectionId);
    const inspector = await User.findById(inspectorId).exec();
    if (!inspector)
      return res.status(404).json({ message: "Inspector not found" });
    const belongsto = inspector?.inspections.some((inspId) =>
      inspId.equals(inspectionObjectId)
    );

    if (!belongsto)
      return res
        .status(400)
        .json({ message: "Cannot interact with inspection" });
    if (inspection.category.length !== details.length) {
      return res.status(400).json({ message: "Invalide reports" });
    }

    const newReport = await Report.create({
      inspectorId,
      inspectionId,
      reports: [...details],
    });

    inspector.reports.push(newReport._id);
    inspector.inspections.filter((entity) => entity._id !== inspectionId);
    await inspector.save();
    inspection.status = "reported";
    await inspection.save();
    return res.status(200).json({
      message: `New report created ${newReport._id} awaiting to be published`,
    });
  }
);

export const getReportController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { reportId } = req.params;
    const report = await Report.findById(reportId).lean().exec();
    if (!report) return res.status(404).json({ message: "no report" });
    if (report.status !== "published")
      return res.status(400).json({ message: "Report not published yet!" });
    return res.status(200).json({ ...report });
  }
);

export const getInspectionReport = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { inspectionId } = req.params;
    const report = await Report.findOne({ inspectionId }).lean().exec();
    if (!report)
      return res.status(404).json({ message: "no report for inspection" });
    return res.status(200).json({ reportId: report._id });
  }
);
