import multer, { diskStorage } from "multer";
import { v4 as uuid } from "uuid";
import path from "path";
const imageUpload = multer({
  storage: diskStorage({
    destination: function (req, file, cb) {
      console.log(path.join(__dirname, "..", "..", "images"));
      cb(null, path.join(__dirname, "..", "..", "images"))
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
