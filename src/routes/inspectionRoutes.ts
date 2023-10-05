import verifyJWT from "../middlewares/verifyJWT";
import { Router } from "express";
import { body } from "express-validator";
import imageUpload from "../utils/imageUpload";
import {
  getInspectionController,
  createInspectionController,
} from "../controllers/inspectionControllers";

const router = Router();
router.use(verifyJWT);
router
  .route("/")
  .get(getInspectionController)
  .post([body()], imageUpload.array("photos"), createInspectionController);

export default router;
