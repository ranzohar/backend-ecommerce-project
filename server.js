import "./load-env.js";
import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";

import { logError, logInfo } from "./log.service.js";
import { initPromise } from "./log.service.js";
import { helloRoutes } from "./rest-api/hello_world/hello.routes.js";
import { idRoutes } from "./rest-api/id/getid.js";
import { productRoutes } from "./rest-api/product/product.routes.js";
import { userRoutes } from "./rest-api/user/user.routes.js";
import { orderRoutes } from "./rest-api/order/order.routes.js";
import { categoryRoutes } from "./rest-api/category/category.routes.js";
import { setAls } from "./rest-api/middleware/set-als.js";
import { clearE2EDatabase, ensureAdminTestUser } from "./tests/e2e/scripts/e2e-db-setup.js";

// Ensure old run.log is deleted before logging
await initPromise;
logInfo("Starting server...");

const app = express();
const allowedOrigin = "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
app.use(setAls);
app.use("/api/hello", helloRoutes);
app.use("/api/id", idRoutes);
app.use("/api/product", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/category", categoryRoutes);
if (process.env.NODE_ENV === "test") {
  app.post("/api/test/reset", async (req, res) => {
    try {
      await clearE2EDatabase();
      await ensureAdminTestUser();
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  logInfo(`Server running at http://localhost:${port}`);
});
server.on("error", (err) => {
  logError(`Server failed to start: ${err?.message ?? err}`);
});
