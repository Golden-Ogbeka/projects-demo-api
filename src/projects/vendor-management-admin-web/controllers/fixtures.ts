import { PageInfo } from "../types/index.js";

const UNSPLASH = {
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  warehouse:
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600",
  product: "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=400",
  banner: "https://images.unsplash.com/photo-1556742049-0cfed4f06a45?w=1200",
  store: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=500",
};

export const createDemoJwt = () => {
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: "user-1",
      userId: "user-1",
      name: "Demo Admin",
      status: "success",
      permissions: [
        "access_admin",
        "view_users", "create_users", "change_password", "view_role_permission",
        "view_customer", "edit_customer", "allow_customer_referral",
        "view_order", "change_order_priority", "undo_order_status", "download_order_list",
        "manage_reason", "manage_holiday", "manage_min_order_value", "validate_order",
        "view_product", "create_product", "edit_product_names", "edit_product_variants",
        "edit_variant_display_name", "edit_variant_pricing", "edit_variant_alerzoshop_status",
        "edit_product_categories", "edit_product_sub-categories", "edit_product_manufacturers",
        "edit_product_brands", "create_product_bundle", "create_promotion",
        "view_warehouse", "create_warehouse", "edit_state", "edit_city", "edit_landmark",
        "view_stock", "view_procurement", "create_procurement", "approve_procurement",
        "view_transfer", "create_transfer", "approve_transfer",
        "view_incident", "approve_incident", "create_incident",
        "assign_vehicle", "view_route", "create_route", "assign_route", "edit_route",
        "view_todo", "view_payment_tab", "validate_payment", "undo_payment_status",
        "view_seller", "create_seller", "edit_seller",
        "view_vendor", "create_vendor", "edit_vendor",
        "view_purchase_requisition", "create_purchase_requisition",
        "submit_purchase_requisition", "approve_purchase_requisition",
        "view_purchase_order", "approve_purchase_order", "audit_purchase_order",
        "pay_purchase_order", "notify_purchase_order",
        "view_transaction", "create_transaction", "modify_transaction",
        "prepare_transaction", "verify_transaction", "approve_transaction",
        "dispatch_transaction", "create_sale_order", "return_transaction",
        "approve_return_transaction", "cancel_transaction",
        "create_plan", "edit_plan", "delete_plan",
        "view_request", "view_requestListing", "create_request", "modify_request",
        "approve_request", "request_review", "decline_request",
        "request_inprogress", "request_completed",
        "view_visitation_log", "view_crm_visitation_log",
        "view_pricing_visitation_log", "view_bde_visitation_log",
      ],
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    }),
  ).toString("base64url");

  return `${header}.${payload}.demo-signature`;
};

export const demoUser = {
  _id: "user-1",
  id: "user-1",
  userId: "user-1",
  firstName: "Demo",
  lastName: "Admin",
  fullName: "Demo Admin",
  userName: "demo.admin",
  email: "demo@example.com",
  phoneNo: "+2348012345678",
  status: "ACTIVE",
  isActive: true,
  imageUrl: UNSPLASH.avatar,
  warehouseId: "warehouse-1",
  referCode: "DEMO123",
  referralLink: "https://demo.alerzo.com/ref/DEMO123",
  lastUserAccessTime: new Date().toISOString(),
  lastActiveIP: "192.168.1.1",
  lastUsedPlatform: "web",
  stateId: "state-1",
  cityId: "city-1",
  requireWarehouse: false,
  appVersion: "1.0.0",
  lastUsedCountry: "NG",
  allowedCountries: ["NG"],
  isAlerzoUser: true,
  createdAt: "2026-05-21T10:00:00.000Z",
  warehouse: {
    warehouseId: "warehouse-1",
    warehouseName: "Main Warehouse",
    lat: 7.3775,
    long: 3.947,
    City: {
      cityId: "city-1",
      cityName: "Ibadan",
      State: { stateId: "state-1", stateName: "Oyo" },
    },
    usesOptimizedDelivery: true,
  },
  Roles: [
    {
      roleId: "role-1",
      roleName: "Admin",
      country: "NG",
      requireAttendance: false,
    },
  ],
  seller: {
    status: "ACTIVE",
    sellerName: "Demo Seller",
    warehouseList: [
      {
        warehouseId: "warehouse-1",
        cityId: "city-1",
        City: {
          cityId: "city-1",
          cityName: "Ibadan",
          State: { stateId: "state-1", stateName: "Oyo" },
        },
        warehouseName: "Main Warehouse",
        distance: 0,
        isActive: true,
        isDepot: false,
        isDefault: true,
        lat: 7.3775,
        long: 3.947,
        whatsAppComplaintNumber: "+2348012345678",
        tollFreeNumber: "+2341234567890",
        address: "Demo Warehouse Road, Ibadan",
        footPrint: "5000sqm",
      },
    ],
  },
  sellerId: "seller-1",
};

