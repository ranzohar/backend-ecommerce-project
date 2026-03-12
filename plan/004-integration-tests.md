# 004 - Compound Integration Tests (HTTP + mongodb-memory-server)

## Goal

Replace the `vi.mock` approach for MongoDB with a real in-memory MongoDB instance (`mongodb-memory-server`) and spin up the Express app as a real HTTP server. Tests will cover multi-step flows (e.g. register → login → place order → list orders) that cross multiple CRUD operations.

## --> We do not replace. We add some integration tests section that will test everything. Unit tests will still use vi.mock.

## Steps

1. Install `mongodb-memory-server` as a dev dependency.
2. Create `tests/integration/setup.js` — start `MongoMemoryServer` before all tests, point `MONGODB_URI` env var at it, seed required indexes (users, categories, products), and tear down after all tests.
   --> Verify that I am currect. But when they don't exists the server automatically creates indexes. So we just need to clear everything.
3. Create `tests/integration/helpers/db.js` — helpers to seed and clear collections between tests (`seedUsers`, `seedProducts`, `seedCategories`, `clearCollection`).
4. Create `tests/integration/helpers/agent.js` — a thin wrapper around `supertest.agent(app)` that exposes `loginAs(username, password)` and `logout()` for cookie-based session management across chained requests.
5. Create `tests/integration/user.flow.test.js` — compound tests for: register (anon) → login → get own profile → update profile → logout.
6. Create `tests/integration/product.flow.test.js` — compound tests for: admin login → add category → add product → non-admin login → list products with filters (category / maxPrice / search) → verify results.

7. Create `tests/integration/order.flow.test.js` — compound tests for: seed products + category → non-admin login → place two orders → list own orders → admin login → list all orders → verify stats (sum per product, user breakdown).
8. Create `tests/integration/category.flow.test.js` — compound tests for: admin login → create category → get category (requires login) → update category → delete category → verify not found.
   -> Try to add a product with none existing category see it doesn't add -> add this category -> Try again and see it is added
9. Add `test:integration` script to `package.json` that runs only `tests/integration/**`.
10. Run all integration tests and fix any failures.

---

## Ask questions

1. **MongoMemoryServer lifecycle** — Should the in-memory MongoDB be shared across all integration test files (one instance for the suite) or spun up fresh per test file?
   - Option A: One shared instance for the whole integration suite, cleared between files. _(Suggested — faster, less overhead)_
   - Option B: Fresh instance per test file — fully isolated but slower startup.

2. **Seeding strategy for products** — Products currently live in a JSON file (`data/products/data.json`) not MongoDB. Should integration tests use the real file-backed product service or migrate products to MongoDB for these tests?
   - Option A: Keep file-backed products; mock only the file helpers in integration tests. _(Suggested — no schema change needed)_
   - Option B: Migrate products to MongoDB for integration tests too — full DB-only stack.
     -> They do not anymore. Everything should be mongoDB

3. **supertest mode** — Should we use `supertest.agent` (persists cookies automatically) or manually pass cookies between requests?
   - Option A: `supertest.agent` _(Suggested — less boilerplate, mirrors real browser behaviour)_
   - Option B: Manual cookie passing — more explicit but verbose.

4. **Test isolation between cases** — How should state be reset between `it` blocks inside the same file?
   - Option A: `beforeEach` clears relevant collections and re-seeds minimal data. _(Suggested — each test starts clean)_
   - Option B: Tests within a file share state and run in a fixed order (compound chain).

   -> Every `it` block should share the DB. So no resets should be made between `it` blocks.

5. **Integration test script** — Should `npm test` run both unit and integration tests together, or keep them separate?
   - Option A: Keep separate — `npm test` runs unit tests only; `npm run test:integration` runs integration tests. _(Suggested — faster feedback loop during development)_
   - Option B: Run everything together under `npm test`.
     -> add npm run unittests (or something similar). npm test should run everything.
