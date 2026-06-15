import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { recordLogisticsAdminOperation } from "../database/index.js";
import { GraphqlRequestBody } from "../types/index.js";

const mutationPrefixes = [
  "add", "approve", "cancel", "change", "create", "delete",
  "edit", "invite", "remove", "resolve", "update", "verify",
];

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

const makeUserShape = (row: Record<string, unknown>) => ({
  _id: row._id,
  name: row.name,
  firstName: row.firstName,
  lastName: row.lastName,
  otherName: row.otherName,
  email: row.email,
  userName: row.userName,
  phoneNumber: row.phoneNumber,
  role: row.role,
  accountType: row.accountType,
  isEmailVerified: Boolean(row.isEmailVerified),
  createdAt: row.createdAt,
});

const pageInfo = (items: unknown[], page = 1, size = 50) => ({
  totalItems: items.length,
  totalCount: items.length,
  currentPage: page,
  page,
  size,
  hasNextPage: false,
  hasPreviousPage: false,
});

const paginated = (items: unknown[], page = 1, size = 50) => ({
  nodes: items,
  data: items,
  items,
  total: items.length,
  count: items.length,
  pageInfo: pageInfo(items, page, size),
});

const okMutation = (field: string, _variables: Record<string, unknown>) => ({
  _id: `${field}-1`,
  id: `${field}-1`,
  success: true,
  status: "success",
  message: "Operation completed successfully",
});

const isListField = (field: string) => (
  field.startsWith("get")
  || field.startsWith("fetch")
  || field.startsWith("search")
  || field.endsWith("List")
  || field.endsWith("Members")
  || field.endsWith("Notifications")
  || field.endsWith("Disputes")
  || ["parcels", "transactions", "users", "notifications", "disputes"].includes(field)
);

