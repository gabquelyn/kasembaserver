import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/user";
export const getClientsHandler = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const clients = await User.find({}).sort({ createdAt: -1 }).lean().exec();
    return res.status(200).json([...clients]);
  }
);

export const getClientHandler = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { userId } = req.params;
    const client = await User.findById(userId).lean().exec();
    if (!client) return res.status(404);
    return res.status(200).json({ ...client });
  }
);
