import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Session from "../models/session";
import Stripe from "stripe";
import Inspection from "../models/insepction";
import User from "../models/user";
import Category from "../models/category";
import { Types } from "mongoose";
import { checkDistance } from "../utils/findLocation";
import sendMail from "../utils/sendMail";
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
    // if (inspection.paid)
    //   return res.status(400).json({ message: "Inspection already paid for" });

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
      success_url: `${process.env.FRONTEND_URL}/confirmation/${inspectionId}`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    // update the paid price
    inspection.price = session.amount_total! / 100;
    await inspection.save();

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
    const inspection = await Inspection.findById(inspectionId).exec();
    if (!inspection) {
      return res.status(400).json({ message: "not found" });
    }
    if (inspection.paid) return res.status(400);

    const stripeSession = await Session.findOne({ inspectionId }).exec();
    if (!stripeSession) return res.status(400);
    const _session = await stripe.checkout.sessions.retrieve(
      stripeSession.sessionId
    );

    if (_session.payment_status === "paid") {
      inspection.paid = true;
      inspection.save();
    }

    // assign inspection to the inspector only
    let _distance: number = Infinity;
    let inspectorObjectId: Types.ObjectId = new Types.ObjectId(4);

    const allInspectors = await User.find({ roles: "inspector" }).lean().exec();
    if (allInspectors.length === 0) {
      // return res.status(404).json({ message: "no available inspectors" });
      // inform admin
    }
    for (const inspector of allInspectors) {
      if (inspector.zip_code) {
        const distanceInKm = await checkDistance(
          Number(inspector.zip_code),
          inspection.position!
        );
        if (distanceInKm < _distance) {
          _distance = distanceInKm;
          inspectorObjectId = inspector._id;
        }
      }
    }

    const closestInspector = await User.findById(inspectorObjectId).exec();
    if (closestInspector) {
      closestInspector.inspections.push(new Types.ObjectId(inspectionId));
      await closestInspector.save();
      // notify the inspector
      const url = `${process.env.FRONTEND_URL}/inspector/management`;
      await sendMail(
        closestInspector.email,
        "Acknowledge Inspection",
        "A new Inspection has been assigned to you",
        "Please click on the button to see and acknowledge inspection",
        "Go to inspection",
        url,
        "repair.png"
      );
    }

    inspection.distance = _distance;
    await inspection.save();

    res.status(200).json({ ..._session });
  }
);
