# AGENTS.md

This repository is a local dummy backend for portfolio projects. It exists so old frontend and mobile projects can keep working after their original backend services or external APIs have been shut down.

## Core Goal

Build and maintain `projects-demo-api` as a TypeScript + Express + SQLite API that returns realistic dummy data. Each frontend/mobile portfolio project should point to this API instead of its old remote backend. The responses must preserve the shape and behavior expected by the original app, but no route should depend on external services, cloud databases, email providers, payment providers, or API keys.

## Architecture Rules

- Use TypeScript and Express.
- Use SQLite through `better-sqlite3`; the local database file is created at `data/projects-demo-api.sqlite`.
- Do not require environment variables for normal operation.
- Keep the code functional. Do not introduce classes or OOP service layers.
- Follow the same broad style as `Testimoniies.com/testimonies-com-backend`: route files call controller factory functions, controllers return named handler functions, and shared feedback helpers shape responses.
- Every portfolio project owns its own folder under `src/projects/{project-name}`.
- Each project folder must contain:
  - `types/`
  - `routes/`
  - `controllers/`
  - `database/`
  - `index.ts`
- Register every project module in `src/projects/index.ts`.
- Project modules are mounted directly from `src/index.ts` using each module's `basePath`; do not add a separate `/api` or versioned router layer unless the user asks for it.
- Do not mix project-specific tables, row types, or route handlers into shared folders unless the logic is genuinely reusable.
- Keep shared files small and boring: config, feedback helpers, common middleware, and project registration.

## Database Rules

- Project-owned database setup belongs in `src/projects/{project-name}/database/index.ts`.
- Create tables with `CREATE TABLE IF NOT EXISTS`.
- Seed dummy data only when a table is empty.
- Prefix table names with the project name, for example `example_store_users`.
- Store OTPs in SQLite. Assume email delivery succeeds and return `emailSent: true` when useful for the frontend.
- Dummy passwords can be plain text when matching old demo behavior. Do not add real auth complexity unless a frontend needs that response shape.
- If the old backend returned tokens, return deterministic demo tokens such as `demo-token-{id}`.
- Use consistent demo credentials across all projects: email `demo@demo.com` / password `password`. Every new project must seed at least one user with these exact credentials so logins work identically everywhere.
- **ALL data must be stored in SQLite tables.** No in-memory fixture arrays in controllers. Controllers must read/write all domain data through `sqlite.prepare(...)` queries. Static reference data (image URLs, country/state/city lists) that is not user-generated may remain as in-memory constants if it has no corresponding DB table. Exception: very simple GraphQL mutation responses that return `{ success: true }` without domain data do not need a DB round-trip.

## External API Rules

- If a frontend used an external API like Google Maps, Stripe, SendGrid, Firebase, or another service, create a local dummy replacement route in this backend.
- The frontend/mobile project should comment out the real implementation and point to the local route.
- Preserve the old app behavior and response shape as closely as possible.
- Do not call the real external API from this repository.
- Current example: `src/projects/external-apis/google-maps` exposes local Google Maps-style place search and geocode routes.

## Client Compatibility Edge Cases

- Always inspect the client before adding dummy routes. Do not guess route names from page names alone. Look for:
  - REST helpers such as Axios wrappers.
  - GraphQL client setup and `.graphql`/`gql` documents.
  - Auth token storage and token parsing.
  - Firebase, Google Maps, analytics, upload, payment, email, and other external SDK calls.
  - Required response shapes used by components, not just operation names.
