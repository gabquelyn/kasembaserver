import expressAsyncHandler from "express-async-handler";
import User from "../models/user";
import { Request, Response } from "express";
import aws from "aws-sdk";
import fs from "fs";
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
      email,
    } = foundUser;
    return res.status(200).json({
      email,
      avatar,
      firstname,
      lastname,
      phone_number,
      country,
      zip_code,
      city,
    });
  }
);

export const editProfileController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    // set up aws to handle file upload
    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    const S3 = new aws.S3();
    const foundUser = await User.findOne({
      email: (req as CustomRequest).email,
    }).exec();
    const { firstname, lastname, phone_number, country, zip_code, city } =
      req.body;
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    if (req.file) {
      const fileContent = fs.readFileSync(req.file.path);
      const awsRes = await S3.upload({
        Bucket: process.env.AWS_S3_BUCKET as string,
        Key: `images/${req.file.filename}`,
        Body: fileContent,
      }).promise();
      console.log(awsRes);

      // save the file key
      foundUser.avatar = `images/${req.file.filename}`;
      // delete previous file
      fs.unlinkSync(req.file.path);
    }

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
