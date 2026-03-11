import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import {
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  MOCK_USER_ID,
  MOCK_ORDER_1,
  MOCK_ORDER_2,
  MOCK_ORDER_1_RESPONSE,
  MOCK_ORDER_2_RESPONSE,
  MOCK_STORED_ORDERS,
  MOCK_ALL_ORDERS,
  MOCK_PRODUCTS,
} from "./helpers/mocks.js";

vi.mock("#src/mongodb/mongodb.service.js", () => {
  return {
    getCollection: vi.fn(),
    USERS_COLLECTION: "users",
    ORDER_COLLECTION: "orders",
    PRODUCTS_COLLECTION: "products",
  };
});

import { getCollection } from "#src/mongodb/mongodb.service.js";
import { createTestSetup, hashedAdminPassword, hashedNonAdminPassword } from "./helpers/test-setup.js";
import { HTTP_STATUS } from "#src/utils/index.js";

let app;

beforeAll(async () => {
  ({ app } = await createTestSetup());
});

describe("POST /api/order + GET /api/order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds 2 orders and retrieves the same 2 orders as the logged-in non-admin user", async () => {
    const mockUsersCollection = {
      findOne: vi.fn().mockResolvedValue({
        username: NON_ADMIN_USERNAME,
        hashedPassword: hashedNonAdminPassword,
        isAdmin: false,
        _id: MOCK_USER_ID,
      }),
    };

    const mockOrdersCollection = {
      insertOne: vi.fn().mockResolvedValue({ acknowledged: true }),
      aggregate: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(MOCK_STORED_ORDERS),
      }),
    };

    const mockProductsCollection = {
      find: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(
          MOCK_PRODUCTS.map(({ id, title, price }) => { return { _id: id, title, price }; })
        ),
      }),
    };

    getCollection.mockImplementation((collectionName) => {
      if (collectionName === "users") {
        return Promise.resolve(mockUsersCollection);
      }
      if (collectionName === "products") {
        return Promise.resolve(mockProductsCollection);
      }
      return Promise.resolve(mockOrdersCollection);
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NON_ADMIN_USERNAME, password: NON_ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const addOrder1Res = await request(app)
      .post("/api/order")
      .set("Cookie", cookie)
      .send(MOCK_ORDER_1);

    const addOrder2Res = await request(app)
      .post("/api/order")
      .set("Cookie", cookie)
      .send(MOCK_ORDER_2);

    expect(addOrder1Res.body).toEqual(MOCK_ORDER_1_RESPONSE);
    expect(addOrder2Res.body).toEqual(MOCK_ORDER_2_RESPONSE);

    const getOrdersRes = await request(app)
      .get("/api/order")
      .set("Cookie", cookie);

    expect(getOrdersRes.body).toEqual(MOCK_STORED_ORDERS);
  });
});

describe("GET /api/order/all", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all orders for user1 and user2, user3 with no orders does not appear", async () => {
    getCollection.mockImplementation((collectionName) => {
      if (collectionName === "users") {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue({
            username: ADMIN_USERNAME,
            hashedPassword: hashedAdminPassword,
            isAdmin: true,
            _id: "admin-id",
          }),
        });
      }
      return Promise.resolve({
        aggregate: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(MOCK_ALL_ORDERS),
        }),
      });
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const getAllRes = await request(app)
      .get("/api/order/all")
      .set("Cookie", cookie);

    expect(getAllRes.body).toEqual(MOCK_ALL_ORDERS);
    expect(getAllRes.body).toHaveLength(4);
    expect(
      getAllRes.body.some((order) => order.user.username === "user3"),
    ).toBe(false);
  });

  it("returns HTTP_STATUS.FORBIDDEN when a non-admin user requests all orders", async () => {
    getCollection.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue({
        username: NON_ADMIN_USERNAME,
        hashedPassword: hashedNonAdminPassword,
        isAdmin: false,
        _id: "user-id",
      }),
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NON_ADMIN_USERNAME, password: NON_ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const getAllRes = await request(app)
      .get("/api/order/all")
      .set("Cookie", cookie);

    expect(getAllRes.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
