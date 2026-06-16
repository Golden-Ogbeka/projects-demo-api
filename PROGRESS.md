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

---

## 2026-05-22 (Vendor Management Web)

### Vendor Management Web — dummy backend creation

Client path: `C:\Users\user\Documents\Programming\Projects\Alerzo\vmi-admin-web`

Backend module: `src/projects/vendor-management-web`

#### Backend implemented

Routes at `/vendor-management-web`:

```
GET  /                              — info
POST /graphql                       — handles GraphQL operations using saas-platform-admin-web logic
GET  /graphql                       — info
POST /upload/media                  — upload dummy endpoint
```

Extensive dummy data and fixtures were provided, covering similar domain entities as the SaaS platform backend.

#### Client patches

1. **`.env`** — URLs redirected to `http://localhost:5050/vendor-management-web`
2. **`src/services/auth.js`** — patched `isDemoBackend` for `vendor-management-web`.
3. **`src/graphql/index.js`** — patched `isDemoBackend` check.

#### Verification

- `npm run type:check` — passed.
- `npm run build` — passed.
- `npm run lint` — warnings resolved.
- Endpoints registered successfully.

---

## 2026-05-22 (Inventory Admin Web)

### Inventory Admin Web — dummy backend creation

Client path: `C:\Users\user\Documents\Programming\Projects\Alerzo\veedez-admin-web`

Backend module: `src/projects/inventory-admin-web`

#### Backend implemented

Routes at `/inventory-admin-web`:

```
GET  /                              — info
POST /graphql                       — handles GraphQL operations
GET  /graphql                       — info
POST /upload/media                  — upload dummy endpoint
```

Extensive dummy data and fixtures were provided. Handled `verifyOTP` mutation internally to return deterministic fake tokens (`demo-firebase-custom-token`) instead of integrating real Firebase.

#### Client patches

1. **`.env`** — URLs redirected to `http://localhost:5050/inventory-admin-web`
2. **`src/services/auth.js`** — patched `isDemoBackend` checks to bypass Firebase's `signInWithCustomToken` and `generateIdToken`.

#### Verification

- `npm run type:check` — passed.
- `npm run build` — passed.
- `npm run lint` — warnings resolved.
- Endpoints registered successfully.

---

## 2026-05-22 (Zeebly Admin Substitution)

### Zeebly Admin (cap-admin) — dummy backend substitution

Client path: `C:\Users\user\Documents\Programming\Projects\Alerzo\zeebly-admin`

Backend module: `src/projects/cap-admin-web`

Substituted the initial `vmi-admin-web` experiment by removing `vendor-management-web` and creating `cap-admin-web` specifically for the `zeebly-admin` dashboard project.

#### Backend implemented

Routes at `/cap-admin-web`:
- `POST /graphql` — GraphQL endpoint that correctly resolves `authenticateAdminUser` mutation and injects `x-token` into HTTP response headers to mock local token storage for Apollo Client.

#### Client patches

1. **`.env`** — URLs redirected to `http://localhost:5050/cap-admin-web`.
2. Fully validated that `useAuthStore` receives the proxy tokens automatically.

#### Global Health Check
Verified build stability across multiple major legacy and current portfolio apps:
- `zeebly-admin` (`npm run build` passed)
- `veedez-admin-web` (`npm run build` passed)
- `veedez-web-app` (`npm run build` passed)
- `alerzo-admin-web` (`npm run build` passed)

---

## 2026-06-02

### Castle Stash (mono-web) — backend endpoint fixes

Client path: `C:\Users\user\Documents\Programming\Projects\Composite\mono-web`

Backend module: `src/projects/mono-web` (base path `/mono-web/techmillresource/mono-api/api`)

#### What was already implemented

The `mono-web` module already had a complete scaffold with database setup, seed data, controllers, and routes covering all 25 POST endpoints. A demo user (`demo@castlestash.com` / `Password1`), demo transactions, 3 properties, and a saved bank account were seeded.

#### Issues fixed

| # | Endpoint | Issue | Fix |
|---|---|---|---|
| 1 | `/forgotPassword` | Controller read `req.body.email` but frontend sends `loginName` | Changed destructure to `{ loginName }` |
| 2 | `/resetPassword` | Controller read `{ token, newPassword }` but frontend sends `{ resetToken, password }` | Changed destructure to `{ resetToken, password }` |
| 3 | `/twoFactorAuth` | Controller read `{ action }` ("enable"/"disable") but frontend sends `{ status }` ("R"/"D") | Changed to use `{ status }` directly |
| 4 | `/updateUser` | Controller read `req.body` fields but frontend sends `FormData` with file attachment | Added `multer` middleware; reads fields from parsed multipart body |
| 5 | `/getPaymentChannel` | Missing `CHANNEL_FEE` and `CHANNEL_URL` fields used by `PaymentConfirmation.js` | Added both fields to returned payment channel data |
| 6 | `/createUserBank` | Controller read `bankCode` but frontend sends `bankId` | Changed destructure to alias `bankId` as `bankCode` |
| 7 | `/createTransaction` | Controller read `amount` but frontend sends `transactionAmount` | Added fallback: reads `transactionAmount ?? amount` |
| 8 | `/updateTransaction` | Controller read `transactionRef` but frontend sends `transactionReference` | Changed destructure to alias `transactionReference` as `transactionRef` |

