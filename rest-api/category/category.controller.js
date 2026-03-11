import {
  addCategory,
  updateCategory,
  deleteCategory,
  listCategories,
} from "./category.service.js";
import { logInfo } from "#src/log.service.js";
import { crudlSafe } from "#src/utils/index.js";
import {
  ADD_ERRORS,
  UPDATE_ERRORS,
  DELETE_ERRORS,
  LIST_ERRORS,
} from "./category.error.js";

export async function addCategoryHandler(req, res) {
  crudlSafe(res, ADD_ERRORS, async () => {
    const { name } = req.body;
    const category = await addCategory(name);
    res.json({ category });
    logInfo(`Response add category sent with status ${res.statusCode}`);
  });
}

export async function updateCategoryHandler(req, res) {
  // TODO - go over all products with this category and update their category name as well
  crudlSafe(res, UPDATE_ERRORS, async () => {
    const { categoryId } = req.params;
    const { name } = req.body;
    const category = await updateCategory(categoryId, name);
    res.json({ category });
    logInfo(`Response update category sent with status ${res.statusCode}`);
  });
}

export async function deleteCategoryHandler(req, res) {
  crudlSafe(res, DELETE_ERRORS, async () => {
    const { categoryId } = req.params;
    await deleteCategory(categoryId);
    res.json({ message: "Deleted category", categoryId });
    logInfo(`Response delete category sent with status ${res.statusCode}`);
  });
}

export async function listCategoriesHandler(req, res) {
  crudlSafe(res, LIST_ERRORS, async () => {
    const categories = await listCategories();
    res.json({ categories });
    logInfo(`Response list categories sent with status ${res.statusCode}`);
  });
}
