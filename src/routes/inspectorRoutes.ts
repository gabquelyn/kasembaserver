import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import onlyInspectors from "../middlewares/onlyInspectors";

import {
  acknowledgeInspectionController,
  getOverviewHandler,
  editAccountHandler,
  requestEditAccountHandler,
  getAccountController,
} from "../controllers/inspectorOnlyControllers";
const router = Router();
router.use(verifyJWT, onlyInspectors);
router
  .route("/acknowledge/:inspectionId")
  .post(acknowledgeInspectionController);

router.route("/overview").get(getOverviewHandler);
router.route("/account").post(editAccountHandler).get(getAccountController);
router.route("/account/reset").get(requestEditAccountHandler);

export default router;
