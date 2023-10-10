import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Session from "../models/session";
import Stripe from "stripe";
import Inspection from "../models/insepction";
import Category from "../models/category";

export const payController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2023-08-16",
      appInfo: { name: "Karsemba" },
    });
    const { inspectionId } = req.params;
    const inspection = await Inspection.findById(inspectionId).exec();
    if (!inspection)
      return res.status(400).json({ message: "Inspection not found!" });
    if (inspection.paid)
      return res.status(400).json({ message: "Inspection already paid for" });

    const line_items = await Promise.all(
      inspection.category.map(async (id) => {
        const data = await Category.findById(id).lean().exec();
        if (data) {
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: data.name,
              },
              unit_amount: data.cost * 100,
            },
            quantity: 1,
          };
        }
      })
    );

    const nonUndefinedLineItems = line_items.filter(
      (item): item is NonNullable<typeof item> => item !== undefined
    );

    const session = await stripe.checkout.sessions.create({
      line_items: nonUndefinedLineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/confirmation`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    // check if any session existed before
    const previousSession = await Session.findOne({ inspectionId }).exec();
    if (previousSession) await previousSession.deleteOne();
    // create a new session
    await Session.create({
      sessionId: session.id,
      inspectionId,
    });

    // return res.redirect(303, session.url!);
    return res.status(200).json({ url: session.url });
  }
);

export const confirmPaymentController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
      apiVersion: "2023-08-16",
      appInfo: { name: "Karsemba" },
    });
    const { inspectionId } = req.params;
    const stripeSession = await Session.findOne({ inspectionId }).exec();
    if (!stripeSession) return res.status(400);
    const _session = await stripe.checkout.sessions.retrieve(
      stripeSession.sessionId
    );
    if (_session.payment_status === "paid") {
      const inspection = await Inspection.findById(inspectionId).exec();
      if (inspection) {
        inspection.paid = true;
        inspection.save();
      }
    }
    res.status(200).json({ _session });
  }
);
