# cap-admin-web — Zeebly Admin Dummy Backend

Dummy backend for the Zeebly Admin (cap-admin) web client at `/cap-admin-web`.

## Endpoints

### GraphQL

`POST /cap-admin-web/graphql` — covers 50+ queries and mutations: dashboard, centres, partners, reps, orders, inventory, audit trail, notifications, settings, and auth.

Response headers `x-token` and `x-refresh-token` are set on every response for the Apollo RetryLink token refresh flow.

### REST API (base path: `/cap-admin-web/api`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/upload/upload_products/:productId` | Product image upload |
| POST | `/api/upload/upload-rebate-discount` | Rebate discount CSV |
| POST | `/api/upload/upload-target` | Target CSV |
| POST | `/api/upload/upload_admin_image/:id` | Admin profile image |
| GET | `/api/upload/download_audit_trail?log_type=` | Audit trail CSV download |
| POST | `/api/auth/refresh-token` | Token refresh |

### Socket.IO

- Namespace: `/cap-admin-web`
- Event: `admin-notify-all` — broadcast notifications with acknowledgment.

## Auth

- Mutation: `authenticateAdminUser(email, password)` returns `{ data, status, statusCode, message }`.
- Demo credentials: `admin@zeebly.com` / any password.
- `x-token` / `x-refresh-token` headers sent on all GraphQL and refresh-token responses.

## Client Configuration

```env
REACT_APP_BASE_API=http://localhost:5050/cap-admin-web
REACT_APP_GRAPHQL_API=http://localhost:5050/cap-admin-web/graphql
REACT_APP_REST_API=http://localhost:5050/cap-admin-web/api
```
