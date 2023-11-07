import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Inspection from "../models/insepction";
import Car from "../models/car";
import User from "../models/user";
import axios from "axios";
interface CustomRequest extends Request {
  roles?: string;
  email?: string;
  userId?: string;
}

export const getInspectionController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as CustomRequest).userId;
    if ((req as CustomRequest).roles === "administrator") {
      const inspections = await Inspection.find({})
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      return res.status(200).json([...inspections]);
    }
    if ((req as CustomRequest).roles === "inspector") {
      const inspector = await User.findById(userId)
        .populate({
          path: "inspections",
          options: { sort: { createdAt: -1 } },
        })
        .exec();
      if (!inspector) return res.status(200).json([]);
      return res.status(200).json([...inspector.inspections]);
    }
    const inspections = await Inspection.find({ userId })
      .sort({ createdAt: -1 })
      .populate("category")
      .exec();
    return res.status(200).json([...inspections]);
  }
);

export const createInspectionController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const {
      type,
      color,
      vin,
      description,
      sell,
      sell_type,
      currency,
      cost,
      city,
      usage,
      address,
      zip_code,
      features,
      time,
      category,
      showcase,
    } = req.body;
    if (
      !city ||
      !address ||
      !zip_code ||
      !vin ||
      !color ||
      !description ||
      !time
    ) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    if (sell === "true" && !cost) {
      return res
        .status(400)
        .json({ message: "Include the cost of the vehicle" });
    }
    const selectedCategories: string[] = JSON.parse(category);
    // check for the user existence first
    const userId = (req as CustomRequest).userId;
    const user = await User.findById(userId).exec();
    if (!user) return res.status(400).json({ message: "user doesn't exist!" });

    // check the postal code of the inspection
    const destinationRes = await axios.get(
      `https://api.geocod.io/v1.7/geocode?postal_code=${zip_code}&api_key=${process.env.GEOCODIO_API_KEY}`
    );

    if (destinationRes.data.results.length === 0) {
      return res.status(405).json({
        message: `Our services is not yet available in your region with zip code ${zip_code}`,
      });
    }

    const imageArray: string[] = [];

    if (req.files) {
      for (let i = 0; i < +req.files?.length; i++) {
        imageArray.push(
          `${(req.files as Express.Multer.File[])[i].destination}/${
            (req.files as Express.Multer.File[])[i].filename
          }`
        );
      }
    }

    const newCar = await Car.create({
      userId,
      type,
      images: imageArray,
      vin,
      color,
      description,
      sell: JSON.parse(sell),
      sell_type,
      cost: cost ? JSON.parse(cost) : 0,
      usage,
      features: JSON.parse(features),
      currency,
      showcase: showcase ? JSON.parse(showcase) : [],
    });

    const newInspection = await Inspection.create({
      userId,
      carId: newCar._id,
      time,
      position: destinationRes.data.results[0].location,
      location: {
        city,
        address,
        zip_code,
      },
      category: selectedCategories,
    });
    return res.status(201).json({ id: newInspection._id });
  }
);

export const getInspectionById = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { inspectionId } = req.params;
    const inspection = await Inspection.findById(inspectionId)
      .populate("category")
      .lean()
      .exec();
    if (!inspection)
      return res.status(400).json({ message: "Inspection not found" });
    return res.status(200).json({ ...inspection });
  }
);