export const demoUsers = [
  demoUser,
  {
    ...demoUser,
    _id: "user-2",
    userId: "user-2",
    fullName: "Alice Admin",
    userName: "ada.ops",
    email: "ada.ops@example.com",
  },
  {
    ...demoUser,
    _id: "user-3",
    userId: "user-3",
    fullName: "Demo Staff",
    userName: "chidi.warehouse",
    email: "chidi.warehouse@example.com",
  },
];

export const warehouses = [
  {
    _id: "warehouse-1",
    id: "warehouse-1",
    warehouseId: "warehouse-1",
    warehouseName: "Main Warehouse",
    prefix: "MW",
    status: "Active",
    isActive: true,
    address: "Demo Warehouse Road",
    lat: 7.3775,
    long: 3.947,
    City: {
      cityId: "city-1",
      cityName: "Ibadan",
      State: { stateId: "state-1", stateName: "Oyo" },
    },
  },
  {
    _id: "warehouse-2",
    id: "warehouse-2",
    warehouseId: "warehouse-2",
    warehouseName: "Secondary Warehouse",
    prefix: "SW",
    status: "Active",
    isActive: true,
    address: "Demo Depot Road",
    lat: 6.6018,
    long: 3.3515,
    City: {
      cityId: "city-2",
      cityName: "Lagos",
      State: { stateId: "state-2", stateName: "Lagos" },
    },
  },
];

export const states = [
  {
    stateId: "state-1",
    id: "state-1",
    stateName: "Oyo",
    region: "South West",
    Cities: [{ cityId: "city-1", cityName: "Ibadan" }],
  },
  {
    stateId: "state-2",
    id: "state-2",
    stateName: "Lagos",
    region: "South West",
    Cities: [{ cityId: "city-2", cityName: "Lagos" }],
  },
];

export const products = [
  {
    _id: "product-1",
    id: "product-1",
    productId: "product-1",
    productName: "Demo Product A",
    displayTitle: "Demo Product A",
    product_SKU: "DEMO-001",
    category: "Groceries",
    subCategory: "Dry Goods",
    brand: "Demo Brand",
    price: 5000,
    quantity: 100,
    imageUrl: UNSPLASH.product,
    images: { imageUrl: UNSPLASH.product },
    pricing: {
      wholesalePrice: 4500,
      retailPrice: 5000,
      marketPrice: 5500,
    },
    isActive: true,
  },
  {
    _id: "product-2",
    id: "product-2",
    productId: "product-2",
    productName: "Demo Product B",
    displayTitle: "Demo Product B",
    product_SKU: "DEMO-002",
    category: "Beverages",
    subCategory: "Soft Drinks",
    brand: "Demo Brand",
    price: 3000,
    quantity: 200,
    imageUrl: UNSPLASH.product,
    images: { imageUrl: UNSPLASH.product },
    pricing: {
      wholesalePrice: 2700,
      retailPrice: 3000,
      marketPrice: 3300,
    },
    isActive: true,
  },
];

export const demoOrderPerformance = {
  orderReceived: 245,
  orderCancelled: 12,
  orderReturned: 8,
  totalTrips: 189,
};

export const demoInventoryMetrics = {
  inventoryValuation: 2450000,
  inventoryCount: 1850,
};

export const demoStockByCategory = {
  warehouseName: "Main Warehouse",
  categories: [
    {
      categoryName: "Groceries",
      stockValuation: 1200000,
      stockCount: 950,
    },
    {
      categoryName: "Beverages",
      stockValuation: 780000,
      stockCount: 450,
    },
  ],
};

export const demoTotalSales = {
  warehouseId: "warehouse-1",
  warehouseName: "Main Warehouse",
  totalSales: 4850000,
};

