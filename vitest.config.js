import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias: { "#src": ROOT } },
        test: {
          name: "unit",
          include: ["tests/unit/*.test.js"],
          setupFiles: ["./tests/unit/setup.js"],
        },
      },
      {
        resolve: { alias: { "#src": ROOT } },
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.js"],
          globalSetup: ["./tests/integration/global-setup.js"],
          setupFiles: ["./tests/integration/setup.js"],
          fileParallelism: false,
        },
      },
    ],
  },
});
