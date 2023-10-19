import multer, { diskStorage } from "multer";
import { v4 as uuid } from "uuid";

const imageUpload = multer({
  storage: diskStorage({
    destination: function (req, file, cb) {
      cb(null, "images");
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

export default imageUpload;
