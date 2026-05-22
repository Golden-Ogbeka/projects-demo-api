# Projects Demo API

`projects-demo-api` is a local dummy backend for portfolio projects whose original backend services or third-party integrations are no longer available.

The API is intentionally local-first:

- TypeScript + Express.
- SQLite database stored at `data/projects-demo-api.sqlite`.
- No environment variables required.
- No external database, email service, maps service, payment service, or cloud dependency.
- Each portfolio project gets its own isolated module under `src/projects`.

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Default URL:

```text
http://localhost:5050
```

Useful endpoints:

```text
GET /health
GET /
POST /saas-platform-admin-web/graphql
POST /saas-platform-admin-web/upload/media
GET /example-store/products
POST /example-store/auth/signup
POST /example-store/auth/login
POST /example-store/auth/verify-otp
GET /external/google-maps/places/search?query=lagos
POST /external/google-maps/geocode
```

## Build

```bash
npm run build
npm start
```

## Project Module Structure

Every portfolio project should live in its own folder:

```text
src/projects/{project-name}/
  controllers/
  database/
  routes/
  types/
  index.ts
```

The project `index.ts` exports a `ProjectModule`:

```ts
export const ExampleProject: ProjectModule = {
  name: "example-project",
  basePath: "/example-project",
  router: ExampleProjectRouter,
  setupDatabase: setupExampleProjectDatabase,
};
```

Then register it in `src/projects/index.ts`.

## Email And OTP Flows

This backend does not send real emails. If a portfolio app needs email verification, password reset, or login OTP:

- Generate the OTP locally.
- Store it in the project SQLite table.
- Return `emailSent: true`.
- Return the OTP in the response when useful for demos.

## External APIs

If a project used an external API, add a local replacement route here. For example, Google Maps-style routes currently live at:

```text
/external/google-maps
```

When updating the frontend/mobile app, comment out the real external implementation and point the app to this local backend route while preserving the same user-facing behavior.

## SaaS Platform Admin Web

The admin dashboard client is wired to:

```text
REACT_APP_API_URL=http://localhost:5050/saas-platform-admin-web
REACT_APP_GRAPHQL_URI=http://localhost:5050/saas-platform-admin-web/graphql
```

Demo login accepts any username/password. For clarity, use:

```text
Username: demo
Password: password
```

The module responds to GraphQL operations by detecting the requested root fields and returning realistic dummy data for auth, permissions, users, customers, products, orders, warehouses, fleet, sellers, vendors, payments, marketing, and mutation success states.

## AI Prompt For Adding A New Dummy Backend

See [`docs/ADDING-A-PROJECT.md`](docs/ADDING-A-PROJECT.md) for the full step-by-step guide including all known compatibility fixes and a pitfalls reference.

Quick AI prompt:

```text
You are working in the `projects-demo-api` repository. Add a dummy backend module for the portfolio project at [PROJECT_PATH].

First inspect the frontend/mobile project and find every backend or external API integration it uses: base URLs, endpoint paths, HTTP methods, request bodies, auth headers, expected response shapes, error states, and third-party services. Then create a new folder under `src/projects/[PROJECT_SLUG]` with `types`, `routes`, `controllers`, `database`, and `index.ts`.

Use TypeScript, Express, functional controller factories, and SQLite via the shared `sqlite` connection. Do not use OOP. Do not require environment variables. Do not call external services. Seed realistic dummy data locally. For email or OTP flows, assume sending succeeds and store the OTP in SQLite. For external APIs like Google Maps, create local replacement routes under this backend, then update the frontend/mobile project by commenting out the real implementation and pointing it to the local dummy route while preserving behavior.

Register the project in `src/projects/index.ts`, update `README.md`, `AGENTS.md`, and `PROGRESS.md`, run type checking, and list the routes that were added. Follow the full checklist in docs/ADDING-A-PROJECT.md.
```
