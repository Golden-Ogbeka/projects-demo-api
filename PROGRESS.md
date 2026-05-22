# Progress

## 2026-05-21

### Project Created

- Created `projects-demo-api` as a TypeScript + Express + SQLite local dummy backend.
- Mounted project modules directly from `src/index.ts`; there is no `/api/v1` layer.
- Added shared feedback helpers, SQLite setup, logger/error middleware, project template, README, and AGENTS rules.
- Added sample modules:
  - `/example-store`
  - `/external/google-maps`

### SaaS Platform Admin Web

Client path: private source client outside this repository.

Backend module path:

```text
C:\Users\user\Documents\Programming\Projects\projects-demo-api\src\projects\saas-platform-admin-web
```

Implemented:

- `POST /saas-platform-admin-web/graphql`
- `GET /saas-platform-admin-web/graphql`
- `POST /saas-platform-admin-web/upload/media`
- `GET /saas-platform-admin-web`

GraphQL behavior:

- The endpoint reads `operationName`, `query`, and `variables`.
- It extracts root fields from the GraphQL query.
- It returns `{ data: { [rootField]: dummyValue } }`.
- It logs operation names, root fields, and variables to SQLite table `saas_platform_admin_graphql_events`.
- It includes fixtures for auth, permissions, users, customers, products, orders, warehouses, fleet/routes, vehicles, sellers, vendors, payments, fees, marketing, and generic mutation success states.

Client adjustments:

- Updated `.env`:

```text
REACT_APP_API_URL=http://localhost:5050/saas-platform-admin-web
REACT_APP_GRAPHQL_URI=http://localhost:5050/saas-platform-admin-web/graphql
```

- Patched `src/services/auth.js`:
  - Preserves Firebase behavior for non-demo backends.
  - Bypasses Firebase only when `REACT_APP_API_URL` includes `localhost:5050/saas-platform-admin-web`.
  - Creates a local demo JWT with all permissions needed by the dashboard.

- Patched `src/graphql/index.js`:
  - In local demo mode, it prefers `REACT_APP_GRAPHQL_URI` over any saved `APP_GRAPHQL_URI` in localStorage.
  - Reason: an old saved GraphQL URL can keep the app stuck on the initial loader after backend route renames.

- Patched `package.json`:
  - `start`: `node --openssl-legacy-provider ./node_modules/react-scripts/scripts/start.js`
  - `build`: `node --openssl-legacy-provider ./node_modules/react-scripts/scripts/build.js`
  - Reason: CRA 4/Webpack 4 fails on Node 22 with `ERR_OSSL_EVP_UNSUPPORTED` unless legacy OpenSSL provider is enabled.

Verification:

- `projects-demo-api`: `npm.cmd run type:check` passed.
- `projects-demo-api`: `npm.cmd run build` passed.
- Backend runtime checked:
  - `GET /saas-platform-admin-web`
  - `POST /saas-platform-admin-web/graphql` for `GET_COUNTRY_URL`, `AUTHENTICATE`, `GET_USER`, `GET_CUSTOMERS`, `GET_ALL_PRODUCTS`
  - `POST /saas-platform-admin-web/upload/media`
- Alerzo client:
  - `yarn.cmd start` initially failed with `ERR_OSSL_EVP_UNSUPPORTED`.
  - After script patch, `yarn.cmd start` runs and listens on port `3000`.
  - `yarn.cmd build` passes with warnings after the same OpenSSL script patch.
  - Browser smoke test reached `http://localhost:3000/auth/sign-in`.
  - Demo login reached the dashboard at `http://localhost:3000/dashboard?page=1&size=50&stateId=*`.

Known non-blocking browser warnings:

- React warning: `endAdornment` prop is passed to a DOM element by an existing input component.
- React warning: Sidebar list children need unique keys.
- Firebase analytics warning about local measurement ID mismatch. Firebase auth is bypassed in demo mode, but analytics SDK still initializes.
- Production build warning: multiple existing CSS module order conflicts from `mini-css-extract-plugin`.
- Production build warning: `caniuse-lite` is outdated.

### Demo data population (list pages)

Backend:

