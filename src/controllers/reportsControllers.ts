import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Report from "../models/report";
import User from "../models/user";
import Insepction from "../models/insepction";
import { Types } from "mongoose";
import Category from "../models/category";

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

export const createReportsController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const inspectorId = (req as CustomRequest).userId;

    const { inspectionId } = req.params;
    const inspection = await Insepction.findById(inspectionId).exec();
    if (!inspection)
      return res.status(404).json({ message: "Inspection not found" });
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

    const { details } = req.body;
    const parsedDetails: {
      name: string;
      condition: string;
      position?: string;
    }[] = JSON.parse(details);

    const fileFields = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const formatedDetails = parsedDetails.map((detail) => {
      return {
        ...detail,
        image: `${fileFields[detail.name][0]?.destination}/${
          fileFields[detail.name][0].filename
        }`,
      };
    });

    const newReport = await Report.create({
      cost: 0.6 * inspection.price,
      inspectorId,
      inspectionId,
      details: formatedDetails,
    });

    inspector.reports.push(newReport._id);
    await inspector.save();
    return res.status(200).json({
      message: `New report created ${newReport._id} awaiting to be published`,
    });
  }
);
