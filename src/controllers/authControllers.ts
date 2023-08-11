import User from "../models/user";
import { Response, Request, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";

// express async handler does the try catch and send errors to the custom error handler
interface loginReq {
  email: string;
  password: string;
}
export const loginController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { email, password }: loginReq = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });
    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) return res.status(401).json({ message: "Unauthorized" });
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) return res.send(401).json({ message: "Unauthorized" });

    // create the access token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          eamil: foundUser.email,
          roles: foundUser.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "30s" }
    );

    // create the refresh token
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET as string,

      { expiresIn: "1d" }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true, //only accessible through a web browser
      secure: true, //https
      sameSite: "none", // cross site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, //
    });

    return res.json({ accessToken });
  }
);

export const refreshController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(403).json({ message: "Unauthorized" });
    const refreshToken = cookies.jwt;
    // verify the refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      async (error: any, decoded: any) => {
        if (error) return res.status(403).json({ message: "Forbidden" });
        const foundUser = await User.findOne({ email: decoded?.email }).exec();
        if (!foundUser)
          return res.status(400).json({ message: "Unauthorized" });
        // create the access token
        const accessToken = jwt.sign(
          {
            UserInfo: {
              email : foundUser.email,
              roles: foundUser.roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: "30s" }
        );
        res.json(accessToken);
      }
    );
  }
);

export const logoutController = async (
  req: Request,
  res: Response
) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204) //no content;
  res.clearCookie("jwt", {
    httpOnly: true, //only accessible through a web browser
    secure: true, //https
    sameSite: "none", // cross site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //
  });
  res.json({ message: "Cookie cleared" });
};
