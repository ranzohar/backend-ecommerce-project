# MongoDB URL for Cypress E2E Tests

## Steps

1. Create a new environment variable for the E2E MongoDB URL in the backend.
2. Update backend config to use the E2E MongoDB URL when running Cypress E2E tests.
3. Ensure the E2E database is initialized/reset before each test run.
4. Update Cypress or test setup to trigger backend with the E2E MongoDB URL.
5. Document the setup and usage in the plan file.

## Ask questions

1. What should the E2E MongoDB URL be?
   - Option 1: mongodb://localhost:27017/e2e-db (suggested, isolated local DB)
   - Option 2: Use a remote/test cluster (describe connection string)
   - Option 3: Other (please specify)
2. How should the backend detect it’s running E2E tests?
   - Option 1: Use a specific NODE_ENV value (e.g., NODE_ENV=e2e) -> Yes
   - Option 2: Use a custom environment variable (e.g., EE_MONGO_URL)
   - Option 3: Detect via Cypress (describe mechanism)2
3. Should the E2E DB be dropped/reset before each test run?
   - Option 1: Yes, always start with a clean DB (suggested for test isolation)
   - Option 2: No, keep data between runs
4. Where should documentation for this setup be added?
   - Option 1: In the new plan file (suggested)
   - Option 2: In the backend README
   - Option 3: Both