#### Fixes applied later

- Fixed `IMAGE_NAME` values in `/getPaymentChannel` from `card.png`/`bank.png` to `cuePay.png`/`paystack.png` to match actual frontend assets in `src/assets/payment-platforms/`.

- Expanded seed data in `src/projects/mono-web/database/index.ts`:
  - **3 users**: `demo@castlestash.com` (verified, no 2FA), `jane@castlestash.com` (verified, 2FA enabled), `unverified@castlestash.com` (not verified)
  - **23 transactions** across verified users (wallet funding, investments, ROI payouts, cash outs)
  - **5 properties** with detailed descriptions and real Unsplash images
  - **7 user investments** linking users to properties
  - **2 saved bank accounts** (GTBank for Demo, Access Bank for Jane)
  - Demo wallet balance: **₦907,500** (calculated from 12 transactions)
  - Jane wallet balance: **₦1,020,000** (calculated from 11 transactions)

#### Seed data verification (all endpoints passing)

| Endpoint | Demo User | Jane User |
|---|---|---|
| `POST /authentication` | ✅ Login OK | ✅ Login OK (2FA required) |
| `POST /getUser` | ✅ "Demo User" | ✅ "Jane Smith" |
| `POST /getBalance` | ✅ ₦907,500 | ✅ ₦1,020,000 |
| `POST /getTransaction` | ✅ 12 transactions | ✅ 11 transactions |
| `POST /getInvestmentTransaction` | ✅ 3 investments | ✅ 4 investments |
| `POST /getUserBank` | ✅ GTBank - 0123456789 | ✅ Access Bank - 0987654321 |
| `POST /getProperty` | ✅ 5 properties | ✅ 5 properties |

#### Credentials

| User | Email | Password | 2FA |
|---|---|---|---|
| Demo | `demo@castlestash.com` | `Password1` | Disabled (logs in directly) |
| Jane | `jane@castlestash.com` | `Password2` | Required (OTP-based) |
| Unverified | `unverified@castlestash.com` | `Password1` | — (for testing registration flow) |

#### Next likely work

- Start the Castle Stash client (`npm start` in `mono-web`) and walk through the full user flow: login → dashboard → fund wallet → invest in a property → view transaction history → cash out.
- For Jane, test the 2FA flow: login → redirected to `/TwoFA-check/CS0000000000002` → enter OTP (returned by `/twoFactorAuth`) → dashboard.
- The payment gateway selection + confirmation flow POSTs to the demo `CHANNEL_URL` (CuePay/Paystack) — the frontend will submit there but no actual processing occurs; the transaction flow continues on `/account/fund/:transactionID` which calls `/updateTransaction` and shows success/failure.

---

## 2026-06-03

### cap-admin-web (Zeebly Admin) — Full Dummy Backend

Client path: `C:\Users\user\Documents\Programming\Projects\Alerzo\zeebly-admin`

Previously, `cap-admin-web` had only a skeleton GraphQL endpoint. The zeebly-admin client (React 18 + Apollo Client + Socket.IO) uses a completely different set of GraphQL operations. This update adds:

#### Added GraphQL operations for zeebly-admin client

| Category | Operations |
|---|---|
| **Auth** | `changeAdminPassword`, `requestAdminPasswordReset`, `validateAdminPasswordResetRequest`, `resetAdminPassword`, `refreshUserToken` |
| **Dashboard** | `recent_transaction`, `top_centres`, `top_selling_products`, `top_selling_categories`, `transaction_volume`, `transaction_status`, `transaction_volume_per_centre`, `revenue_trend`, `getTotalRepsPartner`, `transaction_status_per_center`, `getDiscountStat`, `getReturnedOrderStat`, `getOrderSaleTargetForAllCenters` |
| **Inventory** | `getInventory`, `getInventoryById`, `getAdminCatalogueEntity`, `getSapCatelogueDetails`, `getCatelogueDetails` |
| **Orders** | `getAllOrders`, `getOrderById`, `getOrderStat`, `getOrderInvoice` |
| **Centres** | `getCentres`, `centre`, `getCentreActiveReps`, `getCentreRepLists`, `getBusinessName`, `getCentreCustomerGroup`, `getCentreTarget` |
| **Partners** | `getPartners`, `getPartner` |
| **Reps** | `getRepresentatives`, `representative`, `getRepRoles` |
| **Settings** | `getAdminUser`, `getAdminUsers`, `getRoles`, `getAllPermissions` |
| **Notifications** | `getAdminNotification` |
| **Audit Trail** | `getAdminAuditLogs`, `getPartnerAuditLogs`, `getRepAuditLogs`, `getAdminAuditLog`, `getPartnerAuditLog`, `getRepAuditLog` |
| **Zeebly Mutations** | `createCentre`, `updateCentre`, `removeCentre`, `createPartner`, `updatePartner`, `deactivatePartner`, `activatePartner`, `createRepresentativeByAdmin`, `adminUpdateRepresentative`, `deactivateRepresentative`, `activateRepresentative`, `removeRepresentative`, `createCatalogue`, `updateCatalogue`, `deleteCatalogue`, `toggleOutOfStock`, `toggleLocked`, `deleteOrder`, `toggleLockedOrder`, `createAdminUser`, `updateAdminUser`, `activateAdminUser`, `deactivateAdminUser`, `updateRole`, `createRole`, `createPermission`, `readNotification` |