- If a client uses GraphQL, create a local `POST /{project}/graphql` endpoint. It can be a lightweight GraphQL-compatible HTTP handler; it does not need a full schema if the goal is portfolio demo behavior. It must return `{ data: { fieldName: value } }`.
- For GraphQL-heavy legacy apps, route by requested root fields when a full schema would be too large. Return data for every root field in the request, and make list responses include common shapes such as `nodes`, `data`, `items`, `total`, `count`, and `pageInfo` when the client uses mixed conventions.
- Keep operation logging in SQLite when useful. The SaaS platform admin module records operation name, root fields, variables, and timestamp in `saas_platform_admin_graphql_events`.
- If the old app expected Firebase custom-token login, the backend cannot realistically create a valid Firebase token without the original Firebase service account. Patch the client only for local demo mode so Firebase is bypassed when the local dummy backend URL is active, while preserving the original Firebase path for real backends.
- If a client parses JWT permissions locally, create a demo JWT with the expected payload shape and all permissions required for navigation. For Alerzo this is done in both the backend fixture and the client demo auth helper.
- If a client stores a backend URL in localStorage, make demo mode prefer the current local `.env` URL over stale localStorage values. Otherwise an old saved URL can keep the app stuck on a loader even after `.env` is corrected.
- If a legacy React app uses CRA 4/Webpack 4 on modern Node, `yarn start` may fail with `ERR_OSSL_EVP_UNSUPPORTED`. Patch scripts to run React Scripts through `node --openssl-legacy-provider` instead of upgrading dependencies during demo-backend work.
- If a client upload helper expects an array response, return an array directly. For the SaaS platform admin upload route, `POST /saas-platform-admin-web/upload/media` returns `[{ id, filename, type, url }]`, because callers destructure array items.
- Do not remove SDK imports if a demo-mode guard is enough. Keep the original code path intact and gate local-only behavior with the local backend URL.
- Update `PROGRESS.md` after meaningful changes. Include what was changed, what was verified, known warnings, and the next likely work item.

## Response Rules

- Use `sendSuccessFeedback`, `sendErrorFeedback`, `sendValidationErrorFeedback`, and `sendCatchFeedback`.
- The default response shape is:

```json
{
  "success": true,
  "message": "Readable message",
  "data": {}
}
```

- If a frontend expects a different exact shape, match the frontend. Portfolio compatibility is more important than one global response convention.
- Validation should use `express-validator` where request bodies or params matter.

## Adding A New Portfolio Project

1. Inspect the frontend/mobile project and identify its base API URL, endpoints, request payloads, expected response bodies, auth/token behavior, and any external API usage.
2. Choose an anonymized module name that describes what the project does, not the original client/company/project name. For example, use `saas-platform-admin-web` instead of a real client admin app name. This preserves anonymity when the repository is pushed publicly.
3. Use the anonymized name everywhere in the dummy backend and client demo wiring:
  - `src/projects/{anonymized-module-name}`
  - `basePath: "/{anonymized-module-name}"`
  - local client `.env` URLs
  - README route examples
  - progress notes
4. Do not expose the original private project name in public-facing route paths, module names, table names, README examples, or generated fixtures. If a private name already exists in old notes, document the intended anonymized replacement before public release.
5. Create `src/projects/{anonymized-module-name}` by copying `src/projects/_template`.
6. Add project-specific types, database tables, seed data, controllers, and routes.
7. Export a `ProjectModule` from `src/projects/{anonymized-module-name}/index.ts`.
8. Register the module in `src/projects/index.ts`.
9. Update this file, `README.md`, and `PROGRESS.md` with the new route list and any frontend integration notes.
10. Run `npm run type:check` and test the relevant endpoints locally.

## AI Agent Prompt For Adding A Project

Use this prompt when asking an AI agent to connect a portfolio project to this dummy backend:

```text
You are working in the `projects-demo-api` repository. Add a dummy backend module for the portfolio project at [PROJECT_PATH].

First inspect the frontend/mobile project and find every backend or external API integration it uses: base URLs, endpoint paths, HTTP methods, request bodies, auth headers, expected response shapes, error states, and third-party services. Then choose an anonymized project slug that describes what the project does without exposing the original company/client/project name. For example, use `saas-platform-admin-web` instead of a real client admin app name. Create the new folder under `src/projects/[ANONYMIZED_PROJECT_SLUG]` with `types`, `routes`, `controllers`, `database`, and `index.ts`.

Use TypeScript, Express, functional controller factories, and SQLite via the shared `sqlite` connection. Do not use OOP. Do not require environment variables. Do not call external services. Seed realistic dummy data locally. For email or OTP flows, assume sending succeeds and store the OTP in SQLite. For external APIs like Google Maps, create local replacement routes under this backend, then update the frontend/mobile project by commenting out the real implementation and pointing it to the local dummy route while preserving behavior.

Register the project in `src/projects/index.ts`, update `README.md`, `AGENTS.md`, and `PROGRESS.md`, run type checking, and list the routes that were added. Use only the anonymized slug in public-facing backend route paths and docs.
```

## Current Modules

