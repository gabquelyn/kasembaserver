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
  .post(
    (req: Request, res: Response, next: NextFunction) => {
      const {
        price,
        country,
        city,
        address,
        zip_code,
        selectedCategories,
        vin,
        color,
        description
      } = req.body;
      if (
        !price ||
        !country ||
        !city ||
        !address ||
        !zip_code ||
        selectedCategories.length === 0 ||
        !vin ||
        !color ||
        !description
      ) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      next();
    },
    imageUpload.array("photos"),
    createInspectionController
  );

export default router;
