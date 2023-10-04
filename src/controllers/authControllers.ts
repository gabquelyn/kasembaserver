import User from "../models/user";
import { Response, Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import sendMail from "../utils/sendMail";
import crypto from "crypto";
import Token from "../models/token";
import generateRandomToken from "../utils/generateOTP";
// express async handler does the try catch and send errors to the custom error handler
interface CustomRequest extends Request {
  email?: string;
  roles?: string;
}

export const signupController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array() });
    const { roles } = req.params;
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      roles,
    });

    if (!newUser)
      return res.status(400).json({ message: "Invalid data recieved!" });

    // verification token
    const verificationToken = await Token.create({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    const url = `${process.env.BASE_URL}/auth/${newUser._id}/verify/${verificationToken.token}`;

    // send the verification url via email
    await sendMail(newUser.email, "Verify email", `<p>${url}</p>`);
    res
      .status(201)
      .json({ message: "Email sent to your account please verify" });
  }
);

export const loginController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array() });
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email }).lean().exec();
    if (!foundUser) return res.status(401).json({ message: "Unauthorized" });
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) return res.send(401).json({ message: "Unauthorized" });

    if (!foundUser.verified) {
      const existingToken = await Token.findOne({
        userId: foundUser._id,
      }).exec();

      if (!existingToken) {
        const verificationToken = await Token.create({
          userId: foundUser._id,
          token: crypto.randomBytes(32).toString("hex"),
        });

        const url = `${process.env.BASE_URL}/auth/${foundUser._id}/verify/${verificationToken.token}`;
        await sendMail(foundUser.email, "Verify email", `<p>${url}</p>`);
      }

      res
        .status(400)
        .send({ message: "Email sent to your account please verify" });
    }

    // create the access token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: foundUser.email,
          roles: foundUser.roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" }
    );

    // create the refresh token
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET as string,

      { expiresIn: "1d" }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true, //only accessible through a web browser
      secure: false, //will be set to https at production
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
              email: foundUser.email,
              roles: foundUser.roles,
            },
          },
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: "30s" }
        );
        res.json({ accessToken });
      }
    );
  }
);

export const logoutController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //no content;
    res.clearCookie("jwt", {
      httpOnly: true, //only accessible through a web browser
      secure: false, //http for development only
      sameSite: "none", // cross site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000, //
    });
    res.json({ message: "Cookie cleared" });
  }
);

export const updatePasswordController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(404).json({ message: errors.array() });
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const foundUser = await User.findOne({
      email: (req as CustomRequest).email,
    }).exec();
    if (!foundUser) return res.status(404).json({ message: "User not found!" });
    foundUser.password = hashedPassword;
    await foundUser.save();
    return res.status(200).json({ message: "Password updated successfully!" });
  }
);

export const verifyTokenHandler = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(404).json({ message: errors.array() });
    const { userId, token } = req.params;
    const user = await User.findById(userId).exec();
    if (!user) return res.status(400).send({ message: "Invalid link" });
    const existingToken = await Token.findOne({
      userId: user._id,
      token,
    });
    if (!existingToken)
      return res.status(400).send({ message: "invalid link" });
    user.verified = true;
    await user.save();
    await existingToken.deleteOne();
    res.status(200).send({ message: "Email verified successfully!" });
  }
);

export const forgotPasswordController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array() });
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found!" });
    const existingToken = await Token.findOne({ userId: user._id }).exec();
    existingToken?.deleteOne();

    const otp = await Token.create({
      token: crypto.randomBytes(32).toString("hex"),
      userId: user._id,
    });

    const url = `${process.env.BASE_URL}/auth/reset/${otp.token}`;

    // send the verification url via email
    await sendMail(user.email, "Reset password", `<p>${url}</p>`);
    return res.status(200).json({ message: "Recovery code sent to email" });
  }
);

export const resetPasswordController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array() });
    const { token } = req.params;
    const { password } = req.body;
    const existingToken = await Token.findOne({ token }).exec();
    if (!existingToken)
      return res.status(400).send({ message: "invalid link" });
    const user = await User.findById(existingToken.userId).exec();
    const hashedPassword = await bcrypt.hash(password, 10);
    if (user) {
      user.password === hashedPassword;
      await user.save();
    }
    await existingToken.deleteOne();
    return res.status(200).json({ message: "password updated successfully!" });
  }
);
