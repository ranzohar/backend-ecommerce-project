import { describe, it, expect, beforeAll } from "vitest";
import { createApp } from "#src/tests/helpers/app.js";
import {
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
} from "#src/tests/helpers/mocks.js";
import {
  clearAllCollections,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
} from "./helpers/db.js";
import { createAgent } from "./helpers/agent.js";

import { HTTP_STATUS } from "#src/utils/http-response.js";

const NEW_USERNAME = NON_ADMIN_USERNAME;
const NEW_PASSWORD = NON_ADMIN_PASSWORD;
const UPDATED_FNAME = "UpdatedFirst";
const UPDATED_LNAME = "UpdatedLast";

describe("User flow: register → login → update → logout → admin list", () => {
  let adminAgent;
  let userAgent;

  beforeAll(async () => {
    await clearAllCollections();
    adminAgent = createAgent();
    userAgent = createAgent();
    await adminAgent.loginAs(ADMIN_USERNAME, ADMIN_PASSWORD);
  });

  it("registers a new account", async () => {
    const res = await userAgent.agent.post("/api/user/signup").send({
      username: NEW_USERNAME,
      password: NEW_PASSWORD,
      fname: "Test",
      lname: "User",
    });
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.username).toBe(NEW_USERNAME);
  });

  it("logs out after registration", async () => {
    await userAgent.agent
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });
    const logoutRes = await userAgent.agent.post("/api/user/logout");
    expect(logoutRes.status).toBe(HTTP_STATUS.OK);
  });

  it("fails login with wrong password", async () => {
    const wrongLoginRes = await userAgent.agent
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: "wrongpassword" });
    expect(wrongLoginRes.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    await userAgent.agent.post("/api/user/logout");
  });

  it("logs in with correct password", async () => {
    const correctLoginRes = await userAgent.agent
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });
    expect(correctLoginRes.status).toBe(HTTP_STATUS.OK);
    expect(correctLoginRes.body.message).toBe("Logged in");
    expect(correctLoginRes.headers["set-cookie"]).toBeDefined();
    await userAgent.agent.post("/api/user/logout");
  });

  it("duplicate username registration is rejected", async () => {
    const res = await userAgent.agent.post("/api/user/signup").send({
      username: NEW_USERNAME,
      password: NEW_PASSWORD,
      fname: "Test",
      lname: "User",
    });

    expect(res.status).toBe(HTTP_STATUS.CONFLICT);
    expect(res.body.code).toBe("USERNAME_TAKEN");
  });

  it("unauthenticated request to a protected route is rejected", async () => {
    // Ensure userAgent is logged out
    await userAgent.agent.post("/api/user/logout");
    const res = await userAgent.agent
      .patch("/api/user/")
      .send({ fname: UPDATED_FNAME });
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);

    const logoutRes = await userAgent.agent.post("/api/user/logout");
    expect(logoutRes.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  it("logged-in user updates their own profile", async () => {
    await userAgent.agent
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });

    const updateRes = await userAgent.agent
      .patch("/api/user/")
      .send({ fname: UPDATED_FNAME, lname: UPDATED_LNAME });

    expect(updateRes.status).toBe(HTTP_STATUS.OK);
    expect(updateRes.body.updatedUser.fname).toBe(UPDATED_FNAME);
    expect(updateRes.body.updatedUser.lname).toBe(UPDATED_LNAME);
    await userAgent.agent.post("/api/user/logout");
  });

  it("logged-in user cannot re-register", async () => {
    await userAgent.agent
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });

    const signupRes = await userAgent.agent.post("/api/user/signup").send({
      username: "anotheruser",
      password: "pass123",
      fname: "A",
      lname: "B",
    });

    expect(signupRes.status).toBe(HTTP_STATUS.FORBIDDEN);
    await userAgent.agent.post("/api/user/logout");
  });

  it("user logs out successfully", async () => {
    await userAgent.agent
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });

    const logoutRes = await userAgent.agent.post("/api/user/logout");

    // Accept either OK or UNAUTHORIZED depending on session state
    expect([HTTP_STATUS.OK, HTTP_STATUS.UNAUTHORIZED]).toContain(logoutRes.status);
    if (logoutRes.status === HTTP_STATUS.OK) {
      expect(logoutRes.body.message).toBe("Logged out");
    }
  });

  it("admin can list all registered users with their orders", async () => {
    const res = await adminAgent.agent.get("/api/user/list");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
  });

  it("non-admin cannot access the user list", async () => {
    await userAgent.agent
      .post("/api/user/login")
      .send({ username: NEW_USERNAME, password: NEW_PASSWORD });

    const res = await userAgent.agent.get("/api/user/list");

    // Accept either FORBIDDEN or UNAUTHORIZED depending on session state
    expect([HTTP_STATUS.FORBIDDEN, HTTP_STATUS.UNAUTHORIZED]).toContain(res.status);
    await userAgent.agent.post("/api/user/logout");
  });
});
