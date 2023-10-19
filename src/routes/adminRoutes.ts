import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import onlyAdmin from "../middlewares/onlyAdmin";
import { getUsersHandler } from "../controllers/usersControllers";
import { assignController } from "../controllers/adminOnlyControllers";
import {
  getCategoriesController,
  editCategoryController,
  deleteCategoryController,
  createCategoryController,
} from "../controllers/categoryControllers";
import { body } from "express-validator";

const router = Router();
router.use(verifyJWT);
router
  .route("/category")
  .get(getCategoriesController)
  .post(
    onlyAdmin,
    [
      body("name").trim().notEmpty().withMessage("Missing category name"),
      body("cost").trim().notEmpty().withMessage("Missing category cost"),
      body("plan").trim().notEmpty().withMessage("Missing category  plan"),
      body("sub_categories")
        .custom((value, { req }) => {
          return Array.isArray(value) && value.length !== 0;
        })
        .withMessage("Invalid sub-categories"),
    ],
    createCategoryController
  )
  .patch(
    onlyAdmin,
    [
      body("name").trim().notEmpty().withMessage("Missing category name"),
      body("cost").trim().notEmpty().withMessage("Missing category cost"),
      body("plan").trim().notEmpty().withMessage("Missing category  plan"),
      body("sub_categories")
        .custom((value, { req }) => {
          return Array.isArray(value) && value.length !== 0;
        })
        .withMessage("Invalid sub-categories"),
    ],
    editCategoryController
  )
  .delete(onlyAdmin, deleteCategoryController);

router
  .route("/category/:categoryId")
  .patch(editCategoryController)
  .delete(deleteCategoryController);

router.route("/u").get(getUsersHandler);
router.route("/assign/:inspectorId/:inspectionId").post(assignController);
router.route("/publish/:reportId");
export default router;
