# 002 - Unit Testing for CRUDL Operations

## Steps

1. Choose and install a test framework and configure it for ESM modules.
2. Add `test` and `test:watch` scripts to `package.json`.
3. Create a shared mock/helper folder `tests/` with reusable mock factories (e.g. mock MongoDB collection, mock file utils).
4. Write unit tests for `user.service.js`: `addUser`, `getUserByUsername`, `getUserById`, `updateUserByUsername`.
5. Write unit tests for `product.service.js`: `upsertProduct`, `deleteProduct`, `getProduct`, `listProducts` (including filters: category, max price, search).
6. Write unit tests for `order.service.js`: `addOrder`, `getOrdersByUser`, `getOrders` (including sort variants).
7. Run all tests and verify they pass.

---

## Ask questions

1. **Which test framework should we use?**
   - **A. Vitest** _(suggested)_ — ESM-native, zero config, fast, compatible with the project's `"type": "module"` setup. Supports `vi.mock()` for dependency mocking.
   - **B. Jest** — Most popular, but requires extra config (`--experimental-vm-modules` or a transform layer) to work with ESM.
   - **C. Node built-in `node:test`** — No extra dependency, but more verbose mocking and less community tooling.

2. **What should we mock for MongoDB-backed services (`user.service`, `order.service`)?**
   - **A. Mock `getCollection` at the module level** _(suggested)_ — Replace `getCollection` with a mock that returns a fake collection object (with `findOne`, `insertOne`, `aggregate`, etc. as stubs). Keeps tests fast and isolated.
   - **B. Use an in-memory MongoDB (e.g. `mongodb-memory-server`)** — More realistic but heavier setup and slower tests.

3. **What should we mock for file-backed services (`product.service`)?**
   - **A. Mock `readJsonFile` / `writeJsonFile`** _(suggested)_ — Intercept at the utility level, no real file I/O in tests.
   - **B. Use a temp directory with real files** — More integration-like, slower, harder to reset between tests.
     We do not have anymore json files data.

4. **Where should test files live?**
   - **A. Co-located next to source files** (e.g. `rest-api/user/user.service.test.js`) — Easy to navigate, common convention.
   - **B. Centralized `tests/` folder** _(suggested)_ — Keeps source tree clean, all tests in one place (e.g. `tests/user.service.test.js`).

5. **Should we test the controllers and routes, or only the service layer?**
   - **A. Services only** _(suggested)_ — Services contain the business logic; controllers are thin wrappers. Keeps scope of this plan focused.
   - **B. Services + controllers** — More coverage but requires HTTP layer mocking (e.g. supertest).
   - **C. Full integration tests (routes via HTTP)** — Highest confidence but slowest and needs a running server/DB.

I go with the suggested answers.
