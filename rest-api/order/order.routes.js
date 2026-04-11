import { Router } from "express";
import { add, get, getAll, stats, statsByUser, statsByProduct, productStats } from "./order.controller.js";
import { requireLogin, requireAdmin, requireNonAdmin } from "#src/rest-api/middleware/index.js";
const router = Router();

router.post("/", requireLogin, requireNonAdmin, add);
router.get("/", requireLogin, requireNonAdmin, get);
router.get("/all", requireAdmin, getAll);
router.get("/stats", requireAdmin, stats);
router.get("/stats/user/:username", requireAdmin, statsByUser);
router.get("/stats/product/:title", requireLogin, statsByProduct);
router.get("/stats/products", requireAdmin, productStats);

export const orderRoutes = router;
