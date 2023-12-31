import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import {
  payController,
  confirmPaymentController,
} from "../controllers/paymentControllers";
const router = Router();
router.route("/:inspectionId").post(verifyJWT, payController);
router
  .route("/check-payment-status/:inspectionId")
  .get(confirmPaymentController);
export default router;
