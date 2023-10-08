import { Router, Request, Response, NextFunction } from "express";
import {
  getReportsController,
  createReportsController,
} from "../controllers/reportsControllers";
import verifyJWT from "../middlewares/verifyJWT";
import onlyInspectors from "../middlewares/onlyInspectors";
const router = Router();
router
  .route("/")
  .get(verifyJWT, getReportsController)
  .post(onlyInspectors, createReportsController);

export default router;
