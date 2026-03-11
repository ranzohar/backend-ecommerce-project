import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
  MOCK_CATEGORIES,
} from "./helpers/mocks.js";

const NEW_CATEGORY_ID = "507f1f77bcf86cd799439022";
const NEW_CATEGORY_NAME = "Books";
import {
  createTestSetup,
  hashedAdminPassword,
  hashedNonAdminPassword,
} from "./helpers/test-setup.js";

vi.mock("#src/mongodb/mongodb.service.js", () => {
  return {
    getCollection: vi.fn(),
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

function setupCategoriesMock() {
  const mockCategoryDocs = MOCK_CATEGORIES.map(({ id, name }) => {
    return { _id: id, name };
  });
  getCollection.mockResolvedValueOnce({
    find: vi.fn().mockReturnValue({
      toArray: vi.fn().mockResolvedValue(mockCategoryDocs),
    }),
  });
}

function setupAddCategoryMock() {
  getCollection.mockResolvedValueOnce({
    insertOne: vi.fn().mockResolvedValue({
      insertedId: { toString: vi.fn().mockReturnValue(NEW_CATEGORY_ID) },
    }),
  });
}

function setupUpdateCategoryMock() {
  getCollection.mockResolvedValueOnce({
    updateOne: vi.fn().mockResolvedValue({ matchedCount: 1 }),
  });
}

function setupDeleteCategoryMock() {
  getCollection.mockResolvedValueOnce({
    deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
  });
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

describe("admin can list categories and add, update, delete a category", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists categories after login as admin", async () => {
    setupAdminUserMock();
    setupCategoriesMock();

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const listRes = await request(app)
      .get("/api/category")
      .set("Cookie", cookie);

    expect(listRes.body).toEqual({ categories: MOCK_CATEGORIES });
  });

  it("adds a category and sees it was added", async () => {
    setupAdminUserMock();
    setupAdminCheckMock();
    setupAddCategoryMock();

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const addRes = await request(app)
      .post("/api/category")
      .set("Cookie", cookie)
      .send({ name: NEW_CATEGORY_NAME });

    expect(addRes.body).toEqual({
      category: { id: NEW_CATEGORY_ID, name: NEW_CATEGORY_NAME },
    });
  });

  it("updates a category", async () => {
    const existingCategoryId = MOCK_CATEGORIES[0].id;
    const UPDATED_NAME = "Updated Electronics";
    setupAdminUserMock();
    setupAdminCheckMock();
    setupUpdateCategoryMock();

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const updateRes = await request(app)
      .patch(`/api/category/${existingCategoryId}`)
      .set("Cookie", cookie)
      .send({ name: UPDATED_NAME });

    expect(updateRes.body).toEqual({
      category: {
        id: existingCategoryId,
        name: UPDATED_NAME,
      },
    });
  });

  it("deletes a category", async () => {
    const existingCategoryId = MOCK_CATEGORIES[0].id;
    setupAdminUserMock();
    setupAdminCheckMock();
    setupDeleteCategoryMock();

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const deleteRes = await request(app)
      .delete(`/api/category/${existingCategoryId}`)
      .set("Cookie", cookie);

    expect(deleteRes.body).toEqual({
      message: "Deleted category",
      categoryId: existingCategoryId,
    });
  });
});

describe("non-admin can list categories but fails to add, update, or delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists categories successfully but fails to add a category", async () => {
    setupNonAdminUserMock();
    setupCategoriesMock();

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NON_ADMIN_USERNAME, password: NON_ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const listRes = await request(app)
      .get("/api/category")
      .set("Cookie", cookie);

    expect(listRes.body).toEqual({ categories: MOCK_CATEGORIES });

    const addRes = await request(app)
      .post("/api/category")
      .set("Cookie", cookie)
      .send({ name: NEW_CATEGORY_NAME });

    expect(addRes.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