- `saas-platform-admin-web`: GraphQL and upload dummy backend for an admin dashboard client at `/saas-platform-admin-web`.
  - GraphQL endpoint: `POST /saas-platform-admin-web/graphql`.
  - REST upload endpoint: `POST /saas-platform-admin-web/upload/media`.
  - The client `.env` points `REACT_APP_API_URL` and `REACT_APP_GRAPHQL_URI` to this local module.
  - The client `src/services/auth.js` keeps Firebase for normal backends but bypasses Firebase when the local demo backend URL is active, because the original custom-token service is unavailable.
  - The client `src/graphql/index.js` prefers the local demo GraphQL URL over stale `APP_GRAPHQL_URI` localStorage values when demo mode is active.
  - The client `package.json` start/build scripts use `node --openssl-legacy-provider` because React Scripts 4/Webpack 4 fails on Node 22 without it.
  - Demo login accepts any username/password; use `demo` / `password` for consistency.
- `example-store`: sample ecommerce/auth module at `/example-store`.
- `external-api-google-maps`: sample third-party replacement module at `/external/google-maps`.
- `retail-pos-web`: GraphQL + REST dummy backend for a retail POS / business management web app at `/retail-pos-web`.
  - GraphQL endpoint: `POST /retail-pos-web/graphql` — covers all urql queries used by the client (dashboard, inventory, sales, expenses, invoices, customers, staff, POS terminals, referrals, reports, account/wallet, notifications, roles, business plans, sectors).
  - OAuth token endpoint: `GET /retail-pos-web/oauth/token/:code` — returns `{ token, isPasscodeSet: true }` where `token` is a demo JWT with the expected user/business payload shape.
  - Token refresh: `POST /retail-pos-web/oauth/refresh`.
  - Media upload: `POST /retail-pos-web/upload/media` — returns `[{ url }]` (array, as expected by `uploadMedia()` in `libs.ts`).
  - Passcode: `POST /retail-pos-web/auth/passcode/verify` and `POST /retail-pos-web/auth/passcode/set`.
  - VAS (Value Added Services): airtime, data bundles, electricity (discos + resolve + purchase), cable TV (providers + packages + resolve + purchase) — all under `/retail-pos-web/payapi/...`.
  - Loan API proxy: `GET /retail-pos-web/loan` and `POST /retail-pos-web/loan/apply` — replaces `REACT_APP_LOAN_API_BASE_URL_DEV`.
  - Client `.env` changes:
    - `REACT_APP_API_BASE_URL=http://localhost:5050/retail-pos-web/graphql`
    - `REACT_APP_API_REST_URL=http://localhost:5050/retail-pos-web`
    - `REACT_APP_MEDIA_URL=http://localhost:5050/retail-pos-web/upload/media`
    - `REACT_APP_GETTOKENBASEURL=http://localhost:5050/retail-pos-web/oauth/token`
    - `REACT_APP_REFRESH_TOKEN=http://localhost:5050/retail-pos-web/oauth/refresh`
    - `REACT_APP_LOAN_API_BASE_URL_DEV=http://localhost:5050/retail-pos-web/loan`
  - Client `src/utils/firebase.ts` patched: `loginWithCustomToken`, `firebaseLogout`, `getCurrentUser`, `getRefreshToken`, `getUserStatus` all check `isDemoBackend()` and bypass Firebase when `REACT_APP_GETTOKENBASEURL` includes `localhost:5050`. The demo token is returned directly.
  - Client `src/pages/auth-page/sign-in.tsx` patched: in demo mode, clicking Login skips the OAuth redirect and navigates directly to `/auth?code=demo-code&state=...` with a stored nonce, so the callback hook calls the local token endpoint.
  - Client `src/hooks/components/useOauthCallbackHook.ts` patched: `getToken()` uses `"demo-firebase-uid"` as the Firebase UID in demo mode instead of calling `getCurrentUser()?.uid` (which returns `null` when Firebase is bypassed).
  - React Scripts 5 / Node 22 — no OpenSSL patch needed.