#### Added REST API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/upload/upload_products/:productId` | Product image upload |
| POST | `/api/upload/upload-rebate-discount` | Rebate discount CSV |
| POST | `/api/upload/upload-target` | Target CSV |
| POST | `/api/upload/upload_admin_image/:id` | Admin profile image |
| GET | `/api/upload/download_audit_trail` | Audit trail CSV download |
| POST | `/api/auth/refresh-token` | Token refresh (Apollo RetryLink) |

#### Added Socket.IO

- Namespace `/cap-admin-web` handles `admin-notify-all` events with acknowledgment callback.
- The server emits `new-notification` to broadcast delivered notifications.

#### Seeded fixture data

- 3 admin users, 3 roles, 6 permissions, 3 centers, 2 partners, 3 reps, 3 rep roles, 3 seeded orders, 3 inventory items, 5 inventory categories, 5 recent transactions, 10 notifications, audit trail entries.

#### Demo credentials

- Email: `admin@zeebly.com` / any password.
- `x-token` and `x-refresh-token` response headers set on every GraphQL response.
- Token refresh via `POST /api/auth/refresh-token` returns new token headers.

#### Verification

- `npm run type:check` — passed.
- All GraphQL queries and mutations tested and returning correct shapes.
- REST upload and refresh-token endpoints tested and returning expected responses.
- Socket.IO namespace registered and ready for client connections.

#### Next likely work

- Start the zeebly-admin client (`npm start` in `zeebly-admin`) and verify full flow: sign-in → dashboard → centers → partners → reps → orders → inventory → notifications (via Socket.IO modal) → audit trail → settings.
- The client's `REACT_APP_REST_API` is already set to `http://localhost:5050/cap-admin-web/api` — all REST endpoints are ready.

### bible-quiz-platform (A1Quest) — Full REST Dummy Backend

Clients:
- `a1quest-web` (Next.js 13) at `C:\Users\user\Documents\Programming\Projects\A1Quest\a1quest-web`
- `a1quest-admin-web` (CRA) at `C:\Users\user\Documents\Programming\Projects\A1Quest\a1quest-admin-web`

Both share the same API base URL: `https://api.a1quest.com/api/v1`.

Backend module: `src/projects/bible-quiz-platform` (base path `/bible-quiz-platform/api/v1`)

#### Database

- 24 SQLite tables with `DROP TABLE IF EXISTS` + `CREATE TABLE IF NOT EXISTS`
- Bible-themed seed data: 6 users, 3 admins, 3 roles, 13 permissions, 6 classes, 12 topics, 18 sub-topics, 19 lessons, 20 questions, 3 subscription plans, 8 transactions, 8 notifications, 8 achievements, 8 FAQs, 3 feedback entries, 6 leaderboard entries, 7 streaks, 6 enrollments, 3 bookmarks, 3 broadcasts

#### Rewrite — 2026-06-04

Rewrote all controllers and routes to match actual a1quest-web (Next.js) and a1quest-admin-web (CRA) client implementations. The previous implementation had a clean generic scaffold that didn't match the real route paths and response shapes either app expects.

**Changes:**

1. **Auth controller** — Rewrote user auth to match a1quest-web patterns:
   - `POST /auth/register` — creates user, returns `{ verificationCode }`
   - `POST /auth/verify-code` / `POST /auth/verify-otp` — accepts `code` or `otp`
   - `POST /auth/login` — returns `{ success, message, data: { user, token } }` where token is `demo-token-{id}`
   - `POST /auth/forgot-password`, `POST /auth/reset-password` — includes reset code in response for demo
   - Admin login returns `{ success, message, data: { admin, token } }`

2. **Learning controller** — Rewrote all 25 `/learning/*` endpoints to match a1quest-web:
   - All list routes use `POST` (a1quest-web sends POST for everything)
   - Individual item routes support both `GET /:id` and `POST /` (body-based id)
   - Quiz system: `POST /learning/take-test` — selects random questions, returns stripped options (no correct answers)
   - `POST /learning/submit-test/:testId` — grades answers against stored correct options, stores review, updates leaderboard (10 pts/correct)
   - Progress, bookmarks, enrollments, streaks all wired

3. **Payment controller** — 4 endpoints for plans, transactions, initiate, verify

4. **Reports controller** — `POST /report-analytics`, `GET /user-performance`

5. **Admin CRUD controller** — Full REST CRUD for all entity types:
   - `GET/POST + GET/PUT/DELETE :id` for classes, topics, sub-topics, lessons, questions, roles, achievements, FAQs, plans, broadcasts, notifications
   - Users: `GET + GET/DELETE :id`
   - Transactions: `GET + DELETE :id`
   - Feedback: `GET /pending-feedbacks + GET/DELETE :id`
   - Leaderboard: `GET + DELETE /reset`
   - Dashboard: aggregate stats

6. **Misc controller** — 17 endpoints for FAQs, achievements, leaderboard, notifications, contact, settings, upload, streaks, password/profile CRUD

