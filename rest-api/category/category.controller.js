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
  crudlSafe(res, UPDATE_ERRORS, async () => {
    const { id } = req.params;
    const { name: newName } = req.body;
    const category = await updateCategory(id, newName);
    res.json({ category });
    logInfo(`Response update category sent with status ${res.statusCode}`);
  });
}

export async function deleteCategoryHandler(req, res) {
  crudlSafe(res, DELETE_ERRORS, async () => {
    const { id } = req.params;
    await deleteCategory(id);
    res.json({ message: "Deleted category", categoryId: id });
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
