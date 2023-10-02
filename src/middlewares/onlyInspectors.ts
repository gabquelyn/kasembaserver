import { Response, Request, NextFunction } from "express";

interface CustomRequest extends Request {
  roles: string;
}

export default async function onlyInspectors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if ((req as CustomRequest).roles !== "inspector") {
    return res.status(403).json({ message: "unauthorized" });
  }
  next();
}
