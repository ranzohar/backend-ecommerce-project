import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
  MOCK_PRODUCTS,
  MOCK_NEW_PRODUCT_ID,
  MOCK_NEW_PRODUCT,
} from "./helpers/mocks.js";
import { createTestSetup, hashedAdminPassword, hashedNonAdminPassword } from "./helpers/test-setup.js";

vi.mock("#src/mongodb/mongodb.service.js", () => {
  return {
    getCollection: vi.fn(),
    getNewId: vi.fn().mockReturnValue("mock-new-id"),
    USERS_COLLECTION: "users",
    ORDER_COLLECTION: "orders",
    PRODUCTS_COLLECTION: "products",
    CATEGORIES_COLLECTION: "categories",
  };
});

import { getCollection } from "#src/mongodb/mongodb.service.js";
import { HTTP_STATUS } from "#src/utils/index.js";

let app;

beforeAll(async () => {
  ({ app } = await createTestSetup());
});

function setupAdminUserMock() {
  getCollection.mockResolvedValueOnce({
    findOne: vi.fn().mockResolvedValue({
      username: ADMIN_USERNAME,
      hashedPassword: hashedAdminPassword,
      isAdmin: true,
    }),
  });
}

function setupNonAdminUserMock() {
  getCollection.mockResolvedValueOnce({
    findOne: vi.fn().mockResolvedValue({
      username: NON_ADMIN_USERNAME,
      hashedPassword: hashedNonAdminPassword,
      isAdmin: false,
    }),
  });
}

function setupProductsMock() {
  const mockProductDocs = MOCK_PRODUCTS.map(({ id, ...rest }) => {
    return { _id: id, ...rest };
  });
  getCollection.mockResolvedValueOnce({
    find: vi.fn().mockReturnValue({
      toArray: vi.fn().mockResolvedValue(mockProductDocs),
    }),
  });
}

function setupUpsertProductMock() {
  getCollection.mockResolvedValueOnce({
    updateOne: vi.fn().mockResolvedValue({ modifiedCount: 1 }),
  });
}

function setupDuplicateTitleUpsertProductMock() {
  const duplicateError = Object.assign(new Error("E11000 duplicate key error"), { code: 11000 });
  getCollection.mockResolvedValueOnce({
    updateOne: vi.fn().mockRejectedValue(duplicateError),
  });
}

function setupCategoryFoundMock() {
  getCollection.mockResolvedValueOnce({
    findOne: vi.fn().mockResolvedValue({ name: MOCK_NEW_PRODUCT.category }),
  });
}

function setupCategoryNotFoundMock() {
  getCollection.mockResolvedValueOnce({
    findOne: vi.fn().mockResolvedValue(null),
  });
}

async function loginAsAdmin() {
  const loginRes = await request(app)
    .post("/api/user/login")
    .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  return loginRes.headers["set-cookie"];
}

async function loginAsNonAdmin() {
  const loginRes = await request(app)
    .post("/api/user/login")
    .send({ username: NON_ADMIN_USERNAME, password: NON_ADMIN_PASSWORD });
  return loginRes.headers["set-cookie"];
}

function setupAdminCheckMock() {
  getCollection.mockResolvedValueOnce({
    findOne: vi.fn().mockResolvedValue({
      username: ADMIN_USERNAME,
      hashedPassword: hashedAdminPassword,
      isAdmin: true,
    }),
  });
}

describe("admin can list products and add a product", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists products after login as admin", async () => {
    setupAdminUserMock();
    setupProductsMock();

    const cookie = await loginAsAdmin();

    const listRes = await request(app)
      .get("/api/product")
      .set("Cookie", cookie);

    expect(listRes.body).toEqual({ products: MOCK_PRODUCTS });
  });

  it("adds a product and sees it was added", async () => {
    setupAdminUserMock();
    setupAdminCheckMock();
    setupCategoryFoundMock();
    setupUpsertProductMock();

    const cookie = await loginAsAdmin();

    const addRes = await request(app)
      .post("/api/product")
      .set("Cookie", cookie)
      .send(MOCK_NEW_PRODUCT);

    expect(addRes.body).toEqual({
      productId: MOCK_NEW_PRODUCT_ID,
      product: MOCK_NEW_PRODUCT,
    });
  });
});

describe("admin fails to add a product with an unknown category", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when category is not found", async () => {
    setupAdminUserMock();
    setupAdminCheckMock();
    setupCategoryNotFoundMock();

    const cookie = await loginAsAdmin();

    const addRes = await request(app)
      .post("/api/product")
      .set("Cookie", cookie)
      .send(MOCK_NEW_PRODUCT);

    expect(addRes.status).toBe(HTTP_STATUS.NOT_FOUND);
    expect(addRes.body.code).toBe("CATEGORY_NOT_FOUND");
  });
});

describe("admin fails to add a product with a duplicate title", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 409 when product title already exists", async () => {
    setupAdminUserMock();
    setupAdminCheckMock();
    setupCategoryFoundMock();
    setupDuplicateTitleUpsertProductMock();

    const cookie = await loginAsAdmin();

    const addRes = await request(app)
      .post("/api/product")
      .set("Cookie", cookie)
      .send(MOCK_NEW_PRODUCT);

    expect(addRes.status).toBe(HTTP_STATUS.CONFLICT);
    expect(addRes.body.code).toBe("PRODUCT_TITLE_TAKEN");
  });
});

describe("non-admin can list products but fails to add a product", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists products successfully but fails to add a product", async () => {
    setupNonAdminUserMock();
    setupProductsMock();

    const cookie = await loginAsNonAdmin();

    const listRes = await request(app)
      .get("/api/product")
      .set("Cookie", cookie);

    expect(listRes.body).toEqual({ products: MOCK_PRODUCTS });

    const addRes = await request(app)
      .post("/api/product")
      .set("Cookie", cookie)
      .send(MOCK_NEW_PRODUCT);

    expect(addRes.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
