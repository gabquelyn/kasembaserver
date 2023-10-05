import verifyJWT from "../middlewares/verifyJWT";
import { Router } from "express";
import {
  getProfileController,
  editProfileController,
} from "../controllers/profileController";
import imageUpload from "../utils/imageUpload";

const router = Router();
router.use(verifyJWT);
router
  .route("/")
  .get(getProfileController)
  .post(imageUpload.single("avatar"), editProfileController);

export default router;