- `cap-admin-web`: GraphQL + REST + Socket.IO dummy backend for the Zeebly Admin (cap-admin) client at `/cap-admin-web`.
  - GraphQL endpoint: `POST /cap-admin-web/graphql` — covers 50+ queries and mutations (dashboard, centres, partners, reps, orders, inventory, audit trail, notifications, settings, auth).
  - REST upload/download endpoints at `/cap-admin-web/api/upload/...` (product images, CSV uploads, admin profile images, audit trail download).
  - REST auth endpoint: `POST /cap-admin-web/api/auth/refresh-token` — returns `x-token`/`x-refresh-token` response headers.
  - Socket.IO namespace `/cap-admin-web` — handles `admin-notify-all` event with acknowledgment callback.
  - Client `.env` points `REACT_APP_BASE_API`, `REACT_APP_GRAPHQL_API`, and `REACT_APP_REST_API` to this local module.
  - Auth: `authenticateAdminUser` GraphQL mutation returns `{ data, status, statusCode, message }` + `x-token`/`x-refresh-token` response headers.
  - Demo credentials: `admin@adminportal.com` / any password.
  - Token refresh handled by Apollo RetryLink via REST `/auth/refresh-token`.
- `inventory-admin-web`: GraphQL and upload dummy backend for a Veedez Admin client at `/inventory-admin-web`.
  - GraphQL endpoint: `POST /inventory-admin-web/graphql`.
  - REST upload endpoint: `POST /inventory-admin-web/upload/media`.
  - Client `.env` points API URLs to this local module.
  - Client auth bypass using `isDemoBackend` for Firebase.
- `bible-quiz-platform`: REST dummy backend for A1Quest Bible quiz platform at `/bible-quiz-platform/api/v1`.
  - 120+ endpoints covering auth, learning, payments, reports, and admin CRUD for a1quest-web (Next.js) and a1quest-admin-web (CRA).
  - Auth: User login `POST /auth/login`, admin login `POST /admin/login` — returns `{ success, message, data: { user/admin, token } }` where token is `demo-token-{id}`.
  - Auth middleware: `Bearer` token decoded from `demo-token-{id}` prefix; `userAuth` sets `req.userId`, `adminAuth` sets `req.adminId`.
  - User auth routes: `POST /auth/register`, `/auth/verify-code`, `/auth/verify-otp`, `/auth/resend-code`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`.
  - User profile routes: `GET /user`, `PUT /user`, `PUT /update-password`, `DELETE /delete-account`.
  - Learning routes (all under `/learning/`): `POST classes`, `cbt`, `popular-topics`, `topics`, `sub-topics`, `view-topic`, `view-sub-topic`, `lessons`, `view-lesson`, `take-test`, `submit-test/:testId`, `tests`, `track-progress`, `free-videos`; `GET view-topic/:id`, `view-sub-topic/:id`, `view-lesson/:id`, `test-review/:testId`, `test-performance/:testId`, `user-lesson/:lessonId`, `bookmarks`, `enrolled-topics`, `enroll-topic/:topicId`, `recent-learning`, `streak`; `POST/DELETE bookmarks/:bookmarkId`.
  - Quiz system: `POST /learning/take-test` selects random questions from specified topic/sub-topic; `POST /learning/submit-test/:testId` grades answers against stored correct options, stores review, updates leaderboard with points (10 per correct answer).
  - Payment routes: `POST /payment/plans`, `/payment/transactions`, `/payment/initiate`, `GET /payment/verify/:reference`.
  - Reports: `POST /report-analytics`, `GET /user-performance`.
  - Misc user routes: `GET /leaderboard`, `/notifications`, `/faqs`, `/achievements`, `/settings`, `/client-settings`, `/upload-url`; `POST /contact`, `/forgot-password`, `/reset-password`, `/settings`, `/client-settings`, `/upload`, `/create-streak`.
  - Admin auth: `POST /admin/login`.
  - Admin dashboard: `GET /admin/dashboard` returns aggregate stats (users, classes, topics, lessons, questions, transactions, revenue, active subscriptions, enrollments).
  - Admin CRUD routes: full REST CRUD (`GET/POST + GET/PUT/DELETE :id`) for classes, topics, sub-topics, lessons, questions, roles, achievements, FAQs, plans, broadcasts, notifications.
  - Admin users: `GET /admin/users`, `GET/DELETE /admin/users/:id`.
  - Admin transactions: `GET /admin/transactions`, `DELETE /admin/transactions/:id`.
  - Admin feedback: `GET /admin/pending-feedbacks`, `GET/DELETE /admin/feedbacks/:id`.
  - Admin leaderboard: `GET /admin/leaderboard`, `DELETE /admin/leaderboard/reset`.
  - Admin misc: `GET/POST /admin/client-settings`, `GET /admin/upload-url`, `POST /admin/upload`.
  - Response shape: `{ success, message, data, count? }` across all endpoints.
  - Demo credentials (user): `demo@a1quest.com` / `password`.
  - Demo credentials (admin): `admin@a1quest.com` / `password`.
  - Client `.env` for a1quest-web (Next.js): `NEXT_PUBLIC_API_URL=http://localhost:5050/bible-quiz-platform/api/v1`.
  - Client `.env` for a1quest-admin-web (CRA): `VITE_API_URL=http://localhost:5050/bible-quiz-platform/api/v1` (must use `REACT_APP_` prefix if React env convention is required).
