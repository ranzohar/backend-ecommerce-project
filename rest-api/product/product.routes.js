import { Router } from "express";
import {
  listProductsHandler,
  // getProductHandler,
  addProductHandler,
  // deleteProductHandler,
} from "./product.controller.js";

const router = Router();

router.get("/", listProductsHandler);
// router.get("/:productId", getProductHandler);
router.post("/:productId", addProductHandler);
// router.delete("/:productId", deleteProductHandler);

export const productRoutes = router;
