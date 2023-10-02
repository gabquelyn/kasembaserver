import { Response, Request, NextFunction } from "express";

interface CustomRequest extends Request {
  roles: string;
}

export default async function (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  if (req.roles !== "administrator") {
    return res.status(403).json({ message: "unauthorized" });
  }
  next();
}