- `mono-web`: REST dummy backend for Castle Stash real-estate crowdfunding web app at `/mono-web/techmillresource/mono-api/api`.
  - 25 POST endpoints covering auth, registration, 2FA, password reset, profile, wallet (fund/cash out), transactions, property listings, investments, banks, audit trail.
  - Demo credentials: `demo@castlestash.com` / `Password1`.
  - Client `.env` already points `REACT_APP_API_URL` to `http://localhost:5050/mono-web/techmillresource/mono-api/api`.
  - No Firebase or external SDK integration — plain `fetch()` calls with `uikey` header.
  - Payment gateways (CuePay, Paystack, Monnify) are client-side redirects; no server-side integration needed.
- `food-delivery-admin`: REST dummy backend for a food delivery admin web app at `/food-delivery-admin`.
  - ~100 endpoints under `/admin/v1`: auth (signin, register, forgot/reset password, verification), profile (me, update-self, update-password, update-email, profile-image), dashboard (stat), full REST CRUD (GET all, GET single/:id, POST create, PATCH update, DELETE, PATCH activestatus) for 24 resources (users, zones, restaurants, vendors, categories, products, banners, promos, coupons, food-types, delivery-fees, orders, settings, wallet-transactions, riders, notifications, top-vendors, marketers, payout-history, customer-orders, subscription, review, referals, complaint), plus approve endpoints, permissions, toggle-active-status, and miscellaneous (marketers/pay, agreement emails, food-categories set-priority). All routes flat under `/admin/v1`.
  - Demo credentials: `demo@fooddelivery.com` / `password`.
  - Client `app.json` `ADMIN_API` should point to `http://localhost:5050/food-delivery-admin/admin/v1`.
- `food-delivery-web`: REST dummy backend for a food delivery customer web app at `/food-delivery-web`.
  - 74 endpoints across 4 API groups: user API (login, register, profile, addresses, update-password), main API (restaurants, menu, orders, cart, checkout, Paystack mock, blog, reviews, banners, notifications), vendor API (login, dashboard, orders, products, earnings), admin API (health).
  - Demo credentials: `demo@fooddelivery.com` / `password`.
  - Client `.env` should point `REACT_APP_USER_API`, `REACT_APP_API_URL`, `REACT_APP_VENDOR_API` to corresponding paths under `http://localhost:5050/food-delivery-web`.
- `artisan-services-admin`: REST dummy backend for an artisan services admin panel at `/artisan-services-admin`.
  - 54 endpoints under `/admin/v1`: auth, dashboard, artisan CRUD + verification, customer CRUD, admin management, tickets, disputes, appointments, notifications, waiting-list, settings, categories/subcategories, payment transactions, reports, active customers, visits.
  - Demo credentials: `demo@artisanservices.com` / `password`.
  - Client `.env` should point `REACT_APP_API_URL` to `http://localhost:5050/artisan-services-admin/admin/v1`.
- `artisan-services-web`: REST dummy backend for an artisan services customer web app (Next.js) at `/artisan-services-web`.
  - 47 endpoints under `/api/v1`: auth (register, login, code get/verify, forgot/reset password, logout, deactivate), profile (update, password, image), artisan listing/search/detail/update (all/artisan, single/artisan/:id, artisan photo, NIN, personal, business, business-hours, socials), portfolio (list, create, delete), booking (create, all, single, update), favourite (list, toggle), rating (list, submit), dispute (list, create, responses), chat (all, send, highlights), notification (all, update), wallet (all, detail), categories (public), feedback (public), analytics views.
  - Response shape: `{ success: true, message, data: { results: [...] } }` for list endpoints, `{ success: true, message, data: { ... } }` for single entity endpoints.
  - All IDs use MongoDB-style `_id` (string). Related entities embedded as nested objects.
  - Demo credentials: `demo@artisanservices.com` / `password`.
  - Client `next.config.js` API URLs should point to `http://localhost:5050/artisan-services-web` (base) with routes under `/api/v1/`.
