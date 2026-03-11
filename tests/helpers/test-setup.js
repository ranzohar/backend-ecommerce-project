import { vi } from "vitest";
import { hashPassword } from "#src/crypt-service.js";
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  NON_ADMIN_USERNAME,
  NON_ADMIN_PASSWORD,
} from "./mocks.js";
import { createApp } from "./app.js";

export let hashedAdminPassword;
export let hashedNonAdminPassword;

export async function createTestSetup() {
  hashedAdminPassword = await hashPassword(ADMIN_PASSWORD);
  hashedNonAdminPassword = await hashPassword(NON_ADMIN_PASSWORD);
  const app = createApp();
  return { app };
}

export function setupAdminUserMock(getCollection) {
  getCollection.mockResolvedValue({
    findOne: vi.fn().mockResolvedValue({
      username: ADMIN_USERNAME,
      hashedPassword: hashedAdminPassword,
      isAdmin: true,
    }),
  });
}

export function setupNonAdminUserMock(getCollection) {
  getCollection.mockResolvedValue({
    findOne: vi.fn().mockResolvedValue({
      username: NON_ADMIN_USERNAME,
      hashedPassword: hashedNonAdminPassword,
      isAdmin: false,
    }),
  });
}
