import { Request, Response } from "express";
import { recordVendorManagementOperation } from "../database/index.js";
import { GraphqlRequestBody } from "../types/index.js";
import {
  createDemoJwt,
  demoCustomers,
  demoInventoryMetrics,
  demoLeaderBoard,
  demoOrderPerformance,
  demoOrders,
  demoPermissions,
  demoProductPerformance,
  demoReportStats,
  demoRoles,
  demoSalesByCategory,
  demoSalesBySegment,
  demoSalesTrend,
  demoSellers,
  demoStockByCategory,
  demoTodos,
  demoTopSellingProducts,
  demoTotalSales,
  demoUser,
  demoUsers,
  expandedProducts,
  getOrderDetails,
  paginated,
  states,
  warehouses,
} from "./fixtures.js";

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
    if (char === "(") {
      if (depth === 0) pushToken();
      parenDepth += 1;
      continue;
    }
    if (char === ")") {
      parenDepth = Math.max(parenDepth - 1, 0);
      continue;
    }
    if (parenDepth > 0) continue;
    if (char === "{") {
      if (depth === 0) pushToken();
      depth += 1;
      continue;
    }
    if (char === "}") {
      if (depth === 0) break;
      depth -= 1;
      continue;
    }
    if (depth !== 0) continue;
    if (char === ":") {
      readingAlias = true;
      token = "";
      continue;
    }
    if (/[A-Za-z0-9_]/.test(char)) {
      token += char;
      readingAlias = false;
      continue;
    }
    pushToken();
    readingAlias = false;
  }
  return Array.from(fields);
};

const resolveField = (
  field: string,
  variables: Record<string, unknown>,
): unknown => {
  // Auth fields
  if (field === "authenticateUser") {
    return {
      status: "success",
      jwt: createDemoJwt(),
      userId: demoUser.userId,
    };
  }

  // User fields
  if (field === "getUser") return demoUser;
  if (field === "getUsers") return paginated(demoUsers);
  if (field === "requireWarehouseForRoles") return false;
  if (field === "getRolesForUser") return paginated(demoRoles);

  // Roles and permissions
  if (field === "getRoles") return paginated(demoRoles);
  if (field === "getPermissions") return paginated(demoPermissions);

  // Todos
  if (field === "getAllToDo") return paginated(demoTodos);

  // Warehouses and locations
  if (field === "getWarehouses") return warehouses;
  if (field === "getWarehouse") return warehouses[0];
  if (field === "getStateAndCities") return states;
  if (field === "getAllCities") return states.flatMap((s) => s.Cities);

  // Sellers
  if (field === "getSellers") return paginated(demoSellers);

  // Customers
  if (field === "getCustomers") return paginated(demoCustomers);

  // Products and variants
  if (
    field === "getProducts" ||
    field === "getAllProducts" ||
    field === "getAllProductsNew" ||
    field === "getAllVariants"
  ) {
    return paginated(expandedProducts);
  }
  if (field === "getVariantDrafts") return paginated([]);

  // Orders
  if (field === "orders") {
    return paginated(demoOrders);
  }
  if (field === "order" || field === "getOrder") {
    const orderId = (variables?.id || variables?.orderId) as string;
    return getOrderDetails(orderId);
  }

  // Dashboard metrics
  if (field === "getOrderPerformance") return demoOrderPerformance;
  if (field === "getInventoryMetrics") return demoInventoryMetrics;
  if (field === "getStockByCategory") return demoStockByCategory;
  if (field === "getTotalSales") return demoTotalSales;
  if (field === "getTopSellingProducts") return demoTopSellingProducts;
  if (field === "getSalesBySegment") return demoSalesBySegment;

  // Dashboard v2 fields
  if (field === "getReportStats") return demoReportStats;
  if (field === "getLeaderBoard") return demoLeaderBoard;
  if (field === "getProductPerformance") return demoProductPerformance;
  if (field === "getSalesTrend") return demoSalesTrend;
  if (field === "getSalesByCategory") return demoSalesByCategory;

  // Default list response
  if (
    field.startsWith("get") ||
    field.startsWith("fetch") ||
    field.startsWith("search") ||
    field.endsWith("List")
  ) {
    return paginated([]);
  }

  // Default mutation success response
  return {
    _id: `${field}-1`,
    id: `${field}-1`,
    success: true,
    status: "success",
    message: "Demo operation completed successfully",
  };
};

export const VendorManagementGraphqlController = () => {
  const HandleGraphql = async (
    req: Request & { body: GraphqlRequestBody },
    res: Response,
  ) => {
    const { operationName, query, variables } = req.body;
    console.log("[vendor-management-admin-web] GraphQL:", operationName || "Anonymous Query");

    const rootFields = extractRootFields(query);
    recordVendorManagementOperation(operationName || "", rootFields, variables || {});

    const data: Record<string, unknown> = {};
    for (const field of rootFields) {
      if (field === "query" || field === "mutation") continue;
      data[field] = resolveField(field, variables || {});
    }

    return res.json({ data });
  };

  return { HandleGraphql };
};
