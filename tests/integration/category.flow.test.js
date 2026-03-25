import { HTTP_STATUS } from "#src/utils/http-response.js";
import { describe, it, expect, beforeAll } from "vitest";
import { createApp } from "#src/tests/helpers/app.js";
import {
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
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
const CATEGORY_NAME = MOCK_CATEGORIES[0].name;
const UPDATED_CATEGORY_NAME = `${MOCK_CATEGORIES[0].name}-updated`;
const PRODUCT_TITLE = MOCK_PRODUCTS[0].title;

describe("Category flow: add → list → update → delete + product category validation", () => {
  let adminAgent;
  let userAgent;
  let createdCategoryId;

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

  it("blocks non-admin from adding a category", async () => {
    const res = await userAgent.agent
      .post("/api/category/")
      .send({ name: CATEGORY_NAME });

    expect(res.status).toBe(HTTP_STATUS.FORBIDDEN);
  });

  it("blocks anonymous from listing categories", async () => {
    const app = createApp();
    const { default: request } = await import("supertest");
    const res = await request(app).get("/api/category/");
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
  });

  it("admin adds a new category", async () => {
    const res = await adminAgent.agent
      .post("/api/category/")
      .send({ name: CATEGORY_NAME });

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.category.name).toBe(CATEGORY_NAME);
    expect(res.body.category.id).toBeDefined();
    createdCategoryId = res.body.category.id;
  });

  it("trying to add a product with a non-existing category fails", async () => {
    const res = await adminAgent.agent
      .post("/api/product/")
      .send({
        title: PRODUCT_TITLE,
        price: 999,
        category: "NonExistentCategory",
        description: "A laptop",
      });

    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
  });

  it("logged-in user can list categories", async () => {
    const res = await userAgent.agent.get("/api/category/");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(
      res.body.categories.some((c) => {
        return c.name === CATEGORY_NAME;
      }),
    ).toBe(true);
  });

  it("admin updates the category name", async () => {
    const res = await adminAgent.agent
      .patch(`/api/category/${createdCategoryId}`)
      .send({ name: UPDATED_CATEGORY_NAME });

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.category.name).toBe(UPDATED_CATEGORY_NAME);
    expect(res.body.category.id).toBe(createdCategoryId);
  });

  it("adding a product with the updated category name succeeds", async () => {
    const res = await adminAgent.agent
      .post("/api/product/")
      .send({
        title: PRODUCT_TITLE,
        price: 999,
        category: UPDATED_CATEGORY_NAME,
        description: "A laptop",
      });

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.product.title).toBe(PRODUCT_TITLE);
  });

  it("blocks adding a category with a duplicate name", async () => {
    const res = await adminAgent.agent
      .post("/api/category/")
      .send({ name: UPDATED_CATEGORY_NAME });

    expect(res.status).toBe(HTTP_STATUS.CONFLICT);
    expect(res.body.code).toBe("CATEGORY_NAME_TAKEN");
  });

  it("admin deletes the category", async () => {
    const res = await adminAgent.agent.delete(
      `/api/category/${createdCategoryId}`,
    );

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(res.body.categoryId).toBe(createdCategoryId);
  });

  it("deleted category no longer appears in the list", async () => {
    const res = await userAgent.agent.get("/api/category/");

    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(
      res.body.categories.some((c) => {
        return c.id === createdCategoryId;
      }),
    ).toBe(false);
  });

  it("deleting a non-existing category returns 404", async () => {
    const res = await adminAgent.agent.delete(
      `/api/category/${createdCategoryId}`,
    );
    expect(res.status).toBe(HTTP_STATUS.NOT_FOUND);
  });
});
