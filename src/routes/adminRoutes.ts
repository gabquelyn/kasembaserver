import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import onlyAdmin from "../middlewares/onlyAdmin";
import { getUsersHandler } from "../controllers/usersControllers";
import {
  getCategoriesController,
  editCategoryController,
  deleteCategoryController,
  createCategoryController,
} from "../controllers/categoryControllers";
import { body } from "express-validator";

const router = Router();
router.use(verifyJWT, onlyAdmin);
router
  .route("/category")
  .get(getCategoriesController)
  .post(
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
  );

router
  .route("/category/:categoryId")
  .patch(editCategoryController)
  .delete(deleteCategoryController);

router.route("/u").get(getUsersHandler);

export default router;