- Expanded fixtures for users (3), customers (3), sellers (2), vendors (2), catalog/variant products, bundles, banners, coupons, and promotions.
- All image fields use Unsplash URLs via shared `UNSPLASH` constants.
- Fixed GraphQL field name mismatches: `getCouponCodes`, `fetchVerticals`, `getAllSubCategories`, `fetchSubCategoryAttributes`.
- `getProducts` / `getAllProductsNew` return variant-shaped nodes (`images.imageUrl`, `pricing`, `displayTitle`).
- `fetchAllBanners` returns `mobileVersion` / `desktopVersion` arrays with `imageUrl`.
- Vendors include `vendorType`, `referenceId`, and `image` for table rendering.

Client (`alerzo-admin-web`):

- Added `src/utils/demoBackend.js`; customers page auto-loads demo search on mount in demo mode.
- Defensive guards: `PrimaryLink`, banners/bundles tables, vendors `toUpperCase`, users/customers table `nodes` defaults, `TableNew` row mapping.

Verification:

- Curl smoke test: users 3, customers 3, sellers 2, vendors 2, products 2, coupons 1, banners with imageUrl, bundles 1.

### Demo hardening (continued)

Backend (`saas-platform-admin-web`):

- Added dashboard analytics fixtures: `getOrderPerformance`, `getSalesBySegment`, `getInventoryMetrics`, `getStockByCategory`, `getTotalSales`, `getTopSellingProducts`, `getTopProductsByCancellation`, `getSalesTrend`.
- Added `retrieveForcastByWarehouseId`, `getWarehouseDeliveryPlans`, and `lastVehicleOperationDate` fixtures.
- Enriched order fixtures for list/detail UI (`displayStatus`, `Stores`, `platform`, payment flags, second sample order).
- Enriched fleet route fixtures (`driverName`, `ordersCount`, `eta`, `status`, etc.).
- Fixed todo fixture `todoType` to `Order` so Todos links resolve correctly.
- Paginated `pageInfo` now includes `currentPage` for tables that read it.
- Unknown list queries now return empty paginated results instead of generic log rows (avoids broken table links).
- `createBundle` mutation returns `{ success, bundle }` for post-create navigation.

Client (`alerzo-admin-web`):

- `PrimaryLink` no longer renders a router `Link` when `link` is undefined (prevents `Cannot read properties of undefined (reading 'pathname')`).
- Demo mode no longer overwrites `APP_GRAPHQL_URI` in localStorage from `getCountryUrl`.

Verification:

- `npm run type:check` passed in `projects-demo-api`.
- Curl checks passed for `getOrderPerformance`, `orders`, `getTopSellingProducts`, `getSalesTrend`, and `fetchRoutesList`.

Next likely work:

- Walk remaining sidebar sections (Marketing detail pages, POS, Visitation logs, restriction) and add field-specific fixtures only where empty fallbacks still break UI.
- Consider adding local dummy replacements for Google Maps UI usage only if map views must work offline. Current app still loads Google Maps scripts using the existing key.

---

## 2026-05-21 (continued)

### Alerzo Admin Web — full demo hardening

Client: `alerzo-admin-web` (anonymized as `saas-platform-admin-web` in all public paths).

#### Route constant fix

- `TypeError: Cannot read properties of undefined (reading 'pathname')` traced to `USER_TRACKING` and `USER_TRACKING_USER_DETAILS` being used in `src/pages/dashboard/routes/index.js` but not defined in `src/pages/dashboard/routes/constants.js`.
- Added both constants pointing to `/dashboard/users/tracking` and `/dashboard/users/tracking/:id`.

#### GraphQL fixture expansion

- Expanded `resolveField` in `graphql.ts` to cover all ~150 operation root fields used by the client.
- Added fixtures for: terminals/POS, delivery fees, processing fees, distributor, warehouse operations (procurements, transfers, incidents, purchase requisitions, in-store transactions), todos, visitation logs (pricing survey, public relations, BDE), vehicle requests, vehicle documents/accessories, delivery plans, scheduled jobs, stock forecast, dashboard analytics (order performance, sales by segment, inventory metrics, stock by category, total sales, top selling products, top products by cancellation, sales trend).
- `getTasks` / `getDownloables` now returns `updatedAt` as a numeric millisecond timestamp string (`String(Date.now())`) to match the client's `Number(values.updatedAt)` pattern.
- `taskResult` now returns `{ result: "https://..." }` so the download button's `handleDownload(values.taskResult)` destructure works.
- `taskName` set to `"Customer CSV"` with realistic `args` so the description column renders.

