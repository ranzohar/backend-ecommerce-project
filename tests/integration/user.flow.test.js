import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "#src/tests/helpers/app.js";
import {
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
} from "#src/tests/helpers/mocks.js";
import { clearAllCollections, seedUser, ADMIN_USERNAME, ADMIN_PASSWORD } from "./helpers/db.js";
import { createAgent } from "./helpers/agent.js";

const NEW_USERNAME = NON_ADMIN_USERNAME;
const NEW_PASSWORD = NON_ADMIN_PASSWORD;
const UPDATED_FNAME = "UpdatedFirst";
const UPDATED_LNAME = "UpdatedLast";

const app = createApp();

describe("User flow: register → login → update → logout → admin list", () => {
  let adminAgent;

  beforeAll(async () => {
    await clearAllCollections();
    adminAgent = createAgent();
    await adminAgent.loginAs(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  it("anonymous user registers a new account", async () => {
    const res = await request(app)
      .post("/api/user/signup")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD, fname: "Test", lname: "User" });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(NEW_USERNAME);
  });

  it("duplicate username registration is rejected", async () => {
    const res = await request(app)
      .post("/api/user/signup")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD, fname: "Test", lname: "User" });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("USERNAME_TAKEN");
  });

  it("user logs in and receives a session cookie", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged in");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("unauthenticated request to a protected route is rejected", async () => {
    const res = await request(app).patch("/api/user/").send({ fname: UPDATED_FNAME });
    expect(res.status).toBe(401);
  });

  it("logged-in user updates their own profile", async () => {
    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const updateRes = await request(app)
      .patch("/api/user/")
      .set("Cookie", cookie)
      .send({ fname: UPDATED_FNAME, lname: UPDATED_LNAME });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.updatedUser.fname).toBe(UPDATED_FNAME);
    expect(updateRes.body.updatedUser.lname).toBe(UPDATED_LNAME);
  });

  it("logged-in user cannot re-register", async () => {
    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const signupRes = await request(app)
      .post("/api/user/signup")
      .set("Cookie", cookie)
      .send({ username: "anotheruser", password: "pass123", fname: "A", lname: "B" });

    expect(signupRes.status).toBe(403);
  });

  it("user logs out successfully", async () => {
    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const logoutRes = await request(app)
      .post("/api/user/logout")
      .set("Cookie", cookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.message).toBe("Logged out");
  });

  it("admin can list all registered users with their orders", async () => {
    const res = await adminAgent.agent.get("/api/user/list");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
  });

  it("non-admin cannot access the user list", async () => {
    const loginRes = await request(app)
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });

    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .get("/api/user/list")
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
  });
});

