import { Response, Request, NextFunction } from "express";

interface CustomRequest extends Request {
  roles: string;
}

export default async function onlyAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if ((req as CustomRequest).roles !== "administrator") {
    return res.status(403).json({ message: "unauthorized, admin only" });
  }
  next();
}

