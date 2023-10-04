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
    return res
      .status(200)
      .json({ message: { ...foundUser.profile, email: foundUser.email } });
  }
);

export const editProfileController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const foundUser = await User.findOne({
      email: (req as CustomRequest).email,
    }).exec();
    const { firstname, lastname, phone_number, country, zip_code, city } =
      req.body;
    if (!foundUser?.profile)
      return res.status(400).json({ message: "USer not found" });

    if (req.file) foundUser.profile.avatar = req.file?.path;
    if (firstname) foundUser.profile.firstname = firstname;
    if (lastname) foundUser.profile.lastname = lastname;
    if (phone_number) foundUser.profile.phone_number = phone_number;
    if (country) foundUser.profile.country = country;
    if (zip_code) foundUser.profile.zip_code = zip_code;
    if (city) foundUser.profile.city = city;
    await foundUser.save();
    return res.status(201).json({ message: "Updated status successfully!" });
  }
);
