import { sqlite } from "../../../config/db.js";

export const setupInventoryAdminWebDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS inventory_admin_web_graphql_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operationName TEXT,
      rootFields TEXT,
      variables TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);
};

export const recordInventoryAdminWebOperation = (
  operationName: string,
  rootFields: string[],
  variables: Record<string, unknown>,
) => {
  try {
    sqlite
      .prepare(
        `INSERT INTO inventory_admin_web_graphql_events (operationName, rootFields, variables) VALUES (?, ?, ?)`,
      )
      .run(operationName, JSON.stringify(rootFields), JSON.stringify(variables));
  } catch (_) {
    // non-fatal
  }
};
