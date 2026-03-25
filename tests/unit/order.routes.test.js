import { HTTP_STATUS } from "#src/utils/http-response.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "#src/tests/helpers/app.js";
import { MOCK_ORDERS } from "#src/tests/helpers/mocks.js";
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

const MOCK_PRODUCT_FOR_ORDER = {
  _id: "mockProductId",
  title: MOCK_ORDERS[0].products[0].title,
  price: 10,
};

describe("POST / route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("non-admin user can add an order", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_NON_ADMIN_USER),
        });
      }
      if (collectionName === mongoService.PRODUCTS_COLLECTION) {
        return Promise.resolve({
          find: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([MOCK_PRODUCT_FOR_ORDER]),
          }),
        });
      }
      return Promise.resolve({
        insertOne: vi.fn().mockResolvedValue({ acknowledged: true }),
      });
    });

    const res = await request(app)
      .post("/api/order/")
      .set("Cookie", loginCookies)
      .send(MOCK_ORDERS[0]);

    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it("admin user is blocked from adding an order (requireNonAdmin)", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      return Promise.resolve({});
    });

    const res = await request(app)
      .post("/api/order/")
      .set("Cookie", loginCookies)
      .send(MOCK_ORDERS[0]);

    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(res.body.code).toBe("ADMIN_NOT_ALLOWED");
  });

  it("unauthenticated request is blocked (requireLogin)", async () => {
    const res = await request(app).post("/api/order/").send(MOCK_ORDERS[0]);

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

describe("GET / route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("non-admin user can get their orders", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_NON_ADMIN_USER),
        });
      }
      return Promise.resolve({
        aggregate: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      });
    });

    const res = await request(app)
      .get("/api/order/")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it("admin user is blocked from getting their orders (requireNonAdmin)", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      return Promise.resolve({});
    });

    const res = await request(app)
      .get("/api/order/")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
    expect(res.body.code).toBe("ADMIN_NOT_ALLOWED");
  });

  it("unauthenticated request is blocked (requireLogin)", async () => {
    const res = await request(app).get("/api/order/");

    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

describe("GET /all route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user can get all orders", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      return Promise.resolve({
        aggregate: vi
          .fn()
          .mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
      });
    });

    const res = await request(app)
      .get("/api/order/all")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(200);
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
      .get("/api/order/all")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });

  it("unauthenticated request is blocked (requireAdmin)", async () => {
    const res = await request(app).get("/api/order/all");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

describe("GET /stats route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user can get stats", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      return Promise.resolve({
        aggregate: vi
          .fn()
          .mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
      });
    });

    const res = await request(app)
      .get("/api/order/stats")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(200);
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
      .get("/api/order/stats")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });

  it("unauthenticated request is blocked (requireAdmin)", async () => {
    const res = await request(app).get("/api/order/stats");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

describe("GET /stats/user/:username route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user can get stats by user", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      return Promise.resolve({
        aggregate: vi
          .fn()
          .mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
      });
    });

    const res = await request(app)
      .get("/api/order/stats/user/john")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(200);
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
      .get("/api/order/stats/user/john")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });

  it("unauthenticated request is blocked (requireAdmin)", async () => {
    const res = await request(app).get("/api/order/stats/user/john");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

describe("GET /stats/product/:title route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user can get stats by product", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
        });
      }
      return Promise.resolve({
        aggregate: vi
          .fn()
          .mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) }),
      });
    });

    const res = await request(app)
      .get("/api/order/stats/product/Product%201")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(200);
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
      .get("/api/order/stats/product/Product%201")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });

  it("unauthenticated request is blocked (requireAdmin)", async () => {
    const res = await request(app).get("/api/order/stats/product/Product%201");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});