7. **Routes** — Complete rewrite to match the actual 120+ route paths used by both clients

8. **Multer** — Added `multer.memoryStorage()` middleware for upload endpoints

#### Verified endpoints (2026-06-04)

| Endpoint | Status |
|---|---|
| `GET /` | ✅ Health check |
| `POST /auth/login` | ✅ Returns `{ success, message, data: { user, token } }` |
| `POST /admin/login` | ✅ Returns admin token |
| `POST /learning/classes` | ✅ Returns 6 classes |
| `POST /learning/popular-topics` | ✅ Returns 4 random topics |
| `GET /faqs` | ✅ Returns 8 FAQs |
| `GET /achievements` | ✅ Returns 8 achievements |
| `GET /leaderboard` | ✅ Returns 6 leaderboard entries |
| `GET / (no error)` | ✅ Type check passes with zero errors |

#### Client `.env` changes — both apps now point to local demo API

- **`a1quest-web`**: Updated `.env` → `NEXT_PUBLIC_API_URL=http://localhost:5050/bible-quiz-platform/api/v1`
- **`a1quest-admin-web`**: Fixed `.env` → Changed `VITE_` prefix to `REACT_APP_` prefix (CRA requirement), set `REACT_APP_API_URL=http://localhost:5050/bible-quiz-platform/api/v1`

#### Routes aligned to actual client usage

Rewrote `routes/index.ts` and multiple controllers to match the exact paths and shapes used by both apps, instead of a generic scaffold.

**Key user-auth endpoints added/aligned:**
- `POST /auth/login` → returns token string at `response.data.data` (fix: was returning `{ user, token }` object)
- `GET /auth/profile`, `POST /auth/profile` — profile read/update
- `POST /auth/guardian`, `POST /auth/goal` — guardian info and learning goal
- `GET /auth/classes` → returns string array of class names
- `GET /auth/countries`, `POST /auth/states` — location data
- `POST /auth/verify-code` now accepts `{ verificationCode }` field name

**Learning route aliases added (all map to existing handlers):**
- `/learning/view-classes`, `/learning/view-topics`, `/learning/view-sub-topics`, `/learning/view-lessons` (POST)
- `/learning/tests/:testId/answers` (for submit), `/learning/tests/:testId/review` (for review)
- `/learning/track-progress-rate`, `/learning/recent-learning` (POST), `/learning/:topicId/enroll`
- All original paths also kept for backward compatibility

**Payment endpoints added:**
- `GET /payment/fetch-subscription-plans`, `POST /payment/choose-subscription-plan`
- `POST /payment/transaction`, `GET /payment/wallet-balance`, `GET /payment/transaction-history`
- `POST /payment/transfer`, `GET /payment/fetch-banks`, `POST /payment/verify-bank-account`

**Admin-web specific endpoints added:**
- Auth: `POST /admin/verify-code`, `POST /admin/resend-code`
- Dashboard: `GET /admin-dashboard/count`, `/admin-dashboard/recent-users`, `/admin-dashboard/admin-stats`, `/admin-dashboard/classes-stats`
- CRUD without `/admin/` prefix: all under `/classes`, `/topics`, `/sub-topics`, `/lessons`, `/questions` with `PATCH` instead of `PUT`
- Admin management: `POST /admin-mgmt/get`, `GET/POST/PATCH/DELETE /admin-mgmt/:id`, `PATCH /roles/assign-to-admin`
- Users: `POST /users`, `GET /users/:id`, `GET /users/:id/performance`, `/users/:id/topics`, `/users/:id/test-logs`, `PATCH /users/:id/unfreeze-user`
- Feedback: `GET /admin-contact-us`
- Broadcasts: `POST /notification-broadcast/get`, `GET /notification-broadcast/:id`, `POST /notification-broadcast`
- Admin profile: `PATCH /update-self`, `PATCH /auth/update-password`, `POST /auth/verify`, `PATCH /profile-image`
- Permissions: `GET /roles/permissions`
- Existing `/admin/*` legacy routes preserved for backward compatibility

#### Fixed database table name mismatch

- Payment controller and admin-crud controller referenced `bq_plans` — actual table is `bq_subscription_plans`
- `POST /questions` creates now JSON.stringifies `options` array for SQLite storage

#### TypeScript type declaration

- Added `src/types/express.d.ts` extending Express `Request` with `userId` and `adminId` properties

#### Verified

| Endpoint | Status |
|---|---|
| `POST /auth/login` | ✅ Returns token string in `data` |
| `GET /auth/profile` | ✅ Returns full `UserType` |
| `POST /auth/guardian` | ✅ Updates + returns user |
| `POST /auth/goal` | ✅ Updates + returns user |
| `GET /auth/classes` | ✅ Returns `["JS1","JS2",...]` |
| `GET /auth/countries` | ✅ Returns country data |
| `POST /learning/view-classes` | ✅ Returns 6 classes |
| `GET /learning/view-topic/:id` | ✅ Returns mapped topic |
| `GET /payment/fetch-subscription-plans` | ✅ Returns plans |
| `GET /leaderboards` | ✅ Returns 6 entries |
| `POST /admin/login` | ✅ Returns token string |
| `GET /admin/profile` | ✅ Returns admin object |
| `GET /admin-dashboard/count` | ✅ Returns aggregate stats |
| `GET /classes` | ✅ Returns all classes (desc) |
| `POST /topics/view-topics` | ✅ Returns 13 topics |
| `POST /questions` with options | ✅ Options JSON.stringified |
| `POST /admin-mgmt/get` | ✅ Returns 3 admins |
| `GET /roles/permissions` | ✅ Returns 13 permissions |
| `npm run type:check` | ✅ Zero errors |