#### Date utility hardening

- `src/utils/date.js` `formatDate` and `formatISODate` now guard against `null`, `undefined`, and `Invalid Date` — returns `'-'` / `''` instead of throwing `RangeError: Invalid time value`.
- `Downloads/Table.js` `cellRenderer` now handles both numeric timestamp strings and ISO strings for `updatedAt`.

#### Lint fixes

**Backend (`projects-demo-api`):**
- `eslint.config.js`: added `globals.node`, disabled `no-undef` (TypeScript handles it), delegated unused-vars to `@typescript-eslint/no-unused-vars` with `_` prefix pattern.
- `graphql.ts`: removed unused `bundleProducts` import; removed stale `eslint-disable-next-line complexity` directive.

**Frontend (`alerzo-admin-web`):**
- `Button/index.test.js`: removed trailing space and extra blank line.
- `PhoneInput/index.test.js`: removed trailing space and padded block.
- `MultiSelect/index.test.js`: removed unused `sinon` import.
- `index.test.js`: converted double quotes to single quotes, added `eslint-disable global-require`, added missing EOF newline.
- `product.js`: added missing `DELETE_MANUFACTURER` mutation export.
- `Warehouses/StockForecast/Tablerow.js`: added missing `localStyles` import; created `style.module.css`.
- `utils/demoBackend.js`: added `export default isDemoBackend`.

#### Documentation

- Created `docs/ADDING-A-PROJECT.md` — full end-to-end guide for wiring any portfolio project to this dummy backend, covering inspection, slug choice, module creation, client wiring, all known compatibility fixes, and a pitfalls reference table.

Verification:

- `npm run type:check` passed.
- `npm run build` passed.
- `npm run lint` — zero errors, zero warnings.
- `npx eslint src --ext .js` in `alerzo-admin-web` — zero errors.
- Backend smoke tests: `GET /saas-platform-admin-web`, `POST /saas-platform-admin-web/graphql` for `getCountryUrl`, `authenticateUser`, `getUser`, `getAllToDo`, `getTasks`, `getCustomers`, `orders`, `getWarehouses`.
- Browser: sign-in → dashboard → customers (search loads rows) → todos (table renders with date) → downloads/tasks (table renders with numeric timestamp date).

Known non-blocking:
- Firebase analytics SDK still initializes in demo mode (cosmetic warning only — auth is bypassed).
- `caniuse-lite` outdated warning in production build.
- CSS module order warnings from `mini-css-extract-plugin` in production build.

---

## 2026-05-22

### retail-pos-web — initial wiring

Client path: `C:\Users\user\Documents\Programming\Projects\Alerzo\veedez-web-app`

Backend module: `src/projects/retail-pos-web`

#### What the client uses

- **GraphQL via urql** — single endpoint `REACT_APP_API_BASE_URL` (was `http://api-dev.veedez.com:4000/graphql`). All queries/mutations go through `POST /graphql`.
- **REST via Axios** — `REACT_APP_API_REST_URL` for VAS (airtime, data, electricity, cable TV), passcode, and upload.
- **OAuth 2.0 flow** — sign-in opens `REACT_APP_OAUTHBASEURL` in browser, redirects back to `/auth?code=...&state=...`, callback fetches `GET REACT_APP_GETTOKENBASEURL/{code}` to get `{ token, isPasscodeSet }`, then calls Firebase `loginWithCustomToken(token)` to get a Firebase ID token.
- **Firebase v9 modular SDK** — `signInWithCustomToken`, `getIdToken`, `onAuthStateChanged`, `signOut`.
- **Media upload** — `uploadMedia()` in `libs.ts` calls `POST REACT_APP_MEDIA_URL?id=...&type=...`, expects array response `[{ url }]`.
- **Loan API** — `veedez_bank` module calls `REACT_APP_LOAN_API_BASE_URL_DEV` REST endpoints.
- **localStorage keys** — `vedeez-pwa-token`, `vedeez-pwa-userId`, `vedeez-pwa-user`, `vedeez-pwa-nonce`.

#### Backend implemented

Routes at `/retail-pos-web`:

