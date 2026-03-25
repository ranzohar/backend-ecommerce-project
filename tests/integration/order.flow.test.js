import { describe, it, expect, beforeAll } from "vitest";
import { HTTP_STATUS } from "#src/utils/http-response.js";
import {
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
} from "#src/tests/helpers/mocks.js";
import { clearAllCollections, seedUser, ADMIN_USERNAME, ADMIN_PASSWORD } from "./helpers/db.js";
import { createAgent } from "./helpers/agent.js";

const USER_USERNAME = NON_ADMIN_USERNAME;
const USER_PASSWORD = NON_ADMIN_PASSWORD;

const ORDER_1 = { products: [{ title: MOCK_PRODUCTS[0].title, quantity: 2 }] };
const ORDER_2 = { products: [{ title: MOCK_PRODUCTS[1].title, quantity: 1 }] };

describe("Order flow: place orders → list own → admin view all → stats", () => {
  let adminAgent;
  let userAgent;

  beforeAll(async () => {
    await clearAllCollections();
    await seedUser({ username: USER_USERNAME, password: USER_PASSWORD, isAdmin: false });

    adminAgent = createAgent();
    await adminAgent.loginAs(ADMIN_USERNAME, ADMIN_PASSWORD);

    userAgent = createAgent();
    await userAgent.loginAs(USER_USERNAME, USER_PASSWORD);

    await adminAgent.agent.post("/api/category/").send({ name: MOCK_CATEGORIES[0].name });
    await adminAgent.agent.post("/api/category/").send({ name: MOCK_CATEGORIES[1].name });
    await adminAgent.agent.post("/api/product/").send(MOCK_PRODUCTS[0]);
    await adminAgent.agent.post("/api/product/").send(MOCK_PRODUCTS[1]);
  });

  it(`user places first order (2x ${MOCK_PRODUCTS[0].title})`, async () => {
    const res = await userAgent.agent.post("/api/order/").send(ORDER_1);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.products[0].title).toBe(MOCK_PRODUCTS[0].title);
    expect(res.body.products[0].quantity).toBe(2);
    expect(res.body.totalPrice).toBe(MOCK_PRODUCTS[0].price * 2);
  });

  it(`user places second order (1x ${MOCK_PRODUCTS[1].title})`, async () => {
    const res = await userAgent.agent.post("/api/order/").send(ORDER_2);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.products[0].title).toBe(MOCK_PRODUCTS[1].title);
    expect(res.body.products[0].quantity).toBe(1);
    expect(res.body.totalPrice).toBe(MOCK_PRODUCTS[1].price * 1);
  });

  it("ordering a non-existing product is rejected", async () => {
    const res = await userAgent.agent
      .post("/api/order/")
      .send({ products: [{ title: "NonExistentProduct", quantity: 1 }] });

    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
  });

  it("anonymous user cannot place an order", async () => {
    const { default: request } = await import("supertest");
    const { createApp } = await import("#src/tests/helpers/app.js");
    const res = await request(createApp()).post("/api/order/").send(ORDER_1);
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  it("user lists their own orders and sees both orders", async () => {
    const res = await userAgent.agent.get("/api/order/");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body.every((o) => { return typeof o.totalPrice === "number"; })).toBe(true);
    expect(res.body.every((o) => { return Array.isArray(o.products); })).toBe(true);
  });

  it("non-admin cannot list all orders", async () => {
    const res = await userAgent.agent.get("/api/order/all");
    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
  });

  it("admin lists all orders and sees both orders", async () => {
    const res = await adminAgent.agent.get("/api/order/all");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body.every((o) => { return o.user?.username !== undefined; })).toBe(true);
  });

  it("admin gets global stats showing total quantities per product", async () => {
    const res = await adminAgent.agent.get("/api/order/stats");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body[MOCK_PRODUCTS[0].title]).toBe(2);
    expect(res.body[MOCK_PRODUCTS[1].title]).toBe(1);
  });

  it("admin gets stats for a specific user", async () => {
    const res = await adminAgent.agent.get(`/api/order/stats/user/${USER_USERNAME}`);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body[MOCK_PRODUCTS[0].title]).toBe(2);
    expect(res.body[MOCK_PRODUCTS[1].title]).toBe(1);
  });

  it("admin gets stats for a specific product", async () => {
    const res = await adminAgent.agent.get(`/api/order/stats/product/${MOCK_PRODUCTS[0].title}`);

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body[MOCK_PRODUCTS[0].title]).toBe(2);
    expect(res.body[MOCK_PRODUCTS[1].title]).toBeUndefined();
  });
});
