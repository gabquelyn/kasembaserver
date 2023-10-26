import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import onlyInspectors from "../middlewares/onlyInspectors";

import {
  acknowledgeInspectionController,
  getOverviewHandler,
} from "../controllers/inspectorOnlyControllers";
const router = Router();
router.use(verifyJWT, onlyInspectors);
router
  .route("/acknowledge/:inspectionId")
  .post(acknowledgeInspectionController);

router.route("/overview").get(getOverviewHandler);
export default router;
