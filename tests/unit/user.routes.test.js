import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "#src/tests/helpers/app.js";
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  createMockId,
} from "#src/tests/helpers/mocks.js";
import {
  loginAsAdmin,
  loginAsNonAdmin,
  loginCookies,
  MOCK_ADMIN_USER,
  MOCK_NON_ADMIN_USER,
} from "#src/tests/unit/helpers/auth.js";

const MOCK_USER_LIST = [
  { username: "alice", isAdmin: false, orders: [] },
  { username: "bob", isAdmin: false, orders: [] },
];

const NEW_USER = {
  username: "testuser",
  password: "testpass123",
  fname: "Test",
  lname: "User",
};

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

describe("/login /logout route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("logs in the admin user successfully", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    expect(loginCookies).toBeDefined();
  });

  it("blocks a second login while already logged in (requireGuest)", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    const res = await request(app)
      .post("/api/user/login")
      .set("Cookie", loginCookies)
      .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ALREADY_LOGGED_IN");
  });

  it("logs out the logged-in admin user", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    const res = await request(app)
      .post("/api/user/logout")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out");
  });

  it("blocks logout when not logged in (requireLogin)", async () => {
    const res = await request(app).post("/api/user/logout");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });
});

describe("/signup route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("signs up a new user and sets a session cookie", async () => {
    mongoService.getCollection.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue(null),
      insertOne: vi.fn().mockResolvedValue({ acknowledged: true }),
    });
    mongoService.getNewId.mockReturnValue(createMockId());

    const res = await request(app).post("/api/user/signup").send(NEW_USER);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(NEW_USER.username);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("blocks signup when already logged in (requireGuest)", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    const res = await request(app)
      .post("/api/user/signup")
      .set("Cookie", loginCookies)
      .send(NEW_USER);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ALREADY_LOGGED_IN");
  });
});

describe("/list route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("admin user receives the user list", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockImplementation((collectionName) => {
      if (collectionName === mongoService.USERS_COLLECTION) {
        return Promise.resolve({
          findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
          aggregate: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue(MOCK_USER_LIST),
          }),
        });
      }
      return Promise.resolve({});
    });

    const res = await request(app)
      .get("/api/user/list")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(200);
    expect(res.body.users).toEqual(MOCK_USER_LIST);
  });

  it("non-admin user is blocked from the user list", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    const res = await request(app)
      .get("/api/user/list")
      .set("Cookie", loginCookies);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ADMIN_REQUIRED");
  });
});

const UPDATE_FIELDS = { fname: "UpdatedFirst", lname: "UpdatedLast" };

describe("PATCH / route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("logged-in non-admin user updates their profile", async () => {
    await loginAsNonAdmin(app, mongoService.getCollection);

    mongoService.getCollection.mockResolvedValue({
      findOne: vi.fn().mockResolvedValue(MOCK_NON_ADMIN_USER),
      findOneAndUpdate: vi.fn().mockResolvedValue(null),
    });

    const res = await request(app)
      .patch("/api/user/")
      .set("Cookie", loginCookies)
      .send(UPDATE_FIELDS);

    expect(res.status).toBe(200);
    expect(res.body.updatedUser).toMatchObject(UPDATE_FIELDS);
  });

  it("unauthenticated request is blocked (requireLogin)", async () => {
    const res = await request(app).patch("/api/user/").send(UPDATE_FIELDS);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("LOGIN_REQUIRED");
  });

  it("admin user is blocked from updating (requireNonAdmin)", async () => {
    await loginAsAdmin(app, mongoService.getCollection);

    const res = await request(app)
      .patch("/api/user/")
      .set("Cookie", loginCookies)
      .send(UPDATE_FIELDS);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("ADMIN_NOT_ALLOWED");
  });
});
