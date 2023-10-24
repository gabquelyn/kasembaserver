import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Car from "../models/car";
import User from "../models/user";
interface CustomRequest extends Request {
  email: string;
  roles: string;
  userId: string;
}

export const getCarsControllers = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as CustomRequest).userId;
    if ((req as CustomRequest).roles === "administrator") {
      const allCars = await Car.find({}).lean().exec();
      return res.status(200).json({ message: allCars });
    }
    const cars = await User.findById(userId).populate("cars").lean().exec();
    return res.status(200).json({ message: cars });
  }
);

export const getCarController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { carId } = req.params;
    const car = await Car.findById(carId).lean().exec();
    if (!car) return res.status(404);
    return res.status(200).json({ ...car });
  }
);

export const postCarsController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as CustomRequest).userId;
    const user = await User.findById(userId).exec();
    const imageArray: string[] = [];

    const { type, vin, color, description, sell, sell_type, cost, showcase } =
      req.body;

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
      showcase,
    });

    if (user) {
      user.cars.push(newCar._id);
      await user.save();
    }

    return res.status(201).json({ message: `car ${newCar._id} creaated ` });
  }
);
