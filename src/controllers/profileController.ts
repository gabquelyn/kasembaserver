import expressAsyncHandler from "express-async-handler";
import User from "../models/user";
import { Request, Response } from "express";
interface CustomRequest extends Request {
  email?: string;
  roles?: string;
}
export const getProfileController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const foundUser = await User.findOne({
      email: (req as CustomRequest).email,
    })
      .lean()
      .exec();
    if (!foundUser)
      return res.status(400).json({ message: "user does not exist" });
    const {
      avatar,
      firstname,
      lastname,
      phone_number,
      country,
      zip_code,
      city,
    } = foundUser;
    return res.status(200).json({
      message: {
        avatar,
        firstname,
        lastname,
        phone_number,
        country,
        zip_code,
        city,
      },
    });
  }
);

export const editProfileController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const foundUser = await User.findOne({
      email: (req as CustomRequest).email,
    }).exec();
    const { firstname, lastname, phone_number, country, zip_code, city } =
      req.body;
    if (!foundUser) return res.status(404).json({ message: "User not found" });
    if (req.file)
      foundUser.avatar = `${req.file?.destination}/${req.file?.filename}`;
    if (firstname) foundUser.firstname = firstname;
    if (lastname) foundUser.lastname = lastname;
    if (phone_number) foundUser.phone_number = phone_number;
    if (country) foundUser.country = country;
    if (zip_code) foundUser.zip_code = zip_code;
    if (city) foundUser.city = city;
    await foundUser.save();
    return res.status(201).json({ message: "Updated status successfully!" });
  }
);
