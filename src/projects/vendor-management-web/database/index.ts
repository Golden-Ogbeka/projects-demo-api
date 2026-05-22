import { db } from "../../../config/db.js";

export const setupVendorManagementWebDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS vendor_management_web_graphql_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_name TEXT,
      root_fields TEXT NOT NULL,
      variables TEXT,
      created_at TEXT NOT NULL
    );
  `);
};

export const recordVendorManagementWebOperation = (operationName: string | undefined, rootFields: string[], variables: unknown) => {
  db.prepare(`
    INSERT INTO vendor_management_web_graphql_events (operation_name, root_fields, variables, created_at)
    VALUES (?, ?, ?, ?)
  `).run(
    operationName || null,
    JSON.stringify(rootFields),
    variables ? JSON.stringify(variables) : null,
    new Date().toISOString()
  );
};