- `real-estate-admin`: REST dummy backend for a real estate admin panel at `/real-estate-admin`.
  - 47 endpoints under `/api`: auth (login, register, forgot/reset password), full CRUD for developments, grows (investments), properties, blog, plus users, transactions, contacts, invoices, reviews, settings, dashboard.
  - Demo credentials: `demo@realestate.ng` / `password`.
  - Client `.env` should point `REACT_APP_API_URL` to `http://localhost:5050/real-estate-admin/api`.
- `logistics-admin`: GraphQL + REST dummy backend for a shipping admin web app at `/logistics-admin`.
  - GraphQL endpoint: `POST /logistics-admin/graphql` — covers login, parcels, dashboard, shipping pricing, disputes, transactions, users, team members, notifications, profile, roles, tracking, analytics, settings.
  - REST endpoints: `POST /login`, `POST /forgot-password`, `GET /dashboard-summary`, `POST /file-upload-signed-url`.
  - Demo credentials: `admin@logistics.africa` / `password`.
  - Client `.env` should point `REACT_APP_API_URL` or GraphQL URI to `http://localhost:5050/logistics-admin/graphql`.
- `logistics-web`: GraphQL + REST dummy backend for a shipping customer web app (Next.js) at `/logistics-web`.
  - GraphQL endpoint: `POST /logistics-web/graphql` — covers login, registration, parcels, shipping prices, countries/cities, notifications, wallet/transactions, profile.
  - REST endpoints: `POST /login`, `POST /forgot-password`, `GET /google-place-details`.
  - Demo credentials: `demo@logistics.africa` / `password`.
  - Client `.env` should point `NEXT_PUBLIC_API_URL` or GraphQL URI to `http://localhost:5050/logistics-web/graphql`.
- `logistics-client`: REST dummy backend for a Vue 3 shipping customer app at `/logistics-client`.
  - 20 endpoints under `/v1`: auth (login, register, verify-otp, forgot/reset password), packaging CRUD, shipping CRUD + invoice/status/history, address CRUD + location, user profile/password/phone, dashboard summary/chart/table.
  - Demo credentials: `demo@logistics.io` / `password`.
  - Client `.env` should point `VITE_API_URL` to `http://localhost:5050/logistics-client/v1`.
- `event-marketplace-web`: GraphQL dummy backend for an event marketplace mobile app at `/event-marketplace-web`.
  - GraphQL endpoint: `POST /event-marketplace-web/graphql` — covers auth, user listings, brands, events CRUD, chat, follow, media upload, notifications, Stripe payment operations.
  - Session/cookie-based auth (`credentials: 'include'`).
  - ~43 GraphQL operations with MongoDB-style `_id` string IDs.
  - Response shape: `{ statusCode, success, message, data }` with paginated `{ total, data: [...] }`.
  - Demo credentials: `demo@demo.com` / `password`.
  - Client `.env` should point Apollo URI to `http://localhost:5050/event-marketplace-web/graphql`.
  - Socket.IO chat at ws://localhost:5050 (path `/my-custom-path/`) — not yet wired.
- `freelancer-marketplace-web`: GraphQL dummy backend for a freelancer marketplace web app at `/freelancer-marketplace-web`.
  - GraphQL endpoint: `POST /freelancer-marketplace-web/graphql` — covers auth, homepage data, master categories, categories, profile/listings, search, browse, sort/saved lists, chat, notifications, follow, rating, social auth redirects.
  - Session/cookie-based auth (`credentials: 'include'`).
  - ~60+ GraphQL operations with MongoDB-style `_id` string IDs.
  - Social auth redirect endpoints: `/google`, `/facebook`, `/linkedin`.
  - Response shape: `{ statusCode, success, message, data }`.
  - Demo credentials: `demo@demo.com` / `password`.
  - Client `.env` should point `NEXT_PUBLIC_APP_SERVER` to `http://localhost:5050/freelancer-marketplace-web`.
  - Socket.IO chat at ws://localhost:5050 (path `/my-custom-path/`) — not yet wired.

## Quality Bar

- Keep changes focused on compatibility with the portfolio app being added.
- Do not refactor unrelated modules.
- Prefer realistic dummy records over empty placeholder responses.
- Preserve old frontend behavior before adding new backend conventions.
- Keep route names and response fields stable once a frontend has been pointed to them.