```
POST /graphql                          — all urql GraphQL operations
GET  /graphql                          — info
GET  /oauth/token/:code                — returns { token (demo JWT), isPasscodeSet: true }
POST /oauth/refresh                    — returns fresh demo JWT
POST /upload/media                     — returns [{ url }]
POST /auth/passcode/verify             — returns { success: true }
POST /auth/passcode/set                — returns { success: true }
GET  /payapi/airtime/providers         — VAS airtime providers
POST /payapi/airtime/purchase          — buy airtime
GET  /payapi/data/bundles              — data bundle plans
POST /payapi/data/purchase             — buy data
GET  /payapi/electricity/discos        — electricity providers
GET  /payapi/electricity/resolve       — resolve meter number
POST /payapi/electricity/purchase      — buy electricity token
GET  /payapi/cable/providers           — cable TV providers
GET  /payapi/cable/packages            — cable TV packages
GET  /payapi/cable/resolve             — resolve smart card
POST /payapi/cable/purchase            — buy cable subscription
GET  /loan                             — get customer loans (veedez_bank)
POST /loan/apply                       — apply for loan
```

GraphQL fields covered: `getUserDetail`, `getBusinessDetail`, `getSaleStat`, `getExpenseStat`, `getBusinessInvoices`, `getBusinessCustomers`, `getSaleBreakdown`, `getHighestSpendingBusinessCustomers`, `getTopSellingProducts`, `getGainLossAndNetProfit`, `getCustomerProducts`, `getCustomerServices`, `getCustomerCategories`, `getProductDetail`, `getServiceDetails`, `getProductSummary`, `getServiceSummary`, `productHasInvoiceOrSales`, `getImportedFilesAndStats`, `getAlerzoProducts`, `getCustomerDetails`, `getCustomerSummary`, `customerHasSalesOrInvoice`, `getBusinessCustomersTotalDebt`, `getTotalBusinessCustomersCount`, `getBusinessSales`, `getSalesDetail`, `getSalesSummary`, `getBusinessExpenses`, `getExpensesBreakdown`, `getSalesReceiptPdf`, `getBusinessInvoiceDetail`, `getBusinessPayment`, `getInvoiceBreakdown`, `getInvoicePdf`, `getProducts`, `getBanks`, `getBusinessStaffs`, `getBusinessStaffDetail`, `getBusinessStaffSummary`, `getRoleAndUserAssociated`, `getBusinessPlans`, `getBusinessSectors`, `getStateAndCities`, `getKycDetails`, `getAccountDetail`, `getAppConfig`, `getCustomerTransaction`, `getPaymentBanks`, `getBusinessBeneficiaries`, `getUserNotification`, `getCustomerTerminals`, `getCustomerTerminal`, `getTerminalSpecs`, `getTerminalTransactions`, `getReferralSumary`, `getDownlinesListByPartnerId`, `getReferralDetail`, `getReferralSales`, `getSalesByProduct`, `getNewAndReturningBusinessCustomers`, `getProfitAndLoss`, `getInventoryReport`, `getInvoiceReport`, `getReportExpenseBreakdown`, `getStaffReport`, plus all mutations (`addBusiness`, `setTransactionPin`, `validateTransactionPin`, `changePasscode`, `validateBankInfo`, `initiateBankTransfer`, `generateUssdCode`, `setBvnTransactionPin`, `addBusinessBeneficiary`, `updateUserNotification`, `requestTerminal`, `updateCustomerTerminal`, `updateBusiness`, `upgradeBusinessPlan`, `updateUserPayment`, `submitIndemnityForm`, `completeBusinessLevelOne/Two/Three`, `importAlerzoProducts`, `importFileProduct`, `sendUserVerificationMail`, `verifyUserEmail`, `verifyBusinessEmail`, `purchaseCable`, `purchaseElectricity`, `buyData`).

#### Client patches

1. **`.env`** — all URLs redirected to `http://localhost:5050/retail-pos-web/...`; `REACT_APP_LOAN_API_BASE_URL_DEV` redirected to `http://localhost:5050/retail-pos-web/loan`.

