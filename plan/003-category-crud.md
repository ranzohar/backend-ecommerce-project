# 003 - Category CRUD

## Steps

1. Create `data/categories/data.json` with an empty JSON object as initial data.
2. Create `rest-api/category/category.service.js` with `upsertCategory`, `deleteCategory`, `getCategory`, `listCategories` functions (mirroring `product.service.js`).
3. Create `rest-api/category/category.error.js` with error constants and error maps for each operation (add/edit, delete, get, list).
4. Create `rest-api/category/category.controller.js` with `getCategoryHandler`, `upsertCategoryHandler`, `deleteCategoryHandler`, `listCategoriesHandler`.
5. Create `rest-api/category/category.routes.js` — wire routes with `requireAdmin` on upsert and delete, public access on get and list.
6. Register `categoryRoutes` in `server.js` under `/api/category`.

## Ask questions

1. **Category data shape** — What fields should a category have?
   - Option A: `name` only. *(Suggested — simplest, matches typical category models)*
   - Option B: `name` + `description`.
   - Option C: `name` + `description` + `imageUrl`.
   -> MY_ANSWER: name only, unique (case-insensitive)

2. **Route for upsert** — Should add and edit share one endpoint (upsert via `POST /:categoryId`) like products, or have separate `POST /` (create) and `PATCH /:categoryId` (update)?
   - Option A: Single `POST /:categoryId` upsert. *(Suggested — consistent with product pattern)*
   - Option B: Separate `POST /` and `PATCH /:categoryId`.
   -> MY_ANSWER: Separate POST / and PATCH /:categoryId

3. **List / Get visibility** — Should listing and getting a single category be public (no auth) or require login?
   - Option A: Public — no auth required. *(Suggested — categories are catalog data)*
   - Option B: Require login.
   -> MY_ANSWER: Require login