export const demoTopSellingProducts = [
  {
    productId: "product-1",
    productSKU: "DEMO-001",
    displayTitle: "Demo Product A",
    totalSales: 1200000,
    quantitySold: 240,
  },
  {
    productId: "product-2",
    productSKU: "DEMO-002",
    displayTitle: "Demo Product B",
    totalSales: 900000,
    quantitySold: 300,
  },
];

export const demoSalesBySegment = [
  {
    segment: "Retail",
    totalSales: 2850000,
    totalOrders: 145,
    totalCustomers: 42,
    percentageOfTotalSales: 58.6,
  },
  {
    segment: "Wholesale",
    totalSales: 2000000,
    totalOrders: 100,
    totalCustomers: 18,
    percentageOfTotalSales: 41.2,
  },
];

export const demoReportStats = {
  totalSales: { value: 4850000, pctChange: 12.5 },
  orderCount: { value: 245, pctChange: 8.3 },
  avgOrderValue: { value: 19795, pctChange: 3.9 },
  outletsVisited: { value: 87, pctChange: 5.1 },
  customersOnboarded: { value: 34, pctChange: 15.2 },
  stockValuation: { value: 2450000, pctChange: -2.1 },
};

export const demoLeaderBoard = [
  {
    userId: "user-1",
    totalAmount: 1850000,
    user: { imageUrl: UNSPLASH.avatar, fullName: "Demo Admin" },
  },
  {
    userId: "user-2",
    totalAmount: 1420000,
    user: { imageUrl: UNSPLASH.avatar, fullName: "Alice Admin" },
  },
  {
    userId: "user-3",
    totalAmount: 980000,
    user: { imageUrl: UNSPLASH.avatar, fullName: "Demo Staff" },
  },
];

export const demoProductPerformance = [
  {
    productName: "Demo Product A",
    totalSales: 1200000,
    totalQuantity: 240,
    product: { image: { small: UNSPLASH.product } },
  },
  {
    productName: "Demo Product B",
    totalSales: 900000,
    totalQuantity: 300,
    product: { image: { small: UNSPLASH.product } },
  },
  {
    productName: "Demo Product C",
    totalSales: 750000,
    totalQuantity: 150,
    product: { image: { small: UNSPLASH.product } },
  },
];

export const demoSalesTrend = [
  { xAxisLabel: "8am", directTotalSales: 320000, inDirectTotalSales: 150000 },
  { xAxisLabel: "9am", directTotalSales: 480000, inDirectTotalSales: 220000 },
  { xAxisLabel: "10am", directTotalSales: 650000, inDirectTotalSales: 310000 },
  { xAxisLabel: "11am", directTotalSales: 820000, inDirectTotalSales: 390000 },
  { xAxisLabel: "12pm", directTotalSales: 940000, inDirectTotalSales: 450000 },
  { xAxisLabel: "1pm", directTotalSales: 760000, inDirectTotalSales: 380000 },
  { xAxisLabel: "2pm", directTotalSales: 610000, inDirectTotalSales: 290000 },
  { xAxisLabel: "3pm", directTotalSales: 530000, inDirectTotalSales: 240000 },
];

export const demoSalesByCategory = [
  { categoryName: "Groceries", totalSales: 1800000, percentage: 37.1 },
  { categoryName: "Beverages", totalSales: 1200000, percentage: 24.7 },
  { categoryName: "Personal Care", totalSales: 950000, percentage: 19.6 },
  { categoryName: "Household", totalSales: 550000, percentage: 11.3 },
  { categoryName: "Others", totalSales: 350000, percentage: 7.2 },
];