#### Next likely work

1. Start `a1quest-web` (Next.js: `npm run dev`) and walk through: login → dashboard → classes → topics → quizzes → leaderboard → payment flow.
2. Start `a1quest-admin-web` (CRA: `npm start`) and walk through: admin login → dashboard → CRUD screens for all entities → user management → roles/permissions.
3. Fix any component-level response shape mismatches discovered during client integration (most likely in nested field names or optional fields).

---

## 2026-06-04 (artisan-services-web)

### artisan-services-web — Full REST Dummy Backend

Client: `C:\Users\user\Documents\Programming\Projects\Keyla\Artisan Services-Frontend` (Next.js)

Backend module: `src/projects/artisan-services-web` (base path `/artisan-services-web`)

#### Rewrite — routes and controllers to match frontend API paths and response shapes

Previously the module had a generic scaffold. This rewrite aligns all 44 endpoints with the frontend's actual axios calls and expected TypeScript types.

**Changes:**

1. **Routes** (`routes/index.ts`) — 44 REST endpoints under `/api/v1/` matching the frontend's axios paths:
   - Auth: `POST /api/v1/register`, `/login`, `/code/get`, `/code/verify`, `/forgot-password`, `/reset-password`, `/logout`, `GET /api/v1/deactivate`
   - Profile: `PATCH /api/v1/update`, `/update-password`, `/profile-image`
   - Artisans: `POST /api/v1/all/artisan`, `GET /api/v1/single/artisan/:id`, `PATCH /api/v1/artisan`, `POST /artisan/photo`, `/artisan/nin`, `/artisan/personal`, `/artisan/business`, `PATCH /artisan/business-hours`, `/artisan/socials`, `GET /single/business-hours/:id`
   - Portfolio: `POST /api/v1/all/portfolio`, `/artisan/portfolio`, `DELETE /artisan/portfolio/:id`
   - Booking: `POST /api/v1/user/booking`, `/all/booking`, `GET /single/booking/:id`, `PATCH /user/booking/:id`
   - Favourite: `POST /api/v1/all/favourite`, `/analytics/favourite`
   - Rating: `POST /api/v1/all/rating`, `/analytics/rating`
   - Dispute: `POST /api/v1/all/dispute`, `/dispute`, `/all/dispute-response`, `/dispute-response`
   - Chat: `POST /api/v1/all/chat`, `/chat`, `GET /chat/highlights`
   - Notification: `POST /api/v1/all/notification`, `PATCH /notification/update/:id`
   - Public: `GET /api/v1/no-auth/all/artisan-category`, `POST /api/v1/no-auth/feedback`
   - Analytics: `POST /api/v1/analytics/views`

2. **Controllers** (`controllers/index.ts`) — All 44 handlers with:
   - In-memory fixture data (36 artisans, 20 bookings, portfolios, 5 disputes, 30 ratings, 5 favourites, chat messages, business hours, business hours, 10 categories)
   - SQLite-backed auth (users, notifications)
   - MongoDB-style `_id` string IDs throughout (e.g., `"artisan-1"`, `"booking-3"`)
   - Related entities returned as nested objects (e.g., `artisan: { _id, companyName, firstname, ... }` inside bookings)
   - Paginated list responses wrapped in `{ results: [...] }` for frontend pagination
   - Demo login accepts `demo@artisanservices.com` / `password`, returns `demo-artisan-services-web-token-{id}`

3. **Database** — Already seeded demo user, addresses, and notifications in `database/index.ts`

#### TypeScript errors fixed

- 14 errors: wrapped arrays in `{ results: [...] }` for all list endpoints to match `sendSuccessFeedback`'s `Record<string, unknown>` signature
- Fixed invalid SQL in `DeactivateAccount` handler
- Added `as string` casts for `req.params.id` to fix Express 5 param type inference

#### Verified endpoints

| Endpoint | Status |
|---|---|
| `POST /api/v1/login` | ✅ Returns demo user with token |
| `GET /api/v1/no-auth/all/artisan-category` | ✅ 10 categories with services |
| `POST /api/v1/all/artisan` | ✅ 36 artisans paginated (12/page) |
| `GET /api/v1/single/artisan/artisan-1` | ✅ Returns artisan with nested category |
| `GET /api/v1/single/business-hours/artisan-1` | ✅ Returns weekly schedule |
| `POST /api/v1/all/booking` | ✅ 20 bookings with nested user/artisan |
| `POST /api/v1/all/portfolio` | ✅ Filtered by artisan |
| `GET /api/v1/chat/highlights` | ✅ 5 chat highlights with last messages |
| `POST /api/v1/all/notification` | ✅ 1 notification (seeded) |
| `POST /api/v1/all/dispute` | ✅ 5 disputes with nested booking/artisan |
| `POST /api/v1/all/rating` | ✅ 30 ratings with nested userId |
| `npm run type:check` | ✅ Zero errors (pre-existing errors in other modules only) |

