import request from "supertest";
import { vi } from "vitest";
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
  createMockId,
} from "#src/tests/helpers/mocks.js";
import { hashPassword } from "#src/crypt-service.js";
import { USERS_COLLECTION } from "#src/mongodb/mongodb.service.js";

const MOCK_ADMIN_USER_ID = createMockId();
const MOCK_NON_ADMIN_USER_ID = createMockId();

const HASHED_ADMIN_PASSWORD = await hashPassword(ADMIN_PASSWORD);
const HASHED_NON_ADMIN_PASSWORD = await hashPassword(NON_ADMIN_PASSWORD);

export const MOCK_ADMIN_USER = {
  username: ADMIN_USERNAME,
  hashedPassword: HASHED_ADMIN_PASSWORD,
  isAdmin: true,
  _id: MOCK_ADMIN_USER_ID,
};

export const MOCK_NON_ADMIN_USER = {
  username: NON_ADMIN_USERNAME,
  hashedPassword: HASHED_NON_ADMIN_PASSWORD,
  isAdmin: false,
  _id: MOCK_NON_ADMIN_USER_ID,
};

function setupAdminCollectionMock(getCollection) {
  getCollection.mockImplementation((collectionName) => {
    if (collectionName === USERS_COLLECTION) {
      return Promise.resolve({
        findOne: vi.fn().mockResolvedValue(MOCK_ADMIN_USER),
      });
    }
    return Promise.resolve({});
  });
}

function setupNonAdminCollectionMock(getCollection) {
  getCollection.mockImplementation((collectionName) => {
    if (collectionName === USERS_COLLECTION) {
      return Promise.resolve({
        findOne: vi.fn().mockResolvedValue(MOCK_NON_ADMIN_USER),
      });
    }
    return Promise.resolve({});
  });
}

export let loginCookies;
export async function performAdminLogin(app) {
  const loginRes = await request(app)
    .post("/api/user/login")
    .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  loginCookies = loginRes.headers["set-cookie"];
}

export async function performNonAdminLogin(app) {
  const loginRes = await request(app)
    .post("/api/user/login")
    .send({ username: NON_ADMIN_USERNAME, password: NON_ADMIN_PASSWORD });
  loginCookies = loginRes.headers["set-cookie"];
}

export async function loginAsAdmin(app, getCollection) {
  setupAdminCollectionMock(getCollection);
  await performAdminLogin(app);
}

export async function loginAsNonAdmin(app, getCollection) {
  setupNonAdminCollectionMock(getCollection);
  await performNonAdminLogin(app);
}