2. **`src/utils/firebase.ts`** — added `isDemoBackend()` guard (checks `REACT_APP_GETTOKENBASEURL` for `localhost:5050`). In demo mode:
   - `loginWithCustomToken` returns the token directly (skips Firebase `signInWithCustomToken`).
   - `firebaseLogout` is a no-op.
   - `getCurrentUser` returns `null`.
   - `getRefreshToken` reads the stored token from `AppStorage` instead of calling Firebase.
   - `getUserStatus` resolves with the stored token immediately.

3. **`src/pages/auth-page/sign-in.tsx`** — in demo mode, clicking Login stores a nonce and navigates directly to `/auth?code=demo-code&state=...` instead of opening the OAuth URL. This triggers the callback hook with a valid code+state+nonce.

4. **`src/hooks/components/useOauthCallbackHook.ts`** — in `getToken()`, after `loginWithCustomToken` resolves, `firebaseUserId` is set to `"demo-firebase-uid"` in demo mode instead of calling `getCurrentUser()?.uid` (which returns `null` when Firebase is bypassed).

#### Verification

- `npm run type:check` — passed.
- `npm run build` — passed.
- `npm run lint` — zero errors, zero warnings.
- Backend smoke tests:
  - `GET /retail-pos-web` — info response.
  - `GET /retail-pos-web/oauth/token/demo-code` — returns `{ token: "eyJ...", isPasscodeSet: true }`.
  - `POST /retail-pos-web/graphql` for `getUserDetail` — returns full demo user with business.
  - `POST /retail-pos-web/graphql` for `getBusinessCustomers` — returns 3 demo customers.
  - `POST /retail-pos-web/upload/media` — returns `[{ url: "https://..." }]`.

#### Known non-blocking

- Firebase Analytics SDK still initializes (cosmetic warning — auth is bypassed).
- The `REACT_APP_OAUTHBASEURL` still points to the real OAuth server; it is never called in demo mode because the sign-in patch redirects before `window.open` is reached.

#### Next likely work

- Start the client (`yarn start` in `veedez-web-app`) and walk through each page.
- Fix any `RangeError: Invalid time value` or `TypeError: X.map is not a function` crashes by checking fixture field types against what the component destructures.
- The `veedez_bank` loan module uses `USE_DUMMY_CUSTOMER_ID` / `DUMMY_CUSTOMER_ID` constants — verify the loan page renders with the demo loan endpoint returning an empty loans list (which shows the `ApplyForLoan` component).
- Check the `checkIsAuthenticated` flow end-to-end: after the callback hook stores `token` and `userId`, it calls `executeQuery({ userId: "demo-firebase-uid" })` → `getUserDetail` → returns `demoUser` → `authenticateUser` is called → Redux `isAuthenticated` becomes `true` → redirect to `/business`.

#### Page crash fixes (Demo execution)

- **Auth Callback Hang**: Fixed a fatal bug in `isTokenExpired` (`veedez-web-app/src/utils/libs.ts`) where a 30-day dummy JWT caused `new Date(diff * 1000).getUTCHours() === 0`, tricking the local client into discarding valid tokens and halting the GraphQL URQL `fetchOptionsExchange` without throwing. Also fixed `OauthCallBackPage` to `navigate` natively instead of loading indefinitely upon failed entry.
- **Invoices Page**: Added `getInvoicesStat` handler and returned a populated array (`{ _id, value, count }`) to fix `invoiceSummaryData.reduce is not a function`.
- **POS Terminals**: Corrected backend `getKycDetails` reference to `getKycDetail` (singular) and matched the exact expected nested schema (`kycLevel`, `kyc.bvn.value`, `kyc.cac.value`) to fix a blank screen on the terminals root page component.
- **Expenses Report Page**: Added GraphQL dummy response for `getExpensesByCategory` with an Array value to resolve `.sort is not a function` chart exceptions.
- **Staff Report Page**: Added `getStaffSummaryCards` (incorporating full `staffActivities` mapping) and `getSalesByStaff` returning an unpaginated mapping, eliminating the `TypeError: Cannot convert undefined or null to object` fatal crash from unresolvable fallback schema formats.
- **Passcode Verification**: Fixed the REST API endpoints (`POST /auth/passcode/verify` and `/auth/passcode/set`) to return `isPasscodeSet: true` directly in the response payload, matching the specific frontend object destructing criteria (`request?.data?.isPasscodeSet`).
