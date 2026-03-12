import { inject } from "vitest";

process.env.MONGODB_URI = inject("mongoUri");
process.env.CRYPTR_SECRET = "test-secret-key";

await import("#src/crypt-service.js");

const { seedAdminUser } = await import("./helpers/db.js");
await seedAdminUser();
