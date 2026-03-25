import { HTTP_STATUS } from "#src/utils/http-response.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "#src/tests/helpers/app.js";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "#src/tests/helpers/mocks.js";
import {
  loginAsAdmin,
  loginAsNonAdmin,
  loginCookies,
  MOCK_ADMIN_USER,
  MOCK_NON_ADMIN_USER,
} from "#src/tests/unit/helpers/auth.js";

vi.mock("#src/mongodb/mongodb.service.js", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    getCollection: vi.fn(),
    getNewId: vi.fn(),
  };
});

import * as mongoService from "#src/mongodb/mongodb.service.js";

const app = createApp();

describe("GET / route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user receives the product list", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockResolvedValue({
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(MOCK_PRODUCTS),
      }),
    });

    const res = await request(app)
      .get("/api/product/")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.products).toBeDefined();
  });

  it("non-admin user receives the product list", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockResolvedValue({
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(MOCK_PRODUCTS),
      }),
    });

    const res = await request(app)
      .get("/api/product/")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.products).toBeDefined();
  });

  it("guest user is blocked from the product list", async () => {
    const res = await request(app).get("/api/product/");

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

const NEW_PRODUCT = {
  title: "New Product",
  price: 15,
  category: MOCK_CATEGORIES[0].name,
  description: "A new product",
};

describe("POST / route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user can add a product", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      if (collectionName === mongoService.CATEGORIES_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_CATEGORIES[0]),
        });
      }
      if (collectionName === mongoService.PRODUCTS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(null),
          insertOne: vi.fn().mockResolvedValue({ acknowledged: true }),
        });
      }
      return Promise.resolve({});
    });

    const res = await request(app)
      .post("/api/product/")
      .set("Cookie", loginCookies)
      .send(NEW_PRODUCT);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.product).toBeDefined();
  });

  it("non-admin user is blocked from adding a product", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue(MOCK_NON_ADMIN_USER),
    });

    const res = await request(app)
      .post("/api/product/")
      .set("Cookie", loginCookies)
      .send(NEW_PRODUCT);

    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });

  it("guest user is blocked from adding a product", async () => {
    const res = await request(app).post("/api/product/").send(NEW_PRODUCT);

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});
