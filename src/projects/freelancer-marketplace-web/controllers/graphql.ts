import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { GraphqlRequestBody } from "../types/index.js";
import { resolveField } from "./fixtures.js";

const extractRootFields = (query = "") => {
  const firstBrace = query.indexOf("{");
  if (firstBrace === -1) return [];
  const fields = new Set<string>();
  let depth = 0;
  let parenDepth = 0;
  let token = "";
  let readingAlias = false;
  const pushToken = () => {
    const value = token.trim();
    token = "";
    if (!value || readingAlias || value.startsWith("__")) return;
    fields.add(value);
  };
  for (let index = firstBrace + 1; index < query.length; index += 1) {
    const char = query[index];
    if (char === "(") { if (depth === 0) pushToken(); parenDepth += 1; continue; }
    if (char === ")") { parenDepth = Math.max(parenDepth - 1, 0); continue; }
    if (parenDepth > 0) continue;
    if (char === "{") { if (depth === 0) pushToken(); depth += 1; continue; }
    if (char === "}") { if (depth === 0) break; depth -= 1; continue; }
    if (depth !== 0) continue;
    if (char === ":") { readingAlias = true; token = ""; continue; }
    if (/[A-Za-z0-9_]/.test(char)) { token += char; readingAlias = false; continue; }
    pushToken();
    readingAlias = false;
  }
  return Array.from(fields);
};

export const FreelancerMarketplaceGraphqlController = () => {
  const HandleGraphql = async (
    req: Request & { body: GraphqlRequestBody },
    res: Response,
  ) => {
    const query = (req.body.query as string) || "";
    const operationName = (req.body.operationName as string) || "anonymous";
    const variables = (req.body.variables as Record<string, unknown>) || {};

    sqlite.prepare(`
      INSERT INTO freelancer_marketplace_graphql_events (operation_name, root_fields, variables_json)
      VALUES (@operationName, @rootFields, @variablesJson)
    `).run({
      operationName,
      rootFields: extractRootFields(query).join(","),
      variablesJson: JSON.stringify(variables || {}),
    });

    const rootFields = extractRootFields(query);
    const data = rootFields.reduce<Record<string, unknown>>((acc, field) => {
      acc[field] = resolveField(field, variables);
      return acc;
    }, {});

    return res.json({ data });
  };

  return { HandleGraphql };
};
