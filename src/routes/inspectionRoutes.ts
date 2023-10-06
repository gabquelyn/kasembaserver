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
  .post(
    [
      body("type").trim().notEmpty().withMessage("inspection type is missing"),
      body("color").notEmpty().withMessage("Vehicle color is required"),
      body("vin").trim().notEmpty().withMessage("VIN is required"),
      body("country").notEmpty().withMessage("Country is required"),
      body("city").notEmpty().withMessage("city is required"),
      body("address").notEmpty().withMessage("address is required"),
      body("zip_code").notEmpty().withMessage("zip code is required"),
      body("category").custom((value, { req }) => {
        return Array.isArray(value);
      }),
    ],
    imageUpload.array("photos"),
    createInspectionController
  );

export default router;
