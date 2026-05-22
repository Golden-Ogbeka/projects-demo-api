# Project Module Template

Copy this folder when adding a new portfolio project.

Required shape:

- `index.ts`: exports one `ProjectModule`.
- `routes/index.ts`: mounts all routes for this project.
- `controllers/`: functional controller factories only.
- `types/`: request, response, and row types for this project.
- `database/`: SQLite tables, seed data, and project-owned database setup.

After creating the module, register it in `src/projects/index.ts`.