export const pageInfo = (items: unknown[], page = 1, size = 50): PageInfo => ({
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

// Roles and Permissions
export const demoRoles = [
  {
    roleId: "role-1",
    roleName: "Admin",
    country: "NG",
    Permissions: [
      { permissionId: "perm-1", permissionName: "create_order" },
      { permissionId: "perm-2", permissionName: "edit_order" },
      { permissionId: "perm-3", permissionName: "delete_order" },
      { permissionId: "perm-4", permissionName: "view_analytics" },
    ],
  },
  {
    roleId: "role-2",
    roleName: "Operator",
    country: "NG",
    Permissions: [
      { permissionId: "perm-1", permissionName: "create_order" },
      { permissionId: "perm-2", permissionName: "edit_order" },
    ],
  },
  {
    roleId: "role-3",
    roleName: "Viewer",
    country: "NG",
    Permissions: [
      { permissionId: "perm-5", permissionName: "view_orders" },
      { permissionId: "perm-4", permissionName: "view_analytics" },
    ],
  },
];

export const demoPermissions = [
  {
    permissionId: "perm-1",
    permissionName: "create_order",
    Roles: [demoRoles[0], demoRoles[1]],
  },
  {
    permissionId: "perm-2",
    permissionName: "edit_order",
    Roles: [demoRoles[0], demoRoles[1]],
  },
  {
    permissionId: "perm-3",
    permissionName: "delete_order",
    Roles: [demoRoles[0]],
  },
  {
    permissionId: "perm-4",
    permissionName: "view_analytics",
    Roles: [demoRoles[0], demoRoles[2]],
  },
  {
    permissionId: "perm-5",
    permissionName: "view_orders",
    Roles: [demoRoles[0], demoRoles[1], demoRoles[2]],
  },
];

// Todos
export const demoTodos = [
  {
    object_id: "todo-1",
    todoUrl: "https://demo.alerzo.com/orders/ORD-001",
    user_id: "user-1",
    todoType: "ORDER",
    action: "Process order payment",
    nextAction: "Verify payment confirmation",
    referenceId: "ORD-001",
    status: "PENDING",
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    warehouseId: "warehouse-1",
    additionalRemarks: "Payment pending for demo order",
  },
  {
    object_id: "todo-2",
    todoUrl: "https://demo.alerzo.com/inventory/INV-001",
    user_id: "user-1",
    todoType: "INVENTORY",
    action: "Update stock levels",
    nextAction: "Confirm stock count",
    referenceId: "INV-001",
    status: "IN_PROGRESS",
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    warehouseId: "warehouse-1",
    additionalRemarks: "Stock audit in progress",
  },
];

// Sellers
export const demoSellers = [
  {
    _id: "seller-1",
    id: "seller-1",
    sellerId: "seller-1",
    sellerName: "Demo Seller A",
    status: "ACTIVE",
    warehouses: ["warehouse-1"],
    warehouseList: [
      {
        warehouseId: "warehouse-1",
        warehouseName: "Main Warehouse",
        cityId: "city-1",
        isActive: true,
      },
    ],
    pickupLocations: [
      {
        warehouse: "warehouse-1",
        _id: "pickup-1",
      },
    ],
  },
  {
    _id: "seller-2",
    id: "seller-2",
    sellerId: "seller-2",
    sellerName: "Demo Seller B",
    status: "ACTIVE",
    warehouses: ["warehouse-1", "warehouse-2"],
    warehouseList: [
      {
        warehouseId: "warehouse-1",
        warehouseName: "Main Warehouse",
        cityId: "city-1",
        isActive: true,
      },
      {
        warehouseId: "warehouse-2",
        warehouseName: "Secondary Warehouse",
        cityId: "city-2",
        isActive: true,
      },
    ],
    pickupLocations: [
      {
        warehouse: "warehouse-1",
        _id: "pickup-2",
      },
      {
        warehouse: "warehouse-2",
        _id: "pickup-3",
      },
    ],
  },
];

// Customers
export const demoCustomers = [
  {
    _id: "customer-1",
    id: "customer-1",
    customerId: "customer-1",
    businessName: "Demo Store A",
    customerIdentifier: "CUST-001",
    phoneNo: "+2348012345678",
    email: "store.a@example.com",
    status: "ACTIVE",
    Stores: [
      {
        landmark: "Demo Location 1",
        contactName: "Manager A",
        address: "123 Demo Street, Ibadan",
        lat: 7.3775,
        long: 3.947,
      },
    ],
  },
  {
    _id: "customer-2",
    id: "customer-2",
    customerId: "customer-2",
    businessName: "Demo Store B",
    customerIdentifier: "CUST-002",
    phoneNo: "+2348087654321",
    email: "store.b@example.com",
    status: "ACTIVE",
    Stores: [
      {
        landmark: "Demo Location 2",
        contactName: "Manager B",
        address: "456 Demo Avenue, Lagos",
        lat: 6.6018,
        long: 3.3515,
      },
    ],
  },
];

// Orders
export const demoOrders = [
  {
    _id: "order-1",
    id: "order-1",
    orderId: "ORD-001",
    referenceId: "ORD-001",
    customer: demoCustomers[0],
    customerId: "customer-1",
    warehouseId: "warehouse-1",
    warehouse: { warehouseName: "Main Warehouse" },
    platform: "mobile",
    priority: 1,
    status: "PENDING",
    displayStatus: "Processing",
    statusLabel: "Processing",
    orderTotal: 45000,
    sellerTotal: 42000,
    totalItemQuantity: 5,
    weight: 2.5,
    isPrePaid: false,
    preferredDeliveryDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    agentId: "agent-1",
  },
  {
    _id: "order-2",
    id: "order-2",
    orderId: "ORD-002",
    referenceId: "ORD-002",
    customer: demoCustomers[1],
    customerId: "customer-2",
    warehouseId: "warehouse-1",
    warehouse: { warehouseName: "Main Warehouse" },
    platform: "web",
    priority: 2,
    status: "DELIVERED",
    displayStatus: "Delivered",
    statusLabel: "Delivered",
    orderTotal: 78000,
    sellerTotal: 73500,
    totalItemQuantity: 8,
    weight: 4.2,
    isPrePaid: true,
    preferredDeliveryDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    agentId: "agent-2",
  },
  {
    _id: "order-3",
    id: "order-3",
    orderId: "ORD-003",
    referenceId: "ORD-003",
    customer: demoCustomers[0],
    customerId: "customer-1",
    warehouseId: "warehouse-2",
    warehouse: { warehouseName: "Secondary Warehouse" },
    platform: "mobile",
    priority: 3,
    status: "CANCELLED",
    displayStatus: "Cancelled",
    statusLabel: "Cancelled",
    orderTotal: 32000,
    sellerTotal: 30000,
    totalItemQuantity: 3,
    weight: 1.8,
    isPrePaid: false,
    preferredDeliveryDate: new Date(Date.now() + 172800000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    agentId: "agent-3",
  },
];

// Order details
export const getOrderDetails = (orderId: string) => {
  const order = demoOrders.find(
    (o) => o.orderId === orderId || o._id === orderId,
  );
  return order || demoOrders[0];
};

// Expanded products
export const expandedProducts = [
  {
    _id: "product-1",
    id: "product-1",
    productId: "product-1",
    productName: "Demo Product A",
    displayTitle: "Demo Product A",
    product_SKU: "DEMO-001",
    category: "Groceries",
    subCategory: "Dry Goods",
    vertical: "Food",
    brand: "Demo Brand",
    price: 5000,
    quantity: 100,
    imageUrl: UNSPLASH.product,
    images: [{ imageUrl: UNSPLASH.product }],
    pricing: {
      wholesalePrice: 4500,
      retailPrice: 5000,
      marketPrice: 5500,
    },
    isActive: true,
    description: "High-quality demo product",
    minWholeSaleQty: 10,
    stockValue: 500000,
    variantName: "Standard",
  },
  {
    _id: "product-2",
    id: "product-2",
    productId: "product-2",
    productName: "Demo Product B",
    displayTitle: "Demo Product B",
    product_SKU: "DEMO-002",
    category: "Beverages",
    subCategory: "Soft Drinks",
    vertical: "Drinks",
    brand: "Demo Brand",
    price: 3000,
    quantity: 200,
    imageUrl: UNSPLASH.product,
    images: [{ imageUrl: UNSPLASH.product }],
    pricing: {
      wholesalePrice: 2700,
      retailPrice: 3000,
      marketPrice: 3300,
    },
    isActive: true,
    description: "Refreshing demo beverage",
    minWholeSaleQty: 20,
    stockValue: 600000,
    variantName: "Regular",
  },
  {
    _id: "product-3",
    id: "product-3",
    productId: "product-3",
    productName: "Demo Product C",
    displayTitle: "Demo Product C",
    product_SKU: "DEMO-003",
    category: "Personal Care",
    subCategory: "Health",
    vertical: "Health",
    brand: "Demo Brand",
    price: 2500,
    quantity: 150,
    imageUrl: UNSPLASH.product,
    images: [{ imageUrl: UNSPLASH.product }],
    pricing: {
      wholesalePrice: 2200,
      retailPrice: 2500,
      marketPrice: 2800,
    },
    isActive: true,
    description: "Essential demo product",
    minWholeSaleQty: 15,
    stockValue: 375000,
    variantName: "Premium",
  },
];
