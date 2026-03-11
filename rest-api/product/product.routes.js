import { Router } from "express";
import {
  listProductsHandler,
  // getProductHandler,
  addProductHandler,
  // deleteProductHandler,
} from "./product.controller.js";
import { requireLogin } from "#src/rest-api/middleware/require-login.js";
import { requireAdmin } from "#src/rest-api/middleware/require-admin.js";

const router = Router();

router.get("/", requireLogin, listProductsHandler);
// router.get("/:productId", getProductHandler);
router.post("/", requireAdmin, addProductHandler);
// router.delete("/:productId", deleteProductHandler);

export const productRoutes = router;
