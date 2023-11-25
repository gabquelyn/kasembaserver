import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import onlyInspectors from "../middlewares/onlyInspectors";
import { body } from "express-validator";
import {
  acknowledgeInspectionController,
  getOverviewHandler,
  editAccountHandler,
  requestEditAccountHandler,
  getAccountController,
} from "../controllers/inspectorOnlyControllers";

const router = Router();
router
  .route("/account")
  .post(
    [
      body("bank").notEmpty(),
      body("name").notEmpty(),
      body("number")
        .notEmpty()
        .isNumeric()
        .isLength({ min: 10, max: 10 })
        .withMessage("missing required details"),
    ],
    editAccountHandler
  );
router.use(verifyJWT, onlyInspectors);
router
  .route("/acknowledge/:inspectionId")
  .post(acknowledgeInspectionController);
router.route("/account").get(getAccountController);
router.route("/overview").get(getOverviewHandler);
router.route("/account/reset").get(requestEditAccountHandler);

export default router;
