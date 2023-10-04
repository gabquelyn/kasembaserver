import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/user";
export const getUsersHandler = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const clients = await User.find({ roles: "client" }).lean().exec();
    const inspectors = await User.find({ roles: "inspector" }).lean().exec();
    return res.status(200).json({ message: { clients, inspectors } });
  }
);