#### Demo credentials

- Email: `demo@artisanservices.com` / `password`
- Token format: `demo-artisan-services-web-token-1` (sent as `Authorization: Bearer ...`)

#### Client `.env` (already configured)

- `NEXT_PUBLIC_API_URL=http://localhost:5050/artisan-services-web/api/v1`
- `NEXT_PUBLIC_ADMIN_API_URL=http://localhost:5050/artisan-services-web`

#### Next likely work

1. Start the artisan-services-web client (`npm run dev`) and walk through: login → browse artisans → view artisan profile → create booking → view bookings → manage chat → notifications → profile settings.
2. Verify the artisan mode login (`role: "artisan"`) returns the correct additional fields.
3. Test Socket.IO namespaces `/chat` and `/dispute` — these need server-level Socket.IO setup outside the REST router.

---

## 2026-06-04 — Collective Demo Preparation for 8 Keyla Projects

### Goal

Complete demo mode for all 8 Keyla projects by cross-referencing each frontend's actual API calls against the backend routes and fixing all mismatches. All modules were already anonymized (brand names → descriptive names: `cravings-*`→`food-delivery-*`, `koneqtor-*`→`artisan-services-*`, `landshop-admin`→`real-estate-admin`, `ship-africa-*`→`logistics-*`, `shipplug-client`→`logistics-client`).

### What was done

1. **Cross-reference analysis** — For each of the 8 modules, grepped the frontend source code for all API URLs and compared them against the backend route files. Documented every gap.

2. **Gap fixes applied**:
   - `food-delivery-admin`: Entire route file rewritten (~100 endpoints) from POST-heavy `save/update/status` convention to frontend's flat POST/PATCH/GET/DELETE patterns. Frontend uses `GET /stat`, `GET /me`, `GET /single/{resource}/:id`, `PATCH /activestatus/{resource}`, `PATCH /update-self`, etc.
   - `artisan-services-admin`: 2 missing endpoints added (`POST /all/active`, `POST /all/visit`).
   - `logistics-web`: Login no longer returns `success: true` for invalid credentials — now returns 401 `{ success: false, message: "Invalid email or password" }`.
   - Remaining 6 modules (food-delivery-web, artisan-services-web, real-estate-admin, logistics-admin, logistics-client) — verified well-aligned.

3. **Verification**:
   - `npm run type:check` — zero errors
   - `npm run build` — passes
   - All 8 login endpoints tested and return seeded demo data
   - All gap-fix endpoints tested (food-admin GET /stat ✅, GET /me ✅, artisan-admin POST /all/active ✅, POST /all/visit ✅, logistics-web wrong login 401 ✅)

### Route count updates in AGENTS.md

- food-delivery-admin: 58 → ~100
- food-delivery-web: 43 → 74
- artisan-services-admin: 49 → 54
- artisan-services-web: 44 → 47
- real-estate-admin: 40 → 47
- logistics-client: 28 → 20

### Remaining cosmetic items

- `food-delivery-admin` route file fixture arrays still reference `@cravings.com` emails (unused by auth, display-only)
- All 8 frontend `.env`/config files already updated to anonymized URLs

---

## 2026-06-04

### food-delivery-admin — SQLite migration (in-memory → database)

The food-delivery-admin module previously stored all data in in-memory fixture arrays inside the controller and route files. This made the module state non-persistent and the controller file extremely large.

**Changes:**

1. **`database/index.ts`** — Added `CREATE TABLE IF NOT EXISTS` for all 22 domain tables, seeded with the exact same fixture data as the old in-memory arrays:
   - `food_delivery_admin_users` (5 users), `zones` (5), `restaurants` (6), `vendors` (4), `products` (10), `orders` (6 with JSON items), `banners` (3), `promos` (3), `coupons` (3), `food_types` (6), `delivery_fees` (5), `settings` (single-row JSON), `wallet_transactions` (6), `riders` (6), `notifications` (3), categories, top_vendors, payout_history, customer_orders, subscription, review, complaint.
   - Demo credentials: `demo@fooddelivery.com` / `password`.

2. **`controllers/index.ts`** — Rewrote all CRUD handlers to use `sqlite.prepare(…)` with `better-sqlite3`. Removed all in-memory arrays (kept only `IMAGES` constant). All handler export names and signatures preserved. Settings stored as JSON blob, converted to key-value array on read. Order items stored as JSON TEXT, parsed on read.

3. **`src/functions/feedback.ts`** — Changed `sendSuccessFeedback` and `sendErrorFeedback` `data` parameter type from `Record<string, unknown>` to `unknown` with internal cast. This allows passing `.get()` results (typed as `unknown` by `better-sqlite3`) directly without explicit casts at every call site. Fully backward compatible.

**Verified:**

