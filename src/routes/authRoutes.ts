import { Router } from "express";
import loginLimiter from "../middlewares/loginLimiter";
import { body, query } from "express-validator";
import verifyJWT from "../middlewares/verifyJWT";
import User from "../models/user";
import {
  loginController,
  refreshController,
  logoutController,
  signupController,
} from "../controllers/authControllers";
const router = Router();

router
  .route("/")
  .post(
    loginLimiter,
    [
      body("email").isEmail().withMessage("Enter a valid email address"),
      body("password").notEmpty().withMessage("Password required"),
    ],
    loginController
  );

router.route("/signup").post(
  [
    query("roles").custom((value, { req }) => {
      const roles = ["inspector", "client"];
      return roles.includes(value);
    }).withMessage("Invalid roles"),
    body("email").isEmail().withMessage("Enter a valid email address"),
    body("email")
      .custom(async (value, { req }) => {
        const existing = await User.findOne({ email: value }).lean().exec();
        if (existing) throw new Error("Email already in use");
      })
      .withMessage("Email already in use"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be of a minimum length of 8 characters"),
    body("confirmPassword")
      .custom((value, { req }) => {
        return value === req.body.password;
      })
      .withMessage("Passwords mismatch"),
  ],
  signupController
);
router.route("/refresh").get(verifyJWT, refreshController);

router.route("/logout").post(logoutController);

export default router;
