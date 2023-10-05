import { Request, Response, Express } from "express";
import expressAsyncHandler from "express-async-handler";
import Inspection from "../models/insepction";
import Car from "../models/car";
import User from "../models/user";
import Category from "../models/category";

interface CustomRequest extends Request {
  roles?: string;
  email: string;
}

export const getInspectionController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const user = await User.findOne({
      email: (req as CustomRequest).email,
    })
      .lean()
      .exec();
    if ((req as CustomRequest).roles === "administrator") {
      const inspections = await Inspection.find({}).lean().exec();
      return res.status(200).json({ message: inspections });
    } else if ((req as CustomRequest).roles === "inspector") {
      const inspections = await Inspection.find({ inspectorId: user?._id })
        .lean()
        .exec();
      return res.status(200).json({ message: inspections });
    } else {
      const inspections = await Inspection.find({ userId: user?._id })
        .lean()
        .exec();
      return res.status(200).json({ message: inspections });
    }
  }
);

export const createInspectionController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const {
      type,
      color,
      vin,
      description,
      seller,
      currency,
      cost,
      country,
      city,
      address,
      zip_code,
      category,
    }: {
      type: string;
      color: string;
      vin: string;
      description: string;
      seller: string;
      currency: string;
      cost: string;
      country: string;
      city: string;
      address: string;
      zip_code: number;
      category: string[];
    } = req.body;

    const user = await User.findOne({
      email: (req as CustomRequest).email,
    }).exec();
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
      userId: user._id,
      type,
      images: imageArray,
      vin,
      color,
      description,
      mode: {
        seller,
        cost,
        currency,
      },
    });

    // calculate the total price of the inspection
    let totalPrice = 0;
    category.forEach(async (cat) => {
      const existingCategory = await Category.findById(cat).lean().exec();
      if (existingCategory) totalPrice += existingCategory?.cost;
    });

    const newInspection = await Inspection.create({
      userId: user._id,
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
