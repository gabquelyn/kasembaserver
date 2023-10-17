import Category from "../models/category";
import { Response, Request } from "express";
import expressAsyncHandler from "express-async-handler";
import { validationResult } from "express-validator";

export const getCategoriesController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const all_categories = await Category.find({}).lean().exec();
    res.status(200).json({ ...all_categories });
  }
);

export const createCategoryController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array() });
    const { name, sub_categories, cost, plan } = req.body;
    const newCategory = await Category.create({
      name,
      cost,
      sub_categories,
      plan,
    });
    if (newCategory) res.status(201).json({ message: "new category created" });
    else res.status(400).json({ message: "unable to create new category" });
  }
);

export const editCategoryController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty())
      return res.status(400).json({
        message: errors.array(),
      });
    const { categoryId } = req.params;
    const { name, sub_categories, cost, plan } = req.body;
    const category = await Category.findById(categoryId).exec();
    if (!category)
      return res
        .status(400)
        .json({ message: `Category of ${categoryId} does not exist` });
    if (name) category.name = name;
    if (sub_categories) category.sub_categories = sub_categories;
    if (cost) category.cost = cost;
    if (plan) category.plan = plan;
    await category.save();
    return res
      .status(200)
      .json({ message: `Category of ${category._id} updated sucessfully` });
  }
);

export const deleteCategoryController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { categoryId } = req.params;
    await Category.findByIdAndDelete(categoryId);
    res
      .status(200)
      .json({ message: `Category of ${categoryId} deleted successfully!` });
  }
);
