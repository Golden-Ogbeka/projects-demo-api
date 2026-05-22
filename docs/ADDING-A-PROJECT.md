# Adding a Portfolio Project to projects-demo-api

This guide documents the full end-to-end process for wiring any portfolio frontend or mobile project to this dummy backend so it runs locally without any real backend, cloud service, or API key.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1 — Inspect the Client](#phase-1--inspect-the-client)
4. [Phase 2 — Choose an Anonymized Slug](#phase-2--choose-an-anonymized-slug)
5. [Phase 3 — Create the Backend Module](#phase-3--create-the-backend-module)
6. [Phase 4 — Wire the Client](#phase-4--wire-the-client)
7. [Phase 5 — Common Client Compatibility Fixes](#phase-5--common-client-compatibility-fixes)
8. [Phase 6 — Verify End-to-End](#phase-6--verify-end-to-end)
9. [Phase 7 — Update Docs](#phase-7--update-docs)
10. [Reference: GraphQL Projects](#reference-graphql-projects)
11. [Reference: REST Projects](#reference-rest-projects)
12. [Reference: Known Pitfalls](#reference-known-pitfalls)

---

## Overview

`projects-demo-api` is a local TypeScript + Express + SQLite server. Each portfolio project gets its own isolated module under `src/projects/{slug}/`. The module returns realistic dummy data that matches the shape the original frontend expects. No real backend, database, email provider, payment provider, or API key is ever needed.

```
projects-demo-api/
  src/
    projects/
      {slug}/
        controllers/   ← business logic + fixtures
        database/      ← SQLite table setup + seed
        routes/        ← Express router
        types/         ← TypeScript types
        index.ts       ← ProjectModule export
      index.ts         ← registers all modules
  src/index.ts         ← mounts all modules
```

---

## Prerequisites

- Node 18+ installed.
- `projects-demo-api` dependencies installed: `npm install`.
- The portfolio client source code is accessible locally.

---

## Phase 1 — Inspect the Client

Before writing a single line of backend code, read the client thoroughly. Guessing from page names leads to wrong route names and broken shapes.

### 1.1 Find the base API URL

Look for `.env`, `.env.local`, `config.js`, or a constants file. Common variable names:

```
REACT_APP_API_URL
REACT_APP_GRAPHQL_URI
VITE_API_URL
API_BASE_URL
```

### 1.2 Find every HTTP call

Search for Axios wrappers, `fetch` calls, Apollo Client setup, and GraphQL documents:

```bash
grep -rn "axios\|fetch\|gql\|useQuery\|useMutation\|useLazyQuery" src/
grep -rn "from.*graphql" src/
grep -rn "\.get(\|\.post(\|\.put(\|\.patch(\|\.delete(" src/
```

For each call, record:
- HTTP method and path
- Request body / query variables shape
- Expected response shape (look at how the component destructures the result)
- Auth header format

### 1.3 Find auth and token behavior

```bash
grep -rn "localStorage\|sessionStorage\|getItem\|saveItem\|AUTH_TOKEN\|USER_ID" src/
grep -rn "firebase\|signIn\|signOut\|getIdToken\|customToken" src/
grep -rn "jwt\|Bearer\|Authorization" src/
```

Key questions:
- Does the app use Firebase custom token auth? (common in older React apps)
- Does the app parse JWT permissions locally to gate routes?
- Where is the auth token stored and what key?
- What does the login response shape look like?

### 1.4 Find external API usage

```bash
grep -rn "google\|maps\|stripe\|sendgrid\|firebase\|analytics\|sentry\|clarity" src/
```

Each external SDK that makes network calls needs either a local dummy route or a demo-mode bypass.

### 1.5 Find date formatting patterns

```bash
grep -rn "new Date\|format(\|toLocaleDateString\|toISOString\|Number(.*At)" src/
```

Note whether date fields are expected as:
- ISO strings (`"2026-05-21T10:00:00.000Z"`)
- Unix millisecond timestamp strings (`"1716288000000"`) — common when `Number(value)` is called before `new Date()`
- Unix seconds

Mismatching these causes `RangeError: Invalid time value` at runtime.

### 1.6 Find upload endpoints

```bash
grep -rn "FormData\|multipart\|upload\|media" src/
```

Note whether the response is expected as an array or an object.

---

## Phase 2 — Choose an Anonymized Slug

The slug is used everywhere: folder name, route path, table prefix, `.env` values, and docs. It must describe what the project does without exposing the original client or company name.

| Original name | Anonymized slug |
|---|---|
| AlerzoAdminDashboard | `saas-platform-admin-web` |
| ClientXMobileApp | `retail-mobile-app` |
| AgencyProjectY | `ecommerce-storefront` |

Rules:
- Lowercase, hyphen-separated.
- Describes the product category, not the client.
- Used consistently in all files — never mix the real name and the slug.

---

## Phase 3 — Create the Backend Module

### 3.1 Copy the template

```bash
cp -r src/projects/_template src/projects/{slug}
```

The template gives you the correct folder structure with placeholder files.

### 3.2 Define types

Edit `src/projects/{slug}/types/index.ts`. At minimum define the row types for any SQLite tables and the GraphQL request body type if the project uses GraphQL:

```ts
// src/projects/{slug}/types/index.ts
export interface SlugUser {
  id: string;
  email: string;
  createdAt: string;
}

// For GraphQL projects:
export interface GraphqlRequestBody {
  query: string;
  operationName?: string;
  variables?: Record<string, unknown>;
}
```

### 3.3 Set up the database

Edit `src/projects/{slug}/database/index.ts`:

```ts
import { db } from "../../../config/db.js";

export const setupSlugDatabase = () => {
  // Always use CREATE TABLE IF NOT EXISTS
  db.exec(`
    CREATE TABLE IF NOT EXISTS slug_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Seed only when empty
  const count = (db.prepare("SELECT COUNT(*) as c FROM slug_users").get() as { c: number }).c;
  if (count === 0) {
    db.prepare(`
      INSERT INTO slug_users (id, email, password, created_at)
      VALUES (?, ?, ?, ?)
    `).run("user-1", "demo@example.com", "password", new Date().toISOString());
  }
};
```

Rules:
- Table names are prefixed with the slug: `slug_users`, `slug_orders`.
- Always `CREATE TABLE IF NOT EXISTS`.
- Always check count before seeding.
- Passwords can be plain text for demo purposes.

### 3.4 Write fixtures

Create `src/projects/{slug}/controllers/fixtures.ts`. This is the most important file — it defines all the dummy data the controllers return.

```ts
// src/projects/{slug}/controllers/fixtures.ts

export const demoUser = {
  id: "user-1",
  email: "demo@example.com",
  fullName: "Demo User",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const pageInfo = (items: unknown[], page = 1, size = 50) => ({
  totalItems: items.length,
  totalCount: items.length,
  currentPage: page,
  page,
  size,
  hasNextPage: false,
  hasPreviousPage: false,
});

export const paginated = (items: unknown[], page = 1, size = 50) => ({
  nodes: items,
  data: items,
  items,
  total: items.length,
  count: items.length,
  pageInfo: pageInfo(items, page, size),
});
```

**Fixture shape rules:**

- Match the exact field names the component destructures. Read the component, not just the query.
- For list responses, include both `nodes` and `data` and `items` — different components use different keys.
- For `pageInfo`, include `totalItems`, `totalCount`, `currentPage`, `size`, `hasNextPage`, `hasPreviousPage`.
- For date fields, check whether the component calls `Number(value)` before `new Date()`. If yes, use `String(Date.now())` not an ISO string.
- For image fields, use Unsplash URLs: `https://images.unsplash.com/photo-{id}?w=400`.
- For tokens, use `demo-token-{id}` or a deterministic base64 JWT (see GraphQL section).

### 3.5 Write controllers

For REST projects, create one controller file per resource group:

```ts
// src/projects/{slug}/controllers/auth.ts
import { Request, Response } from "express";
import { sendSuccessFeedback, sendErrorFeedback } from "../../../functions/feedback.js";
import { demoUser } from "./fixtures.js";

export const AuthController = () => {
  const Login = (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendErrorFeedback(res, 400, "Email and password are required.");
    }
    return sendSuccessFeedback(res, "Login successful.", {
      token: `demo-token-${demoUser.id}`,
      user: demoUser,
    });
  };

  return { Login };
};
```

For GraphQL projects, see the [GraphQL section](#reference-graphql-projects) below.

### 3.6 Write routes

```ts
// src/projects/{slug}/routes/index.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.js";

const SlugRouter = Router();
const Auth = AuthController();

SlugRouter.get("/", (_req, res) => {
  res.json({ success: true, message: "{Slug} dummy backend" });
});

SlugRouter.post("/auth/login", Auth.Login);

export default SlugRouter;
```

### 3.7 Export the ProjectModule

```ts
// src/projects/{slug}/index.ts
import { ProjectModule } from "../../types/project.js";
import { setupSlugDatabase } from "./database/index.js";
import SlugRouter from "./routes/index.js";

export const SlugProject: ProjectModule = {
  name: "{slug}",
  basePath: "/{slug}",
  router: SlugRouter,
  setupDatabase: setupSlugDatabase,
};
```

### 3.8 Register the module

Edit `src/projects/index.ts`:

```ts
import { SlugProject } from "./{slug}/index.js";
// ... existing imports

export const projectModules = [
  // ... existing modules
  SlugProject,
];
```

### 3.9 Type-check and build

```bash
npm run type:check
npm run build
```

Fix all errors before moving to the client. Common issues:
- Missing exports in fixtures.ts
- Wrong import paths (must use `.js` extension in ESM TypeScript)
- `Request` generic type — use `Request & { body: T }` instead of `Request<never, never, T>` if the generic overload causes errors

---

## Phase 4 — Wire the Client

### 4.1 Update the client `.env`

```env
REACT_APP_API_URL=http://localhost:5050/{slug}
REACT_APP_GRAPHQL_URI=http://localhost:5050/{slug}/graphql
```

For Vite projects:
```env
VITE_API_URL=http://localhost:5050/{slug}
```

### 4.2 Point Axios / fetch base URL

If the client has a central Axios instance or fetch wrapper, confirm it reads from the env variable. If it has a hardcoded URL, replace it with the env variable.

### 4.3 Handle auth bypass

If the original app used Firebase custom token auth:

```js
// src/services/auth.js (client)
const isDemoBackend = () =>
  (process.env.REACT_APP_API_URL || '').includes('localhost:5050/{slug}');

export const loginWithCustomToken = (customToken) => new Promise((resolve, reject) => {
  if (isDemoBackend()) {
    // Skip Firebase, store a demo token directly
    saveItem(AUTH_TOKEN, createDemoToken());
    resolve({ uid: customToken || 'demo-user' });
    return;
  }
  firebase.auth().signInWithCustomToken(customToken).then(...).catch(reject);
});
```

The `createDemoToken()` function should produce a JWT with the same payload shape the app parses for permissions:

```js
const createDemoToken = () => {
  const header = window.btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = window.btoa(JSON.stringify({
    sub: 'user-1',
    userId: 'user-1',
    name: 'Demo User',
    permissions: ['view_dashboard', 'view_orders', /* all permissions */],
  }));
  return `${header}.${payload}.demo-signature`;
};
```

### 4.4 Handle localStorage URL caching

If the app stores the backend URL in localStorage and reads it on startup, demo mode must prefer the `.env` value:

```js
// src/graphql/index.js (client)
const isDemoBackend = (process.env.REACT_APP_GRAPHQL_URI || '')
  .includes('localhost:5050/{slug}');

const storedUri = localStorage.getItem('APP_GRAPHQL_URI');
const url = isDemoBackend
  ? process.env.REACT_APP_GRAPHQL_URI   // always prefer .env in demo mode
  : storedUri
    ? `${storedUri}/graphql`
    : process.env.REACT_APP_GRAPHQL_URI;
```

Without this, an old cached URL keeps the app stuck on a loader even after `.env` is updated.

---

## Phase 5 — Common Client Compatibility Fixes

These issues appear repeatedly across legacy React projects. Check for each one.

### 5.1 Node 22 + CRA 4 / Webpack 4 — ERR_OSSL_EVP_UNSUPPORTED

**Symptom:** `yarn start` or `npm start` fails immediately with `ERR_OSSL_EVP_UNSUPPORTED`.

**Fix:** Patch `package.json` scripts to use the legacy OpenSSL provider:

```json
{
  "scripts": {
    "start": "node --openssl-legacy-provider ./node_modules/react-scripts/scripts/start.js",
    "build": "node --openssl-legacy-provider ./node_modules/react-scripts/scripts/build.js"
  }
}
```

Do not upgrade `react-scripts` or webpack — that is out of scope for demo wiring.

### 5.2 Missing route constants — `TypeError: Cannot read properties of undefined (reading 'pathname')`

**Symptom:** App crashes on a dashboard page with a React Router error about `pathname`.

**Cause:** A `<Route path={dashboardRoutes.SOME_KEY}>` where `SOME_KEY` is not defined in the route constants file. React Router v5 passes `undefined` as the path, which it tries to parse as a location object.

**Fix:** Find the missing key:

```bash
# Get all keys used in routes/index.js
grep -oP "dashboardRoutes\.\w+" src/pages/dashboard/routes/index.js | sort -u

# Get all keys defined in routes/constants.js
grep -oP "^\s+\w+:" src/pages/dashboard/routes/constants.js | tr -d ' :' | sort

# Diff them — anything in the first list but not the second is missing
```

Add the missing constants to the constants file.

### 5.3 `RangeError: Invalid time value` on date fields

**Symptom:** A page crashes with `RangeError: Invalid time value` when rendering a table or detail view.

**Cause:** One of two patterns:

**Pattern A** — `new Date(value)` where `value` is `null`, `undefined`, or `""`:
```js
// Crashes if columnValue is null/undefined
formatDate(columnValue)
```
**Fix:** Guard in the date utility:
```js
export const formatDate = (date, format = DATE_FORMATS.DDMMYY) => {
  if (!date) return '-';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('en-GB', { ...options });
};
```

**Pattern B** — `new Date(Number(value))` where `value` is an ISO string instead of a numeric timestamp:
```js
// Crashes because Number("2026-05-21T...") === NaN
format(new Date(Number(values.updatedAt)), 'dd/MM/yyyy')
```
**Fix A (preferred):** Fix the fixture to return a numeric timestamp string:
```ts
updatedAt: String(Date.now())  // "1716288000000"
```
**Fix B (defensive):** Guard in the renderer:
```js
({ values }) => {
  const ts = Number(values.updatedAt);
  const d = new Date(Number.isNaN(ts) ? values.updatedAt : ts);
  if (Number.isNaN(d.getTime())) return '-';
  return format(d, 'dd/MM/yyyy hh:mm aaa');
}
```

Apply both fixes — the fixture fix makes the data correct, the renderer fix prevents future crashes from other null fields.

### 5.4 Upload endpoint returns wrong shape

**Symptom:** Upload succeeds on the backend but the client crashes or shows no result.

**Cause:** Some upload helpers destructure an array item directly: `const [file] = response.data`.

**Fix:** Return an array from the upload route:
```ts
return res.json([{ id: "upload-1", filename: file.originalname, url: "https://..." }]);
```

### 5.5 `import/named` lint error — exported name not found

**Symptom:** ESLint reports `X not found in '../path/to/file'`.

**Cause:** A component imports a named export that was never added to the source file (e.g., `DELETE_MANUFACTURER` imported but only `UPDATE_MANUFACTURER` exists).

**Fix:** Add the missing export to the source file. For GraphQL mutations, follow the existing pattern in the same file:
```js
export const DELETE_MANUFACTURER = gql`
  mutation DELETE_MANUFACTURER($id: String) {
    deleteManufacturer(id: $id) {
      _id
      manufacturerName
    }
  }
`;
```

### 5.6 `no-undef` for `process`, `console`, `Buffer` in TypeScript ESLint

**Symptom:** ESLint reports `'process' is not defined`, `'console' is not defined`, `'Buffer' is not defined` in `.ts` files.

**Fix:** Add Node globals to the ESLint config:
```js
// eslint.config.js
import globals from "globals";

export default [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "no-undef": "off", // TypeScript handles this
    },
  },
];
```

### 5.7 `localStyles` not defined — missing CSS module import

**Symptom:** ESLint reports `'localStyles' is not defined` in a component file.

**Fix:** Check if a `style.module.css` exists in the same directory. If not, create a minimal one and add the import:
```js
import localStyles from './style.module.css';
```

### 5.8 `import/prefer-default-export` on utility files

**Symptom:** ESLint reports `Prefer default export` on a file that only has named exports.

**Fix:** Add a default export that re-exports the primary function:
```js
export const isDemoBackend = () => { ... };
export default isDemoBackend;
```

---

## Phase 6 — Verify End-to-End

### 6.1 Start the backend

```bash
# In projects-demo-api/
npm run dev
```

Confirm it starts on port 5050:
```bash
curl http://localhost:5050/health
curl http://localhost:5050/{slug}
```

### 6.2 Smoke-test key GraphQL or REST operations

For GraphQL:
```bash
curl -s -X POST http://localhost:5050/{slug}/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { authenticateUser(userName:\"demo\", password:\"password\") { jwt userId } }"}'
```

For REST:
```bash
curl -s -X POST http://localhost:5050/{slug}/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password"}'
```

### 6.3 Start the client

```bash
# In the client project/
yarn start   # or npm start
```

Walk through the app manually:
1. Sign-in page loads without errors.
2. Login with demo credentials succeeds and redirects to the dashboard.
3. Each sidebar section loads without a crash.
4. List pages show dummy rows.
5. Detail pages open without a crash.
6. Mutations (create, update, delete) complete without a crash.

### 6.4 Fix crashes as they appear

When a page crashes, the browser console or React error boundary will show the component stack and the error. Common patterns:

| Error | Likely cause | Fix |
|---|---|---|
| `Cannot read properties of undefined (reading 'pathname')` | Missing route constant | Add to `routes/constants.js` |
| `RangeError: Invalid time value` | Date field is null or wrong format | Guard `formatDate`, fix fixture |
| `TypeError: X.map is not a function` | API returned object instead of array | Fix fixture to return array |
| `TypeError: Cannot read properties of null (reading 'nodes')` | API returned null instead of paginated object | Fix fixture to return `paginated([])` |
| `TypeError: X.toUpperCase is not a function` | API returned non-string where string expected | Fix fixture field type |
| `Error: No routes matched location "undefined"` | Route path is `undefined` | Add missing route constant |

### 6.5 Run lint and type-check

```bash
# Backend
npm run lint
npm run type:check

# Frontend
npx eslint src --ext .js
```

Fix all errors. Warnings are acceptable if they are pre-existing in the original client code.

---

## Phase 7 — Update Docs

After the project is working end-to-end, update three files:

### 7.1 `AGENTS.md` — add to Current Modules section

```markdown
- `{slug}`: [one-line description] at `/{slug}`.
  - Key endpoints: ...
  - Auth: ...
  - Client `.env` points to `http://localhost:5050/{slug}`.
  - Demo login: `demo` / `password`.
```

### 7.2 `README.md` — add to useful endpoints

```markdown
GET /{slug}
POST /{slug}/auth/login
GET /{slug}/products
```

### 7.3 `PROGRESS.md` — add a dated entry

```markdown
## YYYY-MM-DD

### {Slug} — initial wiring

Client path: ...
Backend module: src/projects/{slug}

Implemented:
- POST /{slug}/auth/login
- GET /{slug}/products
- ...

Client adjustments:
- Updated .env
- Patched src/services/auth.js (Firebase bypass)
- ...

Verification:
- type:check passed
- build passed
- Browser smoke test: sign-in → dashboard → [pages tested]

Known non-blocking warnings:
- ...

Next likely work:
- ...
```

---

## Reference: GraphQL Projects

GraphQL projects are the most common pattern in this repo. The approach is a lightweight field-dispatch handler — no full schema required.

### How the GraphQL handler works

```
POST /{slug}/graphql
  body: { query, operationName, variables }
  ↓
extractRootFields(query)   → ["getCustomers", "getWarehouses"]
  ↓
resolveField(field, vars)  → dummy data per field
  ↓
res.json({ data: { getCustomers: {...}, getWarehouses: [...] } })
```

`extractRootFields` parses the query string to find the top-level field names without a full GraphQL parser. It handles aliases, arguments, and nested selections.

### Fixture shape checklist for GraphQL

Every field the client queries must be covered. For each root field:

1. **List queries** — return `paginated(items)`. The `paginated` helper includes `nodes`, `data`, `items`, `total`, `count`, and `pageInfo` so any access pattern works.

2. **Single-item queries** — return the item directly (not wrapped).

3. **Scalar queries** — return a primitive. Add the field name to `scalarFields` set so it bypasses the object-return path.

4. **Mutations** — return `okMutation(field, variables)` which includes `success: true`, `_id`, `id`, `status`, `message`. For mutations that return specific shapes (e.g., `createBundle` returns `{ success, bundle }`), add an explicit case.

5. **Auth queries** — return `{ jwt: "demo-firebase-custom-token", userId: "user-1" }` for login. The client will call `loginWithCustomToken(jwt)` — the demo auth bypass in the client converts this to a local demo JWT.

### Resolving field names

The field name in `resolveField` is the GraphQL root field name, not the operation name. For example:

```graphql
query GET_CUSTOMERS($page: Int) {
  getCustomers(page: $page) {   # ← this is the field name
    nodes { customerId }
  }
}
```

The operation name `GET_CUSTOMERS` is logged but not used for dispatch. The field name `getCustomers` is what `resolveField` receives.

### Adding a new field

```ts
// In resolveField():
if (field === "getMyNewResource") return paginated([myFixture]);
if (field === "getMyNewResourceById") return myFixture;
if (field === "myNewScalar") return "some-string-value";
```

Add it before the generic fallback at the bottom. The fallback `return paginated([genericLog])` handles unknown fields gracefully.

### Logging operations

The GraphQL handler logs every operation to SQLite:

```ts
recordSaasPlatformAdminOperation(operationName, rootFields, variables);
```

This is useful for debugging — you can query the SQLite database to see exactly what operations the client is calling:

```bash
sqlite3 data/projects-demo-api.sqlite \
  "SELECT operation_name, root_fields, created_at FROM saas_platform_admin_graphql_events ORDER BY created_at DESC LIMIT 20;"
```

---

## Reference: REST Projects

For REST-only projects, the pattern is simpler.

### Controller factory pattern

```ts
// controllers/products.ts
import { Request, Response } from "express";
import { sendSuccessFeedback } from "../../../functions/feedback.js";
import { products, paginated } from "./fixtures.js";

export const ProductsController = () => {
  const GetProducts = (_req: Request, res: Response) => {
    return sendSuccessFeedback(res, "Products fetched.", paginated(products));
  };

  const GetProduct = (req: Request, res: Response) => {
    const { id } = req.params;
    const product = products.find((p) => p.id === id) ?? products[0];
    return sendSuccessFeedback(res, "Product fetched.", product);
  };

  return { GetProducts, GetProduct };
};
```

### Response shape

The default shape is:
```json
{
  "success": true,
  "message": "Readable message",
  "data": { ... }
}
```

If the client expects a different shape (e.g., raw array, or `{ items: [], total: 0 }`), match the client. Portfolio compatibility takes priority over the default convention.

### Validation

Use `express-validator` for routes where the client sends a body that matters:

```ts
import { body, validationResult } from "express-validator";

SlugRouter.post(
  "/auth/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  Auth.Login,
);
```

---

## Reference: Known Pitfalls

A consolidated list of issues encountered across projects, with their fixes.

### Backend pitfalls

| Issue | Cause | Fix |
|---|---|---|
| `Cannot find name 'process'` in ESLint | Missing Node globals in eslint config | Add `globals.node`, set `"no-undef": "off"` |
| `Cannot find name 'Buffer'` in ESLint | Same as above | Same fix |
| Import path missing `.js` extension | ESM TypeScript requires explicit extensions | Always use `./file.js` not `./file` |
| `Request` generic type error | `Request<never, never, T>` overload conflict | Use `Request & { body: T }` instead |
| Duplicate `const` declarations | File was partially overwritten and appended | Delete and rewrite the file cleanly |

### Client pitfalls

| Issue | Cause | Fix |
|---|---|---|
| `ERR_OSSL_EVP_UNSUPPORTED` | CRA 4 + Node 22 | `node --openssl-legacy-provider` in start/build scripts |
| App stuck on loader after `.env` change | Old GraphQL URL cached in localStorage | Prefer `.env` URL in demo mode, ignore localStorage |
| `pathname` TypeError on route render | Route constant key missing from constants file | Diff used vs defined keys, add missing ones |
| `RangeError: Invalid time value` | `new Date(null)` or `new Date(NaN)` | Guard date utilities; fix fixture date format |
| `X.map is not a function` | Fixture returns object, component expects array | Return array or `paginated()` result |
| `X.toUpperCase is not a function` | Fixture returns number/null where string expected | Fix fixture field type |
| Firebase analytics warning | Analytics SDK initializes even in demo mode | Acceptable — Firebase auth is bypassed, analytics is cosmetic |
| `import/named` error | Named export missing from source file | Add the missing export |
| `prefer-default-export` warning | Utility file has only named exports | Add `export default` re-export |
| Upload response not handled | Client destructures array item, backend returns object | Return array from upload route |
| Demo JWT permissions gate wrong routes | JWT payload missing required permission strings | Add all permissions to the demo JWT payload |
