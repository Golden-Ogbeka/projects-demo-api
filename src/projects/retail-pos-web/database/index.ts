import { sqlite } from "../../../config/db.js";

export const setupRetailPosWebDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS retail_pos_web_graphql_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_name TEXT,
      root_fields TEXT,
      variables TEXT,
      created_at TEXT NOT NULL
    );
  `);
};

export const recordRetailPosWebOperation = (
  operationName: string,
  rootFields: string[],
  variables: Record<string, unknown>,
) => {
  try {
    sqlite.prepare(
      `INSERT INTO retail_pos_web_graphql_events (operation_name, root_fields, variables, created_at)
       VALUES (?, ?, ?, ?)`,
    ).run(
      operationName,
      JSON.stringify(rootFields),
      JSON.stringify(variables),
      new Date().toISOString(),
    );
  } catch {
    // non-critical logging — never crash the request
  }
};
