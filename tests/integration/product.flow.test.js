import { HTTP_STATUS } from "#src/utils/http-response.js";
import { describe, it, expect, beforeAll } from "vitest";
import {
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
} from "#src/tests/helpers/mocks.js";
import {
  clearAllCollections,
  seedUser,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
} from "./helpers/db.js";
import { createAgent } from "./helpers/agent.js";

const USER_USERNAME = NON_ADMIN_USERNAME;
const USER_PASSWORD = NON_ADMIN_PASSWORD;

const CATEGORY_BOOKS = "Books";
const CATEGORY_GADGETS = "Gadgets";

const PRODUCT_CHEAP_BOOK = {
  title: "Cheap Book",
  price: 5,
  category: CATEGORY_BOOKS,
  description: "A cheap book",
};
const PRODUCT_EXPENSIVE_BOOK = {
  title: "Expensive Book",
  price: 50,
  category: CATEGORY_BOOKS,
  description: "An expensive book",
};
const PRODUCT_GADGET = {
  title: "Cool Gadget",
  price: 30,
  category: CATEGORY_GADGETS,
  description: "A cool gadget",
};

describe("Product flow: admin adds categories & products, user filters list", () => {
  let adminAgent;
  let userAgent;

  beforeAll(async () => {
    await clearAllCollections();
    await seedUser({
      username: USER_USERNAME,
      password: USER_PASSWORD,
      isAdmin: false,
    });

    adminAgent = createAgent();
    await adminAgent.loginAs(ADMIN_USERNAME, ADMIN_PASSWORD);

    userAgent = createAgent();
    await userAgent.loginAs(USER_USERNAME, USER_PASSWORD);
  });

  it("admin adds two categories", async () => {
    const booksRes = await adminAgent.agent
      .post("/api/category/")
      .send({ name: CATEGORY_BOOKS });
    expect(booksRes.status).toBe(HTTP_STATUS.OK);
    expect(booksRes.body.category.name).toBe(CATEGORY_BOOKS);

    const gadgetsRes = await adminAgent.agent
      .post("/api/category/")
      .send({ name: CATEGORY_GADGETS });
    expect(gadgetsRes.status).toBe(HTTP_STATUS.OK);
    expect(gadgetsRes.body.category.name).toBe(CATEGORY_GADGETS);
  });

  it("admin adds three products across both categories", async () => {
    const res1 = await adminAgent.agent
      .post("/api/product/")
      .send(PRODUCT_CHEAP_BOOK);
    expect(res1.status).toBe(HTTP_STATUS.OK);
    expect(res1.body.product.title).toBe(PRODUCT_CHEAP_BOOK.title);

    const res2 = await adminAgent.agent
      .post("/api/product/")
      .send(PRODUCT_EXPENSIVE_BOOK);
    expect(res2.status).toBe(HTTP_STATUS.OK);

    const res3 = await adminAgent.agent
      .post("/api/product/")
      .send(PRODUCT_GADGET);
    expect(res3.status).toBe(HTTP_STATUS.OK);
  });

  it("anonymous user cannot list products", async () => {
    const { default: request } = await import("supertest");
    const { createApp } = await import("#src/tests/helpers/app.js");
    const res = await request(createApp()).get("/api/product/");
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  it("logged-in user sees all products with no filter", async () => {
    const res = await userAgent.agent.get("/api/product/");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.products.length).toBe(3);
  });

  it("filters by category returns only books", async () => {
    const res = await userAgent.agent.get(
      `/api/product/?category=${CATEGORY_BOOKS}`,
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.products.length).toBe(2);
    expect(
      res.body.products.every((p) => {
        return p.categoryId !== undefined;
      }),
    ).toBe(true);
  });

  it("filters by max price returns only products at or below the price", async () => {
    const res = await userAgent.agent.get("/api/product/?price=10");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].title).toBe(PRODUCT_CHEAP_BOOK.title);
  });

  it("filters by title search is case-insensitive", async () => {
    const res = await userAgent.agent.get("/api/product/?title=book");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.products.length).toBe(2);
    expect(
      res.body.products.every((p) => {
        return p.title.toLowerCase().includes("book");
      }),
    ).toBe(true);
  });

  it("filters by non-existing category returns 404", async () => {
    const res = await userAgent.agent.get("/api/product/?category=NonExistent");

    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
  });

  it("combining category and max price filters narrows results", async () => {
    const res = await userAgent.agent.get(
      `/api/product/?category=${CATEGORY_BOOKS}&price=10`,
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0].title).toBe(PRODUCT_CHEAP_BOOK.title);
  });

  it("blocks adding duplicate product title", async () => {
    const res = await adminAgent.agent
      .post("/api/product/")
      .send(PRODUCT_CHEAP_BOOK);
    expect(res.status).toBe(HTTP_STATUS.CONFLICT);
  });
});
