import express from "express";
import cookieParser from "cookie-parser";
import { setAls } from "#src/rest-api/middleware/set-als.js";
import { userRoutes } from "#src/rest-api/user/user.routes.js";
import { orderRoutes } from "#src/rest-api/order/order.routes.js";
import { productRoutes } from "#src/rest-api/product/product.routes.js";
import { categoryRoutes } from "#src/rest-api/category/category.routes.js";

export function createApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(setAls);
  app.use("/api/user", userRoutes);
  app.use("/api/order", orderRoutes);
  app.use("/api/product", productRoutes);
  app.use("/api/category", categoryRoutes);
  return app;
}
