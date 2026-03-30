import "#src/load-env.js";
console.log("[DEBUG] Script loaded: e2e-db-setup.js");
import {
  getCollection,
  USERS_COLLECTION,
  ORDER_COLLECTION,
  CATEGORIES_COLLECTION,
  PRODUCTS_COLLECTION,
} from "#src/mongodb/mongodb.service.js";
import { hashPassword } from "#src/crypt-service.js";

export async function ensureAdminTestUser() {
  const users = await getCollection(USERS_COLLECTION);
  console.log("[DEBUG] DB NAME:", users.dbName);
  console.log("[DEBUG] COLLECTION:", users.collectionName);
  const username = "admin-test";
  const plainPassword = "123123";
  const isAdmin = true;

  const existing = await users.findOne({ username });
  console.log("[DEBUG] Existing admin-test user:", existing);
  if (!existing) {
    const hashedPassword = await hashPassword(plainPassword);
    const insertResult = await users.insertOne({
      username,
      hashedPassword,
      isAdmin,
    });
    console.log("[DEBUG] Inserted admin-test user:", insertResult);
    return { created: true };
  } else if (!existing.isAdmin || !existing.hashedPassword) {
    const hashedPassword = await hashPassword(plainPassword);
    const updateResult = await users.updateOne(
      { username },
      { $set: { hashedPassword, isAdmin } },
    );
    console.log("[DEBUG] Updated admin-test user:", updateResult);
    return { updated: true };
  }
  return { exists: true };
}

export async function clearE2EDatabase() {
  const collections = [
    USERS_COLLECTION,
    ORDER_COLLECTION,
    CATEGORIES_COLLECTION,
    PRODUCTS_COLLECTION,
  ];
  for (const name of collections) {
    const col = await getCollection(name);
    await col.deleteMany({});
  }
  return { cleared: true };
}

// CLI usage
if (process.argv[1] && process.argv[1].endsWith("e2e-db-setup.js")) {
  console.log("[DEBUG] Entered CLI usage block");
  (async () => {
    try {
      console.log("[DEBUG] Starting e2e-db-setup.js");
      await clearE2EDatabase();
      const result = await ensureAdminTestUser();
      console.log("clearE2EDatabase + ensureAdminTestUser result:", result);
      process.exit(0);
    } catch (err) {
      console.error("[ERROR] e2e-db-setup.js failed:", err);
      process.exit(1);
    }
  })();
}