| Endpoint | Result |
|---|---|
| `POST /admin/v1/login` | ✅ Returns demo user + token |
| `GET /admin/v1/stat` | ✅ Dashboard stats |
| `POST /admin/v1/all/user` | ✅ 5 users |
| `POST /admin/v1/all/zone` | ✅ 5 zones |
| `POST /admin/v1/all/restaurant` | ✅ 6 restaurants |
| `POST /admin/v1/all/order` | ✅ 6 orders with parsed items |
| `POST /admin/v1/all/product` | ✅ 10 products |
| `POST /admin/v1/save/zone` | ✅ Creates new zone |
| `POST /admin/v1/status/zone/:id` | ✅ Updates zone status |
| `POST /admin/v1/single/order/1` | ✅ Returns order with items array |
| `POST /admin/v1/all/setting` | ✅ 14 settings (from JSON blob) |
| `POST /admin/v1/delete/zone` | ✅ Deletes zone |
| `npx tsc --noEmit` | ✅ Zero errors |

### real-estate-admin — SQLite migration (in-memory → database)

**Changes:**
1. **`database/index.ts`** — Added 11 domain tables (`real_estate_admin_users`, `_properties`, `_developments`, `_investments`, `_transactions`, `_blog_posts`, `_grows`, `_contacts`, `_invoices`, `_reviews`, `_settings`) seeded with all 66 fixture records. Settings stored as single-row JSON blob.
2. **`controllers/index.ts`** — Removed all 12 in-memory fixture arrays. All 35 handler names/signatures preserved, response shapes identical.

### logistics-admin — SQLite migration (in-memory → database)

**Changes:**
1. **`database/index.ts`** — Added 12 domain tables (users, parcels, shipments, transactions, contacts, disputes, notifications, team members, shipping pricing, Lagos costs, intra/inter/intl costs). All fixture data from `fixtures.ts` (405 lines) seeded. Shipments stored as JSON blobs for complex nested shapes.
2. **`controllers/graphql.ts`** — Rewrote all `resolveField` handlers to query SQLite. Removed `./fixtures.js` import.
3. **`controllers/rest-api.ts`** — Rewrote Login handler to query `logistics_admin_users` table. Inlined dashboard stats.
4. **`controllers/fixtures.ts`** — Deleted (all data migrated to DB seed).

### logistics-web — SQLite migration (in-memory → database)

**Changes:**
1. **`database/index.ts`** — Added 11 domain tables (users, parcels, shipments, transactions, notifications, countries, cities, pricing, wallet, business accounts) seeded with all fixture data from `fixtures.ts` (327 lines).
2. **`controllers/graphql.ts`** — Rewrote all `resolveField` handlers to query SQLite. Removed `./fixtures.js` import.
3. **`controllers/rest-api.ts`** — Login queries `logistics_web_users` table. `googlePlaceDetailsFixture` inlined.
4. **`controllers/fixtures.ts`** — Deleted.

### logistics-client — SQLite migration (in-memory arrays → database)

**Changes:**
1. **`database/index.ts`** — Added `logistics_client_parcels` table, added `data` JSON column to `logistics_client_shipping`. Seeded 3 demo parcels and 3 demo shipments.
2. **`controllers/index.ts`** — Replaced all in-memory mutable arrays (`packagingData`, `parcelData`, `shipmentData`, `addressData`) with `sqlite.prepare(...)` queries against existing/logistics_client_*` tables. Removed counter variables for auto-increment. Countries/states/cities kept as in-memory constants (reference data, no DB table).

### AGENTS.md update

Added explicit rule to the **Database Rules** section:

> **ALL data must be stored in SQLite tables.** No in-memory fixture arrays in controllers. Controllers must read/write all domain data through `sqlite.prepare(...)` queries. Static reference data (image URLs, country/state/city lists) that is not user-generated may remain as in-memory constants if it has no corresponding DB table. Exception: very simple GraphQL mutation responses that return `{ success: true }` without domain data do not need a DB round-trip.

### Final verification

- `npm run type:check` — zero errors
- `npm run build` — passes
- All 8 modules migrate cleanly — no in-memory fixture arrays remain in any controller

---

## 2026-06-04

### event-marketplace-web — GraphQL dummy backend for event marketplace mobile app

Client path: `C:\Users\user\Documents\Programming\Projects\Punch\ocpus-client`

Backend module: `src/projects/event-marketplace-web` (base path `/event-marketplace-web`)

**Note:** Renamed from `ocpus-web` to `event-marketplace-web` for anonymity in public routes, tables, and docs.

#### What was created

- **GraphQL endpoint**: `POST /event-marketplace-web/graphql` — handles ~43 operations (auth, user listings, brands, events CRUD, chat, follow, media, notifications, Stripe payment).
- Session/cookie-based auth (`credentials: 'include'`).
- MongoDB-style `_id` string IDs throughout.
- Response shape: `{ statusCode, success, message, data }` with paginated `{ total, data: [...] }`.

#### Database tables

- `event_marketplace_users` (3 seeded: seller, host, consumer)
- `event_marketplace_events` (1 demo fashion event)
- `event_marketplace_messages`, `event_marketplace_conversations` (1 conversation with 1 message)
- `event_marketplace_notifications` (1 welcome notification)
- `event_marketplace_media` (2 seeded media items)
- `event_marketplace_stripe_cards`, `event_marketplace_stripe_banks`, `event_marketplace_stripe_customers` (1 each)
- `event_marketplace_graphql_events` (operation logging)

#### Demo credentials

- Email: `demo@example.com` / `password`

#### Client `.env` patch needed

- Change Apollo Client URI from `http://localhost:3030/graphql` to `http://localhost:5050/event-marketplace-web/graphql`

