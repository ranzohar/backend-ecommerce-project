import { Router } from "express";
import { signup, login, logout, update, list } from "./user.controller.js";
import {
  requireLogin,
  requireGuest,
  requireAdmin,
  requireNonAdmin,
} from "#src/rest-api/middleware/index.js";

const router = Router();

router.post("/login", requireGuest, login);
router.post("/logout", requireLogin, logout);
router.post("/signup", requireGuest, signup);
router.get("/list", requireAdmin, list);
router.patch("/", requireLogin, requireNonAdmin, update);

export const userRoutes = router;
