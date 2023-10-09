import Category from "../models/category";
import { Field } from "multer";
export default async function reportFields() {
  const allCategories = await Category.find({}).lean().exec();
  const requiredImages = allCategories
    .map((category) => {
      return category.sub_categories.map((items) => {
        return {
          name: items.name,
          maxCount: 1,
        };
      });
    })
    .flat();
  return requiredImages as Field[];
}
