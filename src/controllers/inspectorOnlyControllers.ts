import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { Types } from "mongoose";
import Inspection from "../models/insepction";
import User from "../models/user";
import Invoice from "../models/invoice";
import Token from "../models/token";
import crypto from "crypto";
import sendMail from "../utils/sendMail";
import Account from "../models/account";
interface CustomRequest extends Request {
  email: string;
  roles: string;
  userId: string;
}
export const acknowledgeInspectionController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { inspectionId } = req.params;
    const inspection = await Inspection.findById(inspectionId).exec();
    if (!inspection)
      return res.status(404).json({ message: "Inspection does not exist" });
    const inspectionObjectId: Types.ObjectId = new Types.ObjectId(inspectionId);
    const inspector = await User.findById((req as CustomRequest).userId)
      .lean()
      .exec();

    const belongsto = inspector?.inspections.some((inspId) =>
      inspId.equals(inspectionObjectId)
    );

    if (!belongsto)
      return res
        .status(400)
        .json({ message: "Cannot interact with inspection" });

    inspection.status = "acknowledged";
    await inspection.save();
    return res.status(200).json({ message: "Inspection acknowledged!" });
  }
);

export const getOverviewHandler = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    let total = 0;
    const inspector = await User.findById((req as CustomRequest).userId)
      .lean()
      .exec();
    if (!inspector)
      return res.status(404).json({ message: "No inspector found!" });

    const completedPayments = await Invoice.find({
      inspectorId: (req as CustomRequest).userId,
      status: "paid",
    })
      .lean()
      .exec();

    completedPayments.forEach((payment) => {
      total += payment.amount;
    });

    return res.status(200).json({
      reports: inspector.reports.length,
      balance: inspector.balance,
      total,
    });
  }
);

export const requestEditAccount = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const userId = (req as CustomRequest).userId;
    const existingToken = await Token.findOne({
      userId,
    }).exec();

    if (!existingToken) {
      const verificationToken = await Token.create({
        userId,
        token: crypto.randomBytes(32).toString("hex"),
      });
      const url = `${process.env.FRONTEND_URL}/account/${userId}${verificationToken.token}`;

      await sendMail(
        (req as CustomRequest).email,
        "Reset Details",
        "Reset your bank details",
        "Please click on the button to reset your bank details",
        "Reset bank details",
        url,
        "credit.png"
      );
    }

    return res
      .status(200)
      .json({ message: "Link to reset account sent to email" });
  }
);

export const editAccount = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { userId, token } = req.params;
    const { name, bank, number } = req.body;
    const user = await User.findById(userId).lean().exec();
    if (!user) return res.status(400).send({ message: "Invalid link" });
    const existingToken = await Token.findOne({
      userId: user._id,
      token,
    });
    if (!existingToken)
      return res.status(400).send({ message: "invalid link" });

    const existingAccountDetails = await Account.findOne({
      userId,
    }).exec();
    if (existingAccountDetails) {
      existingAccountDetails.name = name;
      existingAccountDetails.bank = bank;
      existingAccountDetails.number = number;
      await existingAccountDetails.save();
      return res.status(200).json({ message: "Account updated!" });
    }

    const newAccount = await Account.create({
      userId,
      name,
      bank,
      number,
    });

    return res.status(201).json({ message: `${newAccount._id}` });
  }
);
