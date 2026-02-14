import { Router } from "express";
import { getHello, patchHello, deleteHello } from "./hello.controller.js";

const router = Router();

router.get("/", getHello);
router.patch("/", patchHello);
router.delete("/", deleteHello);

export const helloRoutes = router;
