import { Router } from "express";
import {
  listProductsHandler,
  addProductHandler,
} from "./product.controller.js";
import { requireLogin } from "#src/rest-api/middleware/require-login.js";
import { requireAdmin } from "#src/rest-api/middleware/require-admin.js";

const router = Router();

router.get("/", requireLogin, listProductsHandler);
router.post("/", requireAdmin, addProductHandler);

export const productRoutes = router;
