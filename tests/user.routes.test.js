import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { hashPassword } from "#src/crypt-service.js";
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  MOCK_USER_WITH_ORDERS,
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
} from "./helpers/mocks.js";
import {
  createTestSetup,
  setupAdminUserMock,
  hashedAdminPassword,
  hashedNonAdminPassword,
} from "./helpers/test-setup.js";

const NEW_USER_USERNAME = "newuser";
const NEW_USER_PASSWORD = "newpassword123";

vi.mock("#src/mongodb/mongodb.service.js", () => {
  return {
    getCollection: vi.fn(),
    getNewId: vi.fn().mockReturnValue("mock-new-user-id"),
    USERS_COLLECTION: "users",
    ORDER_COLLECTION: "orders",
  };
});

import { getCollection } from "#src/mongodb/mongodb.service.js";
import { HTTP_STATUS } from "#src/utils/index.js";

const UPDATED_USERNAME = "updateduser";
const UPDATED_PASSWORD = "updatedpassword123";
const UPDATED_FNAME = "UpdatedFirst";
const UPDATED_LNAME = "UpdatedLast";

let app;
let hashedNewUserPassword;

beforeAll(async () => {
  ({ app } = await createTestSetup());
  hashedNewUserPassword = await hashPassword(NEW_USER_PASSWORD);
});

describe("POST /api/user/login + logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in and then logs out successfully", async () => {
    setupAdminUserMock(getCollection);

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    expect(loginRes.body).toEqual({ message: "Logged in" });

    const cookie = loginRes.headers["set-cookie"];

    const logoutRes = await request(app)
      .post("/api/user/logout")
      .set("Cookie", cookie);

    expect(logoutRes.body).toEqual({ message: "Logged out" });
  });

  it("does not return { message: 'Logged in' } when already logged in", async () => {
    setupAdminUserMock(getCollection);

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const secondLoginRes = await request(app)
      .post("/api/user/login")
      .set("Cookie", cookie)
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    expect(secondLoginRes.body).not.toEqual({ message: "Logged in" });
  });

  it("does not return { message: 'Logged in' } when password is wrong", async () => {
    setupAdminUserMock(getCollection);

    const res = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: "wrongpassword" });

    expect(res.body).not.toEqual({ message: "Logged in" });
  });

  it("does not return { message: 'Logged out' } when not logged in", async () => {
    const res = await request(app).post("/api/user/logout");

    expect(res.body).not.toEqual({ message: "Logged out" });
  });
});

describe("GET /api/user/list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns users with their orders when logged in as admin", async () => {
    getCollection.mockImplementation((collectionName) => {
      if (collectionName === "users") {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue({
            username: ADMIN_USERNAME,
            hashedPassword: hashedAdminPassword,
            isAdmin: true,
          }),
          aggregate: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([MOCK_USER_WITH_ORDERS]),
          }),
        });
      }
      return Promise.resolve({});
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const listRes = await request(app)
      .get("/api/user/list")
      .set("Cookie", cookie);

    expect(listRes.body).toEqual({ users: [MOCK_USER_WITH_ORDERS] });
  });

  it("returns HTTP_STATUS.FORBIDDEN when logged in as a non-admin user", async () => {
    getCollection.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue({
        username: ADMIN_USERNAME,
        hashedPassword: hashedAdminPassword,
        isAdmin: false,
      }),
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const listRes = await request(app)
      .get("/api/user/list")
      .set("Cookie", cookie);

    expect(listRes.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});

describe("POST /api/user/signup + logout + login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signs up a new user, logs out successfully, and logs in with the same credentials", async () => {
    const signupCollectionMock = {
      findOne: vi.fn().mockResolvedValue(null),
      insertOne: vi.fn().mockResolvedValue({ acknowledged: true }),
    };
    getCollection.mockResolvedValue(signupCollectionMock);

    const signupRes = await request(app)
      .post("/api/user/signup")
      .send({ username: NEW_USER_USERNAME, password: NEW_USER_PASSWORD });

    expect(signupRes.body).toEqual({ username: NEW_USER_USERNAME });

    const cookie = signupRes.headers["set-cookie"];

    const logoutRes = await request(app)
      .post("/api/user/logout")
      .set("Cookie", cookie);

    expect(logoutRes.body).toEqual({ message: "Logged out" });

    getCollection.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue({
        username: NEW_USER_USERNAME,
        hashedPassword: hashedNewUserPassword,
        isAdmin: false,
      }),
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NEW_USER_USERNAME, password: NEW_USER_PASSWORD });

    expect(loginRes.body).toEqual({ message: "Logged in" });
  });

  it("does not allow a logged-in user to signup", async () => {
    const signupCollectionMock = {
      findOne: vi.fn().mockResolvedValue(null),
      insertOne: vi.fn().mockResolvedValue({ acknowledged: true }),
    };
    getCollection.mockResolvedValue(signupCollectionMock);

    const signupRes = await request(app)
      .post("/api/user/signup")
      .send({ username: NEW_USER_USERNAME, password: NEW_USER_PASSWORD });

    const cookie = signupRes.headers["set-cookie"];

    const secondSignupRes = await request(app)
      .post("/api/user/signup")
      .set("Cookie", cookie)
      .send({ username: NEW_USER_USERNAME, password: NEW_USER_PASSWORD });

    expect(secondSignupRes.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});

describe("PATCH /api/user/", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates all user details when logged in as non-admin", async () => {
    getCollection.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue({
        username: NON_ADMIN_USERNAME,
        hashedPassword: hashedNonAdminPassword,
        isAdmin: false,
        _id: "user-id-1",
      }),
      findOneAndUpdate: vi.fn().mockResolvedValue({}),
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NON_ADMIN_USERNAME, password: NON_ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const updateRes = await request(app)
      .patch("/api/user/")
      .set("Cookie", cookie)
      .send({
        username: UPDATED_USERNAME,
        password: UPDATED_PASSWORD,
        fname: UPDATED_FNAME,
        lname: UPDATED_LNAME,
      });

    expect(updateRes.body).toEqual({
      updatedUser: {
        username: UPDATED_USERNAME,
        fname: UPDATED_FNAME,
        lname: UPDATED_LNAME,
      },
    });
  });

  it("updates only fname when logged in as non-admin", async () => {
    getCollection.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue({
        username: NON_ADMIN_USERNAME,
        hashedPassword: hashedNonAdminPassword,
        isAdmin: false,
        _id: "user-id-1",
      }),
      findOneAndUpdate: vi.fn().mockResolvedValue({}),
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NON_ADMIN_USERNAME, password: NON_ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const updateRes = await request(app)
      .patch("/api/user/")
      .set("Cookie", cookie)
      .send({ fname: UPDATED_USERNAME });

    expect(updateRes.body).toEqual({
      updatedUser: { fname: UPDATED_USERNAME },
    });
  });

  it("does not update the admin user", async () => {
    getCollection.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue({
        username: ADMIN_USERNAME,
        hashedPassword: hashedAdminPassword,
        isAdmin: true,
      }),
    });

    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const updateRes = await request(app)
      .patch("/api/user/")
      .set("Cookie", cookie)
      .send({ username: UPDATED_USERNAME, password: UPDATED_PASSWORD });

    expect(updateRes.status).toBe(HTTP_STATUS.FORBIDDEN);
  });
});
