import expressAsyncHandler from "express-async-handler";
import { Response, Request } from "express";
import Invoice from "../models/invoice";
import User from "../models/user";
interface CustomRequest extends Request {
  roles: string;
  email: string;
  userId: string;
}
export const generateInvoice = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const inspector = await User.findById((req as CustomRequest).userId).exec();
    if (!inspector) return res.status(404);
    if (inspector.balance < 100) {
      return res
        .status(400)
        .json({ message: "Withdrawal request from at least $100" });
    }

    const request = await Invoice.create({
      inspectorId: (req as CustomRequest).userId,
      amount: inspector.balance,
    });
    if (!request) res.status(400);
    inspector.balance = 0;
    await inspector.save();
    return res.status(201).json({ message: "Payment request sent" });
  }
);

export const getInvoices = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const role = (req as CustomRequest).roles;
    const inspectorId = (req as CustomRequest).userId;
    if (role === "administrator") {
      const invoices = await Invoice.find({})
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      return res.status(200).json([...invoices]);
    }
    const invoices = await Invoice.find({ inspectorId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return res.status(200).json([...invoices]);
  }
);

export const getInvoice = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId).lean().exec();
    if (!invoice) return res.status(404);
    return res.status(200).json({ ...invoice });
  }
);

export const completeInvoice = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId).exec();
    if (!invoice) return res.status(404);
    invoice.status = "paid";
    await invoice.save();
    return res.status(200).json({ message: `${invoiceId} marked as paid` });
  }
);
