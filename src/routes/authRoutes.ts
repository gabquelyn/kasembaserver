import { Router } from "express";
import loginLimiter from "../middlewares/loginLimiter";
import { body, param } from "express-validator";
import verifyJWT from "../middlewares/verifyJWT";

import {
  loginController,
  refreshController,
  logoutController,
  signupController,
  updatePasswordController,
  forgotPasswordController,
  verifyTokenController,
  resetPasswordController,
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

router
  .route("/signup")
  .post(
    [
      body("email").isEmail().withMessage("Enter a valid email address"),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be of a minimum length of 8 characters"),
    ],
    signupController
  );
router.route("/refresh").get(refreshController);

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
  .get(
    [
      param("userId").notEmpty(),
      param("token").notEmpty().withMessage("Missing required params"),
    ],
    verifyTokenController
  );

router
  .route("/forgot")
  .post(
    [body("email").notEmpty().isEmail().withMessage("invalid email address")],
    forgotPasswordController
  );

router.route("/reset/:token").post(
  [
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be of a minimum length of 8 characters"),
    body("confirmPassword")
      .custom((value, { req }) => {
        return value === req.body.password;
      })
      .withMessage("Passwords mismatch"),
  ],
  resetPasswordController
);

export default router;
