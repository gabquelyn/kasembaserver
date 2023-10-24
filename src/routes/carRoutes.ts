import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import {
  getCarsControllers,
  postCarsController,
  getCarController,
} from "../controllers/carsCoontroller";
import imageUpload from "../utils/imageUpload";
const router = Router();
router.use(verifyJWT);
router
  .route("/")
  .get(getCarsControllers)
  .post(imageUpload.array("car"), postCarsController);

router.route("/:carId").get(getCarController);
export default router;
