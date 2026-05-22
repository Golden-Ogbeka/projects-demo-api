import { sqlite } from "../../../config/db.js";

export const setupVendorManagementAdminDatabase = () => {
  // Create tables for vendor-management-admin-web
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS vendor_management_graphql_events (
      id TEXT PRIMARY KEY,
      operation_name TEXT,
      root_fields TEXT,
      variables TEXT,
      timestamp TEXT
    );
  `);

  // Seed is not needed for this module - all data comes from fixtures
};

export const recordVendorManagementOperation = (
  operationName: string,
  rootFields: string[],
  variables: Record<string, unknown>,
) => {
  try {
    sqlite.prepare(`
      INSERT INTO vendor_management_graphql_events (id, operation_name, root_fields, variables, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      `${Date.now()}-${Math.random()}`,
      operationName || "Anonymous",
      JSON.stringify(rootFields),
      JSON.stringify(variables),
      new Date().toISOString(),
    );
  } catch (error) {
    console.error("Failed to record vendor-management operation:", error);
  }
};
