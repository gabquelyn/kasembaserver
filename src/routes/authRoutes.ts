import { Router } from "express";
import loginLimiter from "../middlewares/loginLimiter";
import { body, query } from "express-validator";
import verifyJWT from "../middlewares/verifyJWT";
import {
  loginController,
  refreshController,
  logoutController,
} from "../controllers/authControllers";
const router = Router();

router
  .route("/")
  .post(
    [
      body("email").isEmail().withMessage("Enter a valid email address"),
      body("password").notEmpty().withMessage("Password required"),
    ],
    loginLimiter,
    loginController
  );

router.route("/new").post([
  query("roles").notEmpty().escape().withMessage("No role selected"),
  body("email").isEmail().withMessage("Enter a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be of a minimum length of 8 characters"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password mismatch");
    }
  }),
]);
router.route("/refresh").get(verifyJWT, refreshController);

router.route("/logout").post(logoutController);

export default router;
