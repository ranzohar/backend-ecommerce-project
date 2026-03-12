import {
  getCollection,
  USERS_COLLECTION,
  ORDER_COLLECTION,
  CATEGORIES_COLLECTION,
  PRODUCTS_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { hashPassword } from "#src/crypt-service.js";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "#src/tests/helpers/mocks.js";

export { ADMIN_USERNAME, ADMIN_PASSWORD };

export async function seedAdminUser() {
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);
  const collection = await getCollection(USERS_COLLECTION);
  await collection.updateOne(
    { username: ADMIN_USERNAME },
    { $setOnInsert: { username: ADMIN_USERNAME, hashedPassword, isAdmin: true, fname: "Admin", lname: "User" } },
    { upsert: true },
  );
}

export async function clearAllCollections() {
  const [users, orders, categories, products] = await Promise.all([
    getCollection(USERS_COLLECTION),
    getCollection(ORDER_COLLECTION),
    getCollection(CATEGORIES_COLLECTION),
    getCollection(PRODUCTS_COLLECTION),
  ]);
  await Promise.all([
    users.deleteMany({ username: { $ne: ADMIN_USERNAME } }),
    orders.deleteMany({}),
    categories.deleteMany({}),
    products.deleteMany({}),
  ]);
}

export async function seedUser({ username, password, isAdmin = false }) {
  const hashedPassword = await hashPassword(password);
  const collection = await getCollection(USERS_COLLECTION);
  const result = await collection.insertOne({
    username,
    hashedPassword,
    isAdmin,
    fname: "Test",
    lname: "User",
  });
  return { _id: result.insertedId, username, isAdmin };
}
