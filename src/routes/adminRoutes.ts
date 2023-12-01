import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import onlyAdmin from "../middlewares/onlyAdmin";
import {
  getClientHandler,
  getClientsHandler,
} from "../controllers/usersControllers";
import {
  assignController,
  publishReportsController,
  getAccountController,
  getReportController,
} from "../controllers/adminOnlyControllers";
import {
  getCategoriesController,
  editCategoryController,
  deleteCategoryController,
  createCategoryController,
} from "../controllers/categoryControllers";
import imageUpload from "../utils/imageUpload";
const router = Router();
router.use(verifyJWT);

router
  .route("/category")
  .get(getCategoriesController)
  .post(onlyAdmin, imageUpload.any(), createCategoryController)
  .patch(onlyAdmin, imageUpload.any(), editCategoryController);
router
  .route("/category/:categoryId")
  .delete(onlyAdmin, deleteCategoryController);

router.route("/u").get(getClientsHandler);
router.route("/account/:accountId").get(getAccountController);
router.route("/u/:userId").get(getClientHandler);
router.route("/assign/:inspectorId/:inspectionId").post(assignController);
router.route("/reports/:reportId").get(getReportController);
router.route("/publish/:reportId").get(publishReportsController);
export default router;