const resolveField = (field: string, _variables: Record<string, unknown>): unknown => {
  // -- Frontend auth mutations --
  if (field === "login") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_users ORDER BY id LIMIT 1").all() as Array<Record<string, unknown>>;
    const u = rows[0] || {};
    return { success: true, data: makeUserShape(u) };
  }
  if (field === "logout") {
    return { statusCode: 200, success: true };
  }
  if (field === "verifyEmail" || field === "forgotPassword" || field === "updateResetPassword" || field === "sendVerificationMail") {
    return true;
  }

  if (field === "getUser") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_users ORDER BY id LIMIT 1").all() as Array<Record<string, unknown>>;
    const u = rows[0] || {};
    return { data: makeUserShape(u) };
  }

  if (field === "getUsers") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_users").all() as Array<Record<string, unknown>>;
    const shipUsers = rows.map((u) => ({
      _id: u._id, name: u.name, firstName: u.firstName, lastName: u.lastName,
      otherName: u.otherName, email: u.email, userName: u.userName,
      phoneNumber: u.phoneNumber, accountType: u.accountType,
      isEmailVerified: Boolean(u.isEmailVerified), role: u.role, createdAt: u.createdAt,
    }));
    return { statusCode: 200, success: true, message: "Users retrieved successfully", data: shipUsers };
  }

  if (field === "getUserById") {
    const id = (_variables?.userId as string) || "user-1";
    const row = sqlite.prepare("SELECT * FROM logistics_admin_users WHERE _id = ?").get(id) as Record<string, unknown> | undefined;
    const u = row || {};
    return { statusCode: 200, success: true, message: "User retrieved successfully", data: makeUserShape(u) };
  }

  if (field === "getShipments") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_shipments").all() as Array<Record<string, unknown>>;
    const items = rows.map((r) => JSON.parse(r.data as string));
    return { statusCode: 200, success: true, message: "Shipments retrieved successfully", data: { count: items.length, shipments: items } };
  }

  if (field === "getShipment") {
    const id = _variables?.input && typeof _variables.input === "object" && "shipmentId" in (_variables.input as Record<string, unknown>)
      ? (_variables.input as Record<string, unknown>).shipmentId as string
      : "parcel-1";
    const row = sqlite.prepare("SELECT * FROM logistics_admin_shipments WHERE _id = ?").get(id) as Record<string, unknown> | undefined;
    const item = row ? JSON.parse(row.data as string) : null;
    return { statusCode: 200, success: true, message: "Shipment retrieved successfully", data: item || {} };
  }

  if (field === "getUserShipments") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_shipments").all() as Array<Record<string, unknown>>;
    const items = rows.map((r) => JSON.parse(r.data as string));
    return { statusCode: 200, success: true, message: "User shipments retrieved successfully", data: { count: items.length, shipments: items } };
  }

  if (field === "getAllContacts") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_contacts").all() as Array<Record<string, unknown>>;
    return { statusCode: 200, success: true, message: "Contacts retrieved successfully", data: { count: rows.length, data: rows } };
  }

  if (field === "getShipmentCostFromLagos") {
    return sqlite.prepare("SELECT * FROM logistics_admin_lagos_costs").all();
  }
  if (field === "getIntraStateShipmentCost") {
    return sqlite.prepare("SELECT * FROM logistics_admin_intra_costs").all();
  }
  if (field === "getInterStateShipmentCost") {
    return sqlite.prepare("SELECT * FROM logistics_admin_inter_costs").all();
  }
  if (field === "getIntlBasicShipmentCost") {
    return sqlite.prepare("SELECT * FROM logistics_admin_intl_costs").all();
  }

  if (field === "createNewUser") return { success: true };
  if (field === "createShipment") {
    const row = sqlite.prepare("SELECT * FROM logistics_admin_shipments ORDER BY id LIMIT 1").get() as Record<string, unknown> | undefined;
    const shipment = row ? JSON.parse(row.data as string) : {};
    return { statusCode: 200, success: true, message: "Shipment created successfully", data: { shipment, authorizationUrl: "https://demo-paystack.com/authorize/demo-ref" } };
  }
  if (field === "createIntraStateShipmentCost") {
    const input = _variables?.input as Record<string, unknown> | undefined;
    return { _id: "intra-new-1", deliveryType: input?.deliveryType as string || "Standard", duration: input?.duration as string || "1-2 days", price: input?.price as string || "0", state: input?.state as string || "Lagos" };
  }

  if (field === "editUser" || field === "editIntraStateShipmentCost" || field === "editInterStateShipmentCost" || field === "editShipmentCostFromLagos" || field === "editExpIntShipmentCost") {
    return true;
  }

  // -- Old/existing handlers (kept for backward compatibility) --
  if (field === "authenticateUser") {
    const row = sqlite.prepare("SELECT * FROM logistics_admin_users ORDER BY id LIMIT 1").get() as Record<string, unknown> | undefined;
    const u = row || {};
    return { token: "demo-token-user-1", refreshToken: "demo-refresh-token-user-1", expiresIn: 86400, user: makeUserShape(u) };
  }
  if (field === "verifyToken" || field === "refreshToken") {
    return { token: "demo-token-user-1", refreshToken: "demo-refresh-token-user-1", expiresIn: 86400 };
  }

  if (field === "getDashboard" || field === "dashboardSummary" || field === "dashboard") {
    const parcelCount = (sqlite.prepare("SELECT COUNT(*) as c FROM logistics_admin_parcels").get() as { c: number }).c;
    return {
      totalParcels: 1250, inTransit: 340, deliveredToday: 85, pendingPickup: 42,
      returned: 18, cancelled: 25, totalRevenue: 4580000, monthlyRevenue: 1250000,
      activeUsers: 48, avgDeliveryTime: "2.5 days",
    };
  }

  if (field === "getParcels" || field === "parcels") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_parcels").all() as Array<Record<string, unknown>>;
    return paginated(rows);
  }
  if (field === "getParcel" || field === "parcel") {
    const row = sqlite.prepare("SELECT * FROM logistics_admin_parcels ORDER BY id LIMIT 1").get() as Record<string, unknown> | undefined;
    return row || {};
  }

  if (field === "getShippingPricing" || field === "shippingPricing") {
    return sqlite.prepare("SELECT * FROM logistics_admin_shipping_pricing").all();
  }

  if (field === "getDisputes" || field === "disputes") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_disputes").all();
    return paginated(rows);
  }
  if (field === "getDispute" || field === "dispute") {
    const row = sqlite.prepare("SELECT * FROM logistics_admin_disputes ORDER BY id LIMIT 1").get();
    return row || {};
  }

  if (field === "getTransactions" || field === "transactions") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_transactions").all();
    return paginated(rows);
  }

  if (field === "user") {
    const row = sqlite.prepare("SELECT * FROM logistics_admin_users ORDER BY id LIMIT 1").get() as Record<string, unknown> | undefined;
    return row || {};
  }

  if (field === "getTeamMembers" || field === "teamMembers") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_team_members").all() as Array<Record<string, unknown>>;
    const items = rows.map((r) => ({ ...r, permissions: JSON.parse(r.permissions as string) }));
    return paginated(items);
  }

  if (field === "getNotifications" || field === "notifications") {
    const rows = sqlite.prepare("SELECT * FROM logistics_admin_notifications").all();
    return paginated(rows);
  }

  if (field === "getProfile" || field === "profile") {
    const row = sqlite.prepare("SELECT * FROM logistics_admin_users ORDER BY id LIMIT 1").get() as Record<string, unknown> | undefined;
    return row || {};
  }

  if (field === "getRoles" || field === "roles") {
    return paginated([
      { id: "role-1", name: "Super Admin", permissions: ["all"] },
      { id: "role-2", name: "Operations", permissions: ["view_parcels", "create_parcels", "update_parcels", "view_dashboard"] },
      { id: "role-3", name: "Viewer", permissions: ["view_parcels", "view_dashboard"] },
    ]);
  }

  if (field === "getTrackingInfo" || field === "trackingInfo") {
    const row = sqlite.prepare("SELECT * FROM logistics_admin_parcels ORDER BY id LIMIT 1").get() as Record<string, unknown> | undefined;
    return {
      trackingNumber: row?.trackingNumber || "SA-000001",
      status: row?.status || "in_transit",
      origin: row?.origin || "Lagos",
      destination: row?.destination || "Abuja",
      estimatedDelivery: new Date(Date.now() + 2 * 86400000).toISOString(),
      events: [
        { timestamp: new Date(Date.now() - 86400000).toISOString(), location: "Lagos Sorting Facility", description: "Package arrived at facility", status: "in_transit" },
        { timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), location: "Lagos Pickup Point", description: "Package picked up from sender", status: "picked_up" },
      ],
    };
  }

  if (field === "getAddresses" || field === "addresses") {
    return paginated([
      { id: "addr-1", label: "Office", address: "42 Marina Street, Lagos", isDefault: true },
      { id: "addr-2", label: "Home", address: "15 Peace Avenue, Abuja", isDefault: false },
    ]);
  }

  if (field === "getAnalytics" || field === "analytics") {
    return {
      totalParcels: 1250, totalRevenue: 4580000, avgDeliveryTime: "2.5 days", customerSatisfaction: 4.7,
      monthlyTrend: [
        { month: "Jan", parcels: 98 }, { month: "Feb", parcels: 112 }, { month: "Mar", parcels: 105 },
        { month: "Apr", parcels: 128 }, { month: "May", parcels: 135 }, { month: "Jun", parcels: 142 },
      ],
    };
  }

  if (field === "getSettings" || field === "settings") {
    return { notifications: { email: true, sms: false, push: true }, theme: "light", timezone: "Africa/Lagos", currency: "NGN" };
  }

  if (mutationPrefixes.some((prefix) => field.startsWith(prefix))) {
    return okMutation(field, _variables);
  }

  if (isListField(field)) {
    return paginated([]);
  }

  return {};
};

export const GraphqlController = () => {
  const Handle = async (
    req: Request & { body: GraphqlRequestBody },
    res: Response,
  ) => {
    const query = (req.body.query as string) || "";
    const operationName = (req.body.operationName as string) || "anonymous";
    const variables = (req.body.variables as Record<string, unknown>) || {};

    const rootFields = extractRootFields(query);

    recordLogisticsAdminOperation(operationName, rootFields, variables);

    const data = rootFields.reduce<Record<string, unknown>>((acc, field) => {
      acc[field] = resolveField(field, variables);
      return acc;
    }, {});

    return res.json({ data });
  };

  return { Handle };
};
