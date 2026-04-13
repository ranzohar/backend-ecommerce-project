import { Router } from "express";
import { add, get, getAll, stats, statsByUser, productStats, ordersByProduct, publicOrders } from "./order.controller.js";
import { requireLogin, requireAdmin, requireNonAdmin } from "#src/rest-api/middleware/index.js";
const router = Router();

router.post("/", requireLogin, requireNonAdmin, add);
router.get("/public", requireLogin, publicOrders);
router.get("/", requireLogin, requireNonAdmin, get);
router.get("/all", requireAdmin, getAll);
router.get("/stats", requireAdmin, stats);
router.get("/stats/user/:username", requireAdmin, statsByUser);
router.get("/stats/products", requireAdmin, productStats);
router.get("/stats/product/:title", requireAdmin, ordersByProduct);

export const orderRoutes = router;
