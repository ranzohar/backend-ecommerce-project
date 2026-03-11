import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "#src": ROOT,
    },
  },
  test: {
    setupFiles: ["./tests/setup.js"],
  },
});
