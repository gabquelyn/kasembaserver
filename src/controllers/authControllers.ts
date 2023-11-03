import User from "../models/user";
import { Response, Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import sendMail from "../utils/sendMail";
import crypto from "crypto";
import Token from "../models/token";

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
    const { email, password, roles } = req.body;

    const existing = await User.findOne({ email }).lean().exec();
    if (existing)
      return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      roles: roles ? "inspector" : "client",
    });

    if (!newUser)
      return res.status(400).json({ message: "Invalid data recieved!" });

    // verification token
    const verificationToken = await Token.create({
      userId: newUser._id,
      token: crypto.randomBytes(32).toString("hex"),
    });

    const url = `${process.env.FRONTEND_URL}/auth/${newUser._id}/verify/${verificationToken.token}`;
    // send the verification url via email
    await sendMail(
      newUser.email,
      "Verify email",
      "Verify your email address",
      "Please click on the button to confirm your email address and activate your account",
      "Confirm email",
      url,
      "mail.png"
    );
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
    if (!passwordMatch)
      return res.status(401).json({ message: "Unauthorized" });

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

        await sendMail(
          foundUser.email,
          "Verify email",
          "Verify your email address",
          "Please click on the button to confirm your email address and activate your account",
          "Confirm email",
          url,
          "mail.png"
        );
      }

      return res
        .status(400)
        .json({ message: "Email sent to your account please verify" });
    }

    // create the access token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: foundUser.email,
          roles: foundUser.roles,
          userId: foundUser._id,
        },
      },
      String(process.env.ACCESS_TOKEN_SECRET),
      { expiresIn: "1h" }
    );

    // create the refresh token
    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET as string,

      { expiresIn: "1d" }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken, roles: foundUser.roles });
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
              userId: foundUser._id,
            },
          },
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: "1h" }
        );
        res.json({ accessToken, roles: foundUser.roles });
      }
    );
  }
);

export const logoutController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //no content;
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
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

export const verifyTokenController = expressAsyncHandler(
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

    const url = `${process.env.FRONTEND_URL}/auth/reset/${otp.token}`;

    // send the verification url via email
    await sendMail(
      user.email,
      "Reset Password",
      "Reset Password to access your account",
      "Please click on the button to update your password and regain access to your account",
      "Reset Password",
      url,
      "reset.png"
    );
    return res
      .status(200)
      .json({ message: "Recovery mail sent successfully!" });
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
      user.password = hashedPassword;
      await user.save();
    }
    await existingToken.deleteOne();
    return res.status(200).json({ message: "password updated successfully!" });
  }
);
