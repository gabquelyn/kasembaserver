import { Router } from "express";
import { getReportsController } from "../controllers/reportsControllers";
import verifyJWT from "../middlewares/verifyJWT";
const router = Router();
router.route("/").get(verifyJWT, getReportsController);

export default router;
