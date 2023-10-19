import verifyJWT from "../middlewares/verifyJWT";
import { NextFunction, Router, Request, Response } from "express";
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
  .post(imageUpload.array("photos"), createInspectionController);

export default router;
