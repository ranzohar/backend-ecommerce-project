import { Router } from "express";
import {
  listCategoriesHandler,
  addCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from "./category.controller.js";
import { requireAdmin, requireLogin } from "#src/rest-api/middleware/index.js";

const router = Router();

router.get("/", requireLogin, listCategoriesHandler);
router.post("/", requireAdmin, addCategoryHandler);
router.patch("/:categoryId", requireAdmin, updateCategoryHandler);
router.delete("/:categoryId", requireAdmin, deleteCategoryHandler);

export const categoryRoutes = router;
