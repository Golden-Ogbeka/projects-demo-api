import { sqlite } from "../../../config/db.js";

export const setupSaasPlatformAdminDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS saas_platform_admin_graphql_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_name TEXT,
      root_fields TEXT,
      variables_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const recordSaasPlatformAdminOperation = (
  operationName: string,
  rootFields: string[],
  variables: Record<string, unknown>,
) => {
  sqlite
    .prepare(
      `
        INSERT INTO saas_platform_admin_graphql_events
          (operation_name, root_fields, variables_json)
        VALUES
          (@operationName, @rootFields, @variablesJson)
      `,
    )
    .run({
      operationName,
      rootFields: rootFields.join(","),
      variablesJson: JSON.stringify(variables || {}),
    });
};
