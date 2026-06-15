import { sqlite } from "../../../config/db.js";

export const setupCapAdminWebDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS cap_admin_web_graphql_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_name TEXT,
      root_fields TEXT NOT NULL,
      variables TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const recordCapAdminWebOperation = (operationName: string | undefined, rootFields: string[], variables: unknown) => {
  sqlite.prepare(`
    INSERT INTO cap_admin_web_graphql_events (operation_name, root_fields, variables)
    VALUES (?, ?, ?)
  `).run(
    operationName || null,
    JSON.stringify(rootFields),
    variables ? JSON.stringify(variables) : null
  );
};
