import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import onlyAdmin from "../middlewares/onlyInspectors";
import {
  getCategoriesController,
  editCategoryController,
  deleteCategoryController,
  createCategoryController,
} from "../controllers/categoryControllers";
import { body, query, param } from "express-validator";

const router = Router();
router.use(verifyJWT, onlyAdmin);
router
  .route("/category")
  .get(getCategoriesController)
  .post(
    [
      body("name").notEmpty().withMessage("Missing category name"),
      body("cost").notEmpty().withMessage("Missing category cost"),
      body("plan").notEmpty().withMessage("Missing category  plan"),
      body("sub_categories").custom((value, { req }) => {
        return Array.isArray(value);
      }),
    ],
    createCategoryController
  );

router
  .route("/category/:categoryId")
  .patch(editCategoryController)
  .delete(deleteCategoryController);

export default router;
