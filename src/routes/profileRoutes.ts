import verifyJWT from "../middlewares/verifyJWT";
import { Router } from "express";
import { v4 as uuid } from "uuid";
import multer, { diskStorage } from "multer";
import {
  getProfileController,
  editProfileController,
} from "../controllers/profileController";

const avatarUpload = multer({
  storage: diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/avatar");
    },
    filename: function (req, file, cb) {
      cb(null, uuid() + "-" + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    )
      cb(null, true);
    else cb(null, false);
  },
});

const router = Router();
router.use(verifyJWT);
router
  .route("/profile")
  .get(getProfileController)
  .post(avatarUpload.single("avatar"), editProfileController);
