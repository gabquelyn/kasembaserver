import { Router } from "express";
import loginLimiter from "../middlewares/loginLimiter";
import { body, query, param } from "express-validator";
import verifyJWT from "../middlewares/verifyJWT";
import User from "../models/user";
import {
  loginController,
  refreshController,
  logoutController,
  signupController,
  updatePasswordController,
  forgotPasswordController,
} from "../controllers/authControllers";
const router = Router();

router
  .route("/")
  .post(
    loginLimiter,
    [
      body("email").trim().isEmail().withMessage("Enter a valid email address"),
      body("password").notEmpty().withMessage("Password required"),
    ],
    loginController
  );

router.route("/signup").post(
  [
    query("roles")
      .custom((value, { req }) => {
        const roles = ["inspector", "client", "administrator"];
        return roles.includes(value);
      })
      .withMessage("Invalid roles"),
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
router.route("/update").post(
  verifyJWT,
  [
    body("confirmPassword")
      .custom(async (value, { req }) => {
        return value === req.body.password;
      })
      .withMessage("Paswword mismatch!"),
  ],
  updatePasswordController
);
router
  .route("/:userId/verify/:token")
  .get([
    param("userId").notEmpty(),
    param("token").notEmpty().withMessage("Missing required params"),
  ]);

router
  .route("/forgot")
  .post(
    [body("email").notEmpty().isEmail().withMessage("invalid email address")],
    forgotPasswordController
  );

router.route("/reset/:token").post([
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be of a minimum length of 8 characters"),
  body("confirmPassword")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords mismatch"),
], );

export default router;
