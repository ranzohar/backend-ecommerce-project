import { Router } from "express";
import {
  listProductsHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "./product.controller.js";
import { requireLogin } from "#src/rest-api/middleware/require-login.js";
import { requireAdmin } from "#src/rest-api/middleware/require-admin.js";

const router = Router();

router.get("/", requireLogin, listProductsHandler);
router.post("/", requireAdmin, createProductHandler);
router.patch("/:id", requireAdmin, updateProductHandler);
router.delete("/:id", requireAdmin, deleteProductHandler);

export const productRoutes = router;