#### Verified

- `npm run type:check` — zero errors
- Endpoints registered and returning demo data

### freelancer-marketplace-web — GraphQL dummy backend for freelancer marketplace web app

Client path: `C:\Users\user\Documents\Programming\Projects\Punch\zwilt-client`

Backend module: `src/projects/freelancer-marketplace-web` (base path `/freelancer-marketplace-web`)

**Note:** Renamed from `zwilt-web` to `freelancer-marketplace-web` for anonymity in public routes, tables, and docs.

#### What was created

- **GraphQL endpoint**: `POST /freelancer-marketplace-web/graphql` — handles ~60+ operations (auth, homepage, master categories, categories, profile/listings, search, browse, saved lists, chat, notifications, follow, rating).
- **Social auth redirect endpoints**: `GET /google`, `/facebook`, `/linkedin` — return demo auth codes.
- Session/cookie-based auth (`credentials: 'include'`).
- MongoDB-style `_id` string IDs throughout.
- Response shape: `{ statusCode, success, message, data }`.

#### Database tables

- `freelancer_marketplace_users` (3 seeded freelancers with skills, offerings, experience)
- `freelancer_marketplace_master_categories` (4: Technology, Design, Writing, Marketing)
- `freelancer_marketplace_categories` (5: Web Dev, Mobile, Graphic Design, Content, Digital Marketing)
- `freelancer_marketplace_tags` (10 tags for skills)
- `freelancer_marketplace_listings` (3 seeded freelancer listings with related work and experience)
- `freelancer_marketplace_conversations`, `freelancer_marketplace_messages` (1 conversation with 1 message)
- `freelancer_marketplace_notifications`, `freelancer_marketplace_saved_lists`, `freelancer_marketplace_ratings`, `freelancer_marketplace_browsing_history`
- `freelancer_marketplace_graphql_events` (operation logging)

#### Demo credentials

- Email: `demo@example.com` / `password`

#### Client `.env` patch needed

- Change `NEXT_PUBLIC_APP_SERVER` from `http://localhost:5000` to `http://localhost:5050/freelancer-marketplace-web`

#### Verified

- `npm run type:check` — zero errors
- Endpoints registered and returning demo data

---

## 2026-06-05 � artisan-services-web API audit fixes

### Changes applied

| # | Step | Files changed | Status |
|---|---|---|---|
| 1 | **Response envelope fix** - Created `sendListFeedback` helper that returns `data` as array + `results` count at top level, matching frontend expectations. Updated all 11 list endpoints in `artisan-services-web` controllers. | `src/functions/feedback.ts`, `src/projects/artisan-services-web/controllers/index.ts` | ? |
| 2 | **Reset password field name** - Changed `ResetPassword` controller to read `req.body.code` instead of `req.body.resetToken` (frontend sends `code`). | `src/projects/artisan-services-web/controllers/index.ts` | ? |
| 3 | **Deactivate URL fix** - Changed `appAxios.get(`deactivate`)` to `appAxios.get('"'"'/deactivate'"'"')` (was missing leading slash, producing `/api/v1deactivate`). | `Koneqtor-Frontend/src/components/artisan-module/settings/sections/Account/DeactivateAccountModal.tsx` | ? |
| 4 | **Socket.IO namespaces** - Added `artisan-services-web/chat` and `artisan-services-web/dispute` namespaces with event handling for `user:join`, `message`, and `response` broadcast. | `src/index.ts` | ? |
| 5 | **Google Maps geocoding replacement** - Added `POST /api/v1/geocode` endpoint returning dummy formatted address. Updated frontend `geocodeUserLocation` to call local endpoint instead of `maps.googleapis.com`. | `src/projects/artisan-services-web/routes/index.ts`, `src/projects/artisan-services-web/controllers/index.ts`, `Koneqtor-Frontend/src/functions/userLocation.ts` | ? |

### List endpoints now using sendListFeedback (response shape: `{ success, message, data: [...], results: N }`)

- `POST /api/v1/all/artisan` � paginated with `page`, `totalPages` extras
- `POST /api/v1/all/portfolio` � filterable by `artisan`
- `POST /api/v1/all/booking` � paginated
- `POST /api/v1/all/favourite` � paginated
- `POST /api/v1/all/rating` � filterable by `artisan`, sorted by date desc
- `POST /api/v1/all/dispute` � paginated
- `POST /api/v1/all/dispute-response` � returns empty array
- `POST /api/v1/all/chat` � filterable by `artisan`, sorted by date desc
- `GET /api/v1/chat/highlights` � grouped by artisan
- `POST /api/v1/all/notification` � from SQLite, mapped to expected shape
- `GET /api/v1/no-auth/all/artisan-category` � public

### Verification

- `npx tsc --noEmit` � zero errors
- All 5 changes verified via file inspection

### Next likely work

1. Start the artisan-services-web client (`npm run dev` in Koneqtor-Frontend) and walk through:
   - Login with `demo@example.com` / `password`
   - Browse artisans ? view profiles ? create booking ? chat
   - Dispute flow ? notification management
2. Verify Socket.IO real-time chat works in both `/chat` and `/dispute` namespaces.
