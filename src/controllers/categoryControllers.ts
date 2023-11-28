import Category from "../models/category";
import { Response, Request } from "express";
import expressAsyncHandler from "express-async-handler";

export const getCategoriesController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const all_categories = await Category.find({}).lean().exec();
    res.status(200).json([...all_categories]);
  }
);

export const createCategoryController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { name, sub_categories, cost, plan } = req.body;

    if (!name || !sub_categories || !cost) {
      return res.status(400).json({ message: "Missing reqired parameters" });
    }
    const parsedSub: string[] = JSON.parse(sub_categories);
    const objectSubCategories: { name: string; image?: string }[] =
      parsedSub.map((name) => ({ name }));

    for (const file of req.files as Express.Multer.File[]) {
      for (const category of objectSubCategories) {
        if (file.fieldname === category.name) {
          category.image = `images/${file.filename}`;
        }
      }
    }

    const newCategory = await Category.create({
      name,
      cost: Number(cost),
      sub_categories: objectSubCategories,
      plan,
    });
    if (newCategory)
      return res.status(201).json({ message: "new category created" });
    return res.status(400).json({ message: "unable to create new category" });
  }
);

export const editCategoryController = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { name, sub_categories, cost, plan, categoryId } = req.body;
    const category = await Category.findById(categoryId).exec();
    if (!category)
      return res
        .status(400)
        .json({ message: `Category of ${categoryId} does not exist` });

    if (sub_categories) {
      const subCategories: string[] = JSON.parse(sub_categories);
      const existingSubCategoriesNames = category.sub_categories.map(
        (sub) => sub.name
      );

      const objectSubCategories: { name: string; image?: string }[] =
        subCategories
          .filter((name) => !existingSubCategoriesNames.includes(name))
          .map((name) => ({ name }));
      for (const file of req.files as Express.Multer.File[]) {
        for (const category of objectSubCategories) {
          if (file.fieldname === category.name) {
            category.image = `images/${file.filename}`;
          }
        }
      }

      for (const sub of objectSubCategories) {
        category.sub_categories.push(sub);
      }
      await category.save();
    }

    if (name) category.name = name;
    if (cost) category.cost = Number(cost);
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
