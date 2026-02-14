import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.get("/", (req, res) => {
	res.json({ id: uuidv4() });
});

export const idRoutes = router;
