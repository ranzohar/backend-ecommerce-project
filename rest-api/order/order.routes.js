import { Router } from "express";
import { add, get, getAll } from "./order.controller.js";
import { requireLogin, requireAdmin } from "#src/rest-api/middleware/index.js";
const router = Router();

router.post("/", requireLogin, add);
router.get("/", requireLogin, get);
router.get("/all", requireAdmin, getAll);

export const orderRoutes = router;
