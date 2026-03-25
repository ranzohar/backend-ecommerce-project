import { HTTP_STATUS } from "#src/utils/http-response.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "#src/tests/helpers/app.js";
import { createMockId } from "#src/tests/helpers/mocks.js";
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

const MOCK_CATEGORY_ID = createMockId();
const MOCK_DB_CATEGORIES = [
  { _id: createMockId(), name: "cat1" },
  { _id: createMockId(), name: "cat2" },
];
const NEW_CATEGORY = { name: "new-category" };
const UPDATE_FIELDS = { name: "updated-category" };

describe("GET / route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user receives the category list", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockResolvedValue({
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(MOCK_DB_CATEGORIES),
      }),
    });

    const res = await request(app)
      .get("/api/category/")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.categories).toBeDefined();
  });

  it("non-admin user receives the category list", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockResolvedValue({
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(MOCK_DB_CATEGORIES),
      }),
    });

    const res = await request(app)
      .get("/api/category/")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.categories).toBeDefined();
  });

  it("unauthenticated request is blocked (requireLogin)", async () => {
    const res = await request(app).get("/api/category/");

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

describe("POST / route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user adds a category", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      return Promise.resolve({
        insertOne: vi.fn().mockResolvedValue({ insertedId: MOCK_CATEGORY_ID }),
      });
    });

    const res = await request(app)
      .post("/api/category/")
      .set("Cookie", loginCookies)
      .send(NEW_CATEGORY);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.category).toBeDefined();
  });

  it("non-admin user is blocked (requireAdmin)", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_NON_ADMIN_USER),
        });
      }
      return Promise.resolve({});
    });

    const res = await request(app)
      .post("/api/category/")
      .set("Cookie", loginCookies)
      .send(NEW_CATEGORY);

    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });

  it("unauthenticated request is blocked (requireAdmin)", async () => {
    const res = await request(app).post("/api/category/").send(NEW_CATEGORY);

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

describe("PATCH /:categoryId route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user updates a category", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      return Promise.resolve({
        updateOne: vi.fn().mockResolvedValue({ matchedCount: 1 }),
      });
    });

    const res = await request(app)
      .patch(`/api/category/${MOCK_CATEGORY_ID}`)
      .set("Cookie", loginCookies)
      .send(UPDATE_FIELDS);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.category).toBeDefined();
  });

  it("non-admin user is blocked (requireAdmin)", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_NON_ADMIN_USER),
        });
      }
      return Promise.resolve({});
    });

    const res = await request(app)
      .patch(`/api/category/${MOCK_CATEGORY_ID}`)
      .set("Cookie", loginCookies)
      .send(UPDATE_FIELDS);

    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });

  it("unauthenticated request is blocked (requireAdmin)", async () => {
    const res = await request(app)
      .patch(`/api/category/${MOCK_CATEGORY_ID}`)
      .send(UPDATE_FIELDS);

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

describe("DELETE /:categoryId route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user deletes a category", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      return Promise.resolve({
        deleteOne: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      });
    });

    const res = await request(app)
      .delete(`/api/category/${MOCK_CATEGORY_ID}`)
      .set("Cookie", loginCookies);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.message).toBe("Deleted category");
  });

  it("non-admin user is blocked (requireAdmin)", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_NON_ADMIN_USER),
        });
      }
      return Promise.resolve({});
    });

    const res = await request(app)
      .delete(`/api/category/${MOCK_CATEGORY_ID}`)
      .set("Cookie", loginCookies);

    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });

  it("unauthenticated request is blocked (requireAdmin)", async () => {
    const res = await request(app).delete(`/api/category/${MOCK_CATEGORY_ID}`);

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});
