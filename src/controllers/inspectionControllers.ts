import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Inspection from "../models/insepction";
import Car from "../models/car";
import User from "../models/user";
import axios from "axios";
import { checkDistance } from "../utils/findLocation";
import { Types } from "mongoose";
interface CustomRequest extends Request {
  roles?: string;
  email?: string;
  userId?: string;
}

export const getInspectionController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as CustomRequest).userId;
    if ((req as CustomRequest).roles === "administrator") {
      const inspections = await Inspection.find({}).lean().exec();
      return res.status(200).json({ message: inspections });
    }
    if ((req as CustomRequest).roles === "inspector") {
      const inspections = await Inspection.find({
        inspectorId: userId,
      })
        .lean()
        .exec();
      return res.status(200).json({ message: inspections });
    }
    const inspections = await Inspection.find({ userId }).lean().exec();
    return res.status(200).json({ message: inspections });
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
      country,
      city,
      address,
      zip_code,
      category,
      showcase,
      price,
    } = req.body;
    const selectedCategories: string[] = JSON.parse(category);

    // check for the user existence first
    const userId = (req as CustomRequest).userId;
    const user = await User.findById(userId).exec();
    if (!user) return res.status(200).json({ message: "user doesn't exist!" });

    // check the postal code of the inspection
    let _distance: number = Infinity;
    let inspectorObjectId: Types.ObjectId = new Types.ObjectId(4);

    try {
      const destinationRes = await axios.get(
        `https://api.geocod.io/v1.7/geocode?postal_code=${zip_code}&api_key=${process.env.GEOCODIO_API_KEY}`
      );

      if (destinationRes.data.results.length === 0) {
        return res.status(400).json({
          message: `Our services is not yet available in your region with zip code ${zip_code}`,
        });
      }

      // check for the closest inspector to assign the inspection to
      const allInspectors = await User.find({ roles: "inspector" })
        .lean()
        .exec();
      if (allInspectors.length === 0) {
        return res.status(404).json({ message: "no available inspectors" });
      }

      for (const inspector of allInspectors) {
        if (inspector.zip_code) {
          const distanceInKm = await checkDistance(
            inspector.zip_code,
            destinationRes.data.results[0].location
          );
          if (distanceInKm < _distance) {
            _distance = distanceInKm;
            inspectorObjectId = inspector._id;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }

    if (_distance === Infinity) {
      return res
        .status(400)
        .json({ message: "No inspector availabel in region" });
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
      sell,
      sell_type,
      cost,
      currency,
      showcase,
    });

    const newInspection = await Inspection.create({
      userId,
      carId: newCar._id,
      location: {
        country,
        city,
        address,
        zip_code,
      },
      category: selectedCategories,
      price,
      distance: _distance,
    });

    // assign the inspection to the closest inspector
    const closestInspector = await User.findById(inspectorObjectId).exec();
    if (closestInspector) {
      closestInspector.inspections.push(newInspection._id);
      await closestInspector.save();
    }
    return res
      .status(201)
      .json({ message: `inspection created succesfully ${newInspection._id}` });
  }
);
