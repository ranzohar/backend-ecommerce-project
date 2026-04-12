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
router.patch("/:name", requireAdmin, updateCategoryHandler);
router.delete("/:name", requireAdmin, deleteCategoryHandler);

export const categoryRoutes = router;
