import { vi } from "vitest";

export function createMongoServiceMock(extras = {}) {
  return {
    getCollection: vi.fn(),
    USERS_COLLECTION: "users",
    ORDER_COLLECTION: "orders",
    PRODUCTS_COLLECTION: "products",
    CATEGORIES_COLLECTION: "categories",
    ...extras,
  };
}
