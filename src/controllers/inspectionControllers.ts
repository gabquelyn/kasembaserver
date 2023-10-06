import { Request, Response, Express } from "express";
import expressAsyncHandler from "express-async-handler";
import Inspection from "../models/insepction";
import Car from "../models/car";
import User from "../models/user";
import Category from "../models/category";
import { validationResult } from "express-validator";

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
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array() });
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
    }: InspectionFormData = req.body;

    const userId = (req as CustomRequest).userId;
    const user = await User.findById(userId).exec();
    if (!user) return res.status(200).json({ message: "user doesn't exist!" });
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

    // calculate the total price of the inspection
    let totalPrice = 0;
    category.forEach(async (cat) => {
      const existingCategory = await Category.findById(cat).lean().exec();
      if (existingCategory) totalPrice += existingCategory?.cost;
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
      category,
      price: totalPrice,
    });

    return res
      .status(201)
      .json({ message: `inspection created succesfully ${newInspection._id}` });
  }
);
