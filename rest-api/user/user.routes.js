import { Router } from "express";
import { signup, login, logout, update } from "./user.controller.js";
import { requireLogin, requireGuest } from "#src/rest-api/middleware/index.js";

const router = Router();

router.post("/signup", requireGuest, signup);
router.post("/login", requireGuest, login);
router.post("/logout", requireLogin, logout);
router.patch("/", requireLogin, update);

export const userRoutes = router;
