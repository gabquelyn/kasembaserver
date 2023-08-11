import { Router } from "express";
import loginLimiter from "../middlewares/loginLimiter";
import {
  loginController,
  refreshController,
  logoutController,
} from "../controllers/authControllers";
const router = Router();

router.route("/").post(loginLimiter, loginController);

router.route("/refresh").get(refreshController);

router.route("/logout").post(logoutController);

export default router;
