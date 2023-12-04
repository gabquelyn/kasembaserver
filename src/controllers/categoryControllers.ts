import Category from "../models/category";
import { Response, Request } from "express";
import expressAsyncHandler from "express-async-handler";
import aws from "aws-sdk";
import fs from "fs";

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

    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    const S3 = new aws.S3();
    const parsedSub: string[] = JSON.parse(sub_categories);
    const objectSubCategories: { name: string; image?: string }[] =
      parsedSub.map((name) => ({ name }));

    for (const file of req.files as Express.Multer.File[]) {
      for (const category of objectSubCategories) {
        if (file.fieldname === category.name) {
          const fileContent = fs.readFileSync(file.path);
          const awsRes = await S3.upload({
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: `images/${file.filename}`,
            Body: fileContent,
          }).promise();
          console.log(awsRes);
          category.image = `${file.filename}`;
          fs.unlinkSync(file.path);
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
    const foundCategory = await Category.findById(categoryId).exec();
    if (!foundCategory)
      return res
        .status(400)
        .json({ message: `Category of ${categoryId} does not exist` });
    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    const S3 = new aws.S3();
    if (sub_categories) {
      const subCategories: string[] = JSON.parse(sub_categories);
      const existingSubCategoriesNames = foundCategory.sub_categories.map(
        (sub) => sub.name
      );

      // newly added subcategories
      const objectSubCategories: { name: string; image?: string }[] =
        subCategories
          .filter((name) => !existingSubCategoriesNames.includes(name))
          .map((name) => ({ name }));

      for (const file of req.files as Express.Multer.File[]) {
        for (const category of objectSubCategories) {
          if (file.fieldname === category.name) {
            const fileContent = fs.readFileSync(file.path);
            const awsRes = await S3.upload({
              Bucket: process.env.AWS_S3_BUCKET as string,
              Key: `images/${file.filename}`,
              Body: fileContent,
            }).promise();
            console.log(awsRes);
            category.image = `${file.filename}`;
            fs.unlinkSync(file.path);
          }
        }
      }

      //work on removing the previous
      foundCategory.sub_categories.filter(
        (sub) => !subCategories.includes(sub.name)
      );

      for (const sub of objectSubCategories) {
        foundCategory.sub_categories.push(sub);
      }

      await foundCategory.save();
    }

    if (name) foundCategory.name = name;
    if (cost) foundCategory.cost = Number(cost);
    if (plan) foundCategory.plan = plan;
    await foundCategory.save();
    return res.status(200).json({
      message: `Category of ${foundCategory._id} updated sucessfully`,
    });
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
