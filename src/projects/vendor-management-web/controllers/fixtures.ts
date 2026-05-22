export const demoUser = {
  id: "user-1",
  _id: "user-1",
  userId: "user-1",
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  userName: "demo",
  createdAt: String(Date.now()),
  updatedAt: String(Date.now()),
  roles: [{ id: "role-1", name: "Super Admin" }],
  permissions: ["ALL"],
};

export const pageInfo = (items: unknown[], page = 1, size = 50) => ({
  totalItems: items.length,
  totalCount: items.length,
  currentPage: page,
  page,
  size,
  hasNextPage: false,
  hasPreviousPage: false,
});

export const paginated = (items: unknown[], page = 1, size = 50) => ({
  nodes: items,
  data: items,
  items,
  total: items.length,
  count: items.length,
  pageInfo: pageInfo(items, page, size),
});

export const okMutation = (field: string, variables: any = {}) => ({
  success: true,
  status: true,
  message: "Success",
  id: variables.id || "new-id",
  _id: variables.id || "new-id",
});

export const scalarFields = new Set([
  "verifyUserEmail",
  "verifyToken",
  "checkPermission",
]);

export const genericLog = {
  id: "log-1",
  _id: "log-1",
  message: "Generic log item",
  createdAt: String(Date.now()),
  updatedAt: String(Date.now()),
};
