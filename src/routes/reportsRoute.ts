import { Router } from "express";
import {
  getReportsController,
  createReportsController,
  getReportController,
  getInspectionReport,
} from "../controllers/reportsControllers";
import verifyJWT from "../middlewares/verifyJWT";
import onlyInspectors from "../middlewares/onlyInspectors";
const router = Router();
router
  .route("/")
  .get(verifyJWT, getReportsController)
  .post(verifyJWT, onlyInspectors, createReportsController);
router.route("/inspection/:inspectionId").get(verifyJWT, getInspectionReport);
router.route("/:reportId").get(getReportController);

export default router;
