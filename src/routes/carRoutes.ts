import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import {
  getCarsControllers,
  postCarsController,
} from "../controllers/carsCoontroller";
import imageUpload from "../utils/imageUpload";
const router = Router();
router.use(verifyJWT);
router
  .route("/")
  .get(getCarsControllers)
  .post(imageUpload.array("car"), postCarsController);
export default router;
