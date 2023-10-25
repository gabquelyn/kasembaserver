import { Router, Response, Request, NextFunction } from "express";
import {
  getReportsController,
  createReportsController,
} from "../controllers/reportsControllers";
import reportFields from "../utils/reportFields";
import verifyJWT from "../middlewares/verifyJWT";
import onlyInspectors from "../middlewares/onlyInspectors";
import imageUpload from "../utils/imageUpload";
const router = Router();
router.use(verifyJWT);
router
  .route("/")
  .get(getReportsController)
  .post(
    onlyInspectors,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const dynamicFields = await reportFields();

        // applying the middleware
        imageUpload.fields(dynamicFields)(req, res, (error) => {
          if (error) {
            return res.status(400).json({ error: "File upload failed" });
          }
          createReportsController(req, res, next);
        });
      } catch (err) {
        console.log(err);
      }
    }
  );

export default router;
