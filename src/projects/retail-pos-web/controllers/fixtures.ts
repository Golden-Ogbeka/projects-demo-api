import { PageInfo } from "../../saas-platform-admin-web/types/index.js";

// ─── Shared helpers ──────────────────────────────────────────────────────────

export const pageInfo = (items: unknown[], page = 1, size = 10): PageInfo => ({
  totalItems: items.length,
  totalCount: items.length,
  currentPage: page,
  page,
  size,
  hasNextPage: false,
  hasPreviousPage: false,
});

export const paginated = (items: unknown[], page = 1, size = 10) => ({
  nodes: items,
  data: items,
  items,
  total: items.length,
  count: items.length,
  pageInfo: pageInfo(items, page, size),
});

// ─── Demo JWT ────────────────────────────────────────────────────────────────
// The app decodes the Firebase ID token to read user fields.
// We produce a base64url JWT with the expected payload shape.
export const createDemoFirebaseToken = () => {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: "demo-firebase-uid",
      uid: "demo-firebase-uid",
      userId: "user-demo-1",
      customerId: "customer-demo-1",
      businessId: "business-demo-1",
      firstName: "Demo",
      lastName: "Owner",
      email: "demo@demo.com",
      phoneNumber: "08012345678",
      businessRegistered: true,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      iat: Math.floor(Date.now() / 1000),
    }),
  ).toString("base64url");
  return `${header}.${payload}.demo-signature`;
};

// ─── Core entities ───────────────────────────────────────────────────────────

export const demoBusiness = {
  _id: "business-demo-1",
  businessId: "business-demo-1",
  businessName: "Demo Retail Store",
  businessEmail: "demo@demo.com",
  businessPhoneNumber: "08012345678",
  businessAddress: "12 Demo Market Road, Ibadan",
  businessEmblem: "https://images.unsplash.com/photo-1556742049-0cfed4f06a45?w=200",
  businessPlan: "ESSENTIAL",
  isSubscribed: true,
  CACNumber: "RC-DEMO-001",
  isCacValid: "SUCCESS",
  isBvnValid: "SUCCESS",
  isNINValid: "SUCCESS",
  utilityBill: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
  stateId: "state-1",
  cityId: "city-1",
  stateName: "Oyo",
  cityName: "Ibadan",
  businessSectorId: "sector-1",
  subscriptionDetails: {
    freeTrial: false,
    nextPaymentDate: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(),
    nextBusinessPlan: "ESSENTIAL",
  },
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const demoUser = {
  _id: "user-demo-1",
  userId: "user-demo-1",
  customerId: "customer-demo-1",
  businessId: "business-demo-1",
  firstName: "Demo",
  lastName: "Owner",
  email: "demo@demo.com",
  phoneNumber: "08012345678",
  roleId: "role-admin-1",
  businessRegistered: true,
  accountNumber: "0123456789",
  accountName: "Demo Retail Store",
  balance: "125000.00",
  bank: "Demo Bank",
  isKycCompleted: true,
  isPinSet: true,
  profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  kycStatus: "COMPLETED",
  isEmailVerified: true,
  kycDetail: {
    bvn: "12345678901",
    firstName: "Demo",
    lastName: "Owner",
    middleName: "Business",
    gender: "Male",
    phone: "08012345678",
    dateOfBirth: "1990-01-01",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  },
  cardDetails: {
    first_6digits: "408408",
    last_4digits: "4081",
    issuer: "VISA",
    country: "NG",
    type: "debit",
    expiry: "12/28",
  },
  business: demoBusiness,
  createdAt: "2026-01-01T00:00:00.000Z",
};

export const demoCategories = [
  { _id: "cat-1", name: "Food & Beverages", createdAt: "2026-01-01T00:00:00.000Z" },
  { _id: "cat-2", name: "Electronics", createdAt: "2026-01-01T00:00:00.000Z" },
  { _id: "cat-3", name: "Household", createdAt: "2026-01-01T00:00:00.000Z" },
  { _id: "cat-4", name: "Clothing", createdAt: "2026-01-01T00:00:00.000Z" },
];

export const demoProducts = [
  {
    _id: "prod-1",
    productName: "Golden Penny Noodles 70g",
    totalStock: 240,
    totalStockValue: 768000,
    sellingPrice: 3200,
    productImage: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
    referenceId: "PRD-001",
    thresholdLowStock: 20,
    category: { _id: "cat-1", name: "Food & Beverages" },
    batches: [{ purchasePrice: 2800 }],
    businessId: "business-demo-1",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    _id: "prod-2",
    productName: "Demo Cooking Oil 5L",
    totalStock: 120,
    totalStockValue: 1020000,
    sellingPrice: 8500,
    productImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
    referenceId: "PRD-002",
    thresholdLowStock: 10,
    category: { _id: "cat-1", name: "Food & Beverages" },
    batches: [{ purchasePrice: 7500 }],
    businessId: "business-demo-1",
    createdAt: "2026-01-20T00:00:00.000Z",
  },
  {
    _id: "prod-3",
    productName: "Demo Rice 5kg",
    totalStock: 80,
    totalStockValue: 1200000,
    sellingPrice: 15000,
    productImage: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
    referenceId: "PRD-003",
    thresholdLowStock: 5,
    category: { _id: "cat-1", name: "Food & Beverages" },
    batches: [{ purchasePrice: 13000 }],
    businessId: "business-demo-1",
    createdAt: "2026-02-01T00:00:00.000Z",
  },
];

export const demoServices = [
  {
    _id: "svc-1",
    serviceName: "Delivery Service",
    sellingPrice: 1500,
    serviceImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400",
    referenceId: "SVC-001",
    description: "Same-day delivery within the city",
    businessId: "business-demo-1",
    category: { _id: "cat-3", name: "Household" },
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    _id: "svc-2",
    serviceName: "Installation Service",
    sellingPrice: 5000,
    serviceImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400",
    referenceId: "SVC-002",
    description: "Professional installation for electronics",
    businessId: "business-demo-1",
    category: { _id: "cat-2", name: "Electronics" },
    createdAt: "2026-01-12T00:00:00.000Z",
  },
];

export const demoCustomers = [
  {
    _id: "cust-1",
    customerName: "Mama Titi Store",
    email: "titi@example.com",
    phoneNumber: "08090001111",
    status: "ACTIVE",
    customerStatus: "ACTIVE",
    amountSpent: 125000,
    totalDebt: 0,
    referenceId: "CUST-001",
    businessId: "business-demo-1",
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  {
    _id: "cust-2",
    customerName: "Lagos Retail Hub",
    email: "retail@example.com",
    phoneNumber: "08090002222",
    status: "ACTIVE",
    customerStatus: "ACTIVE",
    amountSpent: 89000,
    totalDebt: 15000,
    referenceId: "CUST-002",
    businessId: "business-demo-1",
    createdAt: "2026-02-10T00:00:00.000Z",
  },
  {
    _id: "cust-3",
    customerName: "University Kiosk",
    email: "kiosk@example.com",
    phoneNumber: "08090003333",
    status: "ACTIVE",
    customerStatus: "ACTIVE",
    amountSpent: 42000,
    totalDebt: 8000,
    referenceId: "CUST-003",
    businessId: "business-demo-1",
    createdAt: "2026-03-05T00:00:00.000Z",
  },
];

export const demoSales = [
  {
    _id: "sale-1",
    saleDate: "2026-05-20T09:30:00.000Z",
    businessCustomerId: "cust-1",
    clientName: "Mama Titi Store",
    totalItems: 3,
    totalSale: 25600,
    referenceId: "SALE-001",
    salePayments: [{ _id: "pay-1", saleId: "sale-1", paymentType: "CASH", paidAmount: 25600, createdAt: "2026-05-20T09:30:00.000Z", customerId: "cust-1" }],
    saleItems: [
      { _id: "si-1", customerProductId: "prod-1", customerProductName: "Golden Penny Noodles 70g", customerServiceName: null, quantity: 5, sellingPrice: "3200", customerProduct: { _id: "prod-1", productImage: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400", productName: "Golden Penny Noodles 70g" } },
      { _id: "si-2", customerProductId: "prod-2", customerProductName: "Demo Cooking Oil 5L", customerServiceName: null, quantity: 1, sellingPrice: "8500", customerProduct: { _id: "prod-2", productImage: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400", productName: "Demo Cooking Oil 5L" } },
    ],
    createdAt: "2026-05-20T09:30:00.000Z",
  },
  {
    _id: "sale-2",
    saleDate: "2026-05-19T14:00:00.000Z",
    businessCustomerId: "cust-2",
    clientName: "Lagos Retail Hub",
    totalItems: 2,
    totalSale: 30000,
    referenceId: "SALE-002",
    salePayments: [{ _id: "pay-2", saleId: "sale-2", paymentType: "BANK", paidAmount: 30000, createdAt: "2026-05-19T14:00:00.000Z", customerId: "cust-2" }],
    saleItems: [
      { _id: "si-3", customerProductId: "prod-3", customerProductName: "Demo Rice 5kg", customerServiceName: null, quantity: 2, sellingPrice: "15000", customerProduct: { _id: "prod-3", productImage: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400", productName: "Demo Rice 5kg" } },
    ],
    createdAt: "2026-05-19T14:00:00.000Z",
  },
];

export const demoExpenses = [
  {
    _id: "exp-1",
    amount: 12000,
    title: "Store Rent",
    category: { name: "Rent" },
    categoryId: "expcat-1",
    paymentType: "BANK",
    createdAt: "2026-05-01T00:00:00.000Z",
    createdBy: "user-demo-1",
  },
  {
    _id: "exp-2",
    amount: 5500,
    title: "Electricity Bill",
    category: { name: "Utilities" },
    categoryId: "expcat-2",
    paymentType: "CASH",
    createdAt: "2026-05-05T00:00:00.000Z",
    createdBy: "user-demo-1",
  },
  {
    _id: "exp-3",
    amount: 8000,
    title: "Staff Salary",
    category: { name: "Salaries" },
    categoryId: "expcat-3",
    paymentType: "BANK",
    createdAt: "2026-05-10T00:00:00.000Z",
    createdBy: "user-demo-1",
  },
];

export const demoInvoices = [
  {
    _id: "inv-1",
    businessCustomerId: "cust-1",
    businessPaymentId: "bizpay-1",
    clientName: "Mama Titi Store",
    invoiceStatus: "PAID",
    invoiceTotal: "45000",
    invoiceNumber: "INV-001",
    amountDue: 0,
    transactionType: "INVOICE",
    invoicePayments: [{ amountPaid: 45000 }],
    createdAt: "2026-05-15T00:00:00.000Z",
  },
  {
    _id: "inv-2",
    businessCustomerId: "cust-2",
    businessPaymentId: "bizpay-2",
    clientName: "Lagos Retail Hub",
    invoiceStatus: "PENDING",
    invoiceTotal: "32000",
    invoiceNumber: "INV-002",
    amountDue: 32000,
    transactionType: "INVOICE",
    invoicePayments: [],
    createdAt: "2026-05-18T00:00:00.000Z",
  },
  {
    _id: "inv-3",
    businessCustomerId: "cust-3",
    businessPaymentId: "bizpay-3",
    clientName: "University Kiosk",
    invoiceStatus: "PARTIAL",
    invoiceTotal: "18000",
    invoiceNumber: "INV-003",
    amountDue: 8000,
    transactionType: "INVOICE",
    invoicePayments: [{ amountPaid: 10000 }],
    createdAt: "2026-05-20T00:00:00.000Z",
  },
];

export const demoStaff = [
  {
    _id: "staff-1",
    roleId: "role-cashier-1",
    customerId: "cust-staff-1",
    phoneNumber: "08011111111",
    firstName: "Ada",
    lastName: "Cashier",
    email: "ada@retailpos.com",
    staffStatus: "ACTIVE",
    businessId: "business-demo-1",
    business: { _id: "business-demo-1", businessName: "Demo Retail Store" },
    businessRegistered: true,
    userType: "STAFF",
    status: "ACTIVE",
    assignedOutlet: [],
    employeeId: "EMP-001",
    staffActivities: [],
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    updatedBy: "user-demo-1",
    createdBy: "user-demo-1",
    staffActivityId: "activity-1",
    profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    role: { _id: "role-cashier-1", roleName: "Cashier", status: "ACTIVE" },
  },
  {
    _id: "staff-2",
    roleId: "role-manager-1",
    customerId: "cust-staff-2",
    phoneNumber: "08022222222",
    firstName: "Chidi",
    lastName: "Manager",
    email: "chidi@retailpos.com",
    staffStatus: "ACTIVE",
    businessId: "business-demo-1",
    business: { _id: "business-demo-1", businessName: "Demo Retail Store" },
    businessRegistered: true,
    userType: "STAFF",
    status: "ACTIVE",
    assignedOutlet: [],
    employeeId: "EMP-002",
    staffActivities: [],
    createdAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    updatedBy: "user-demo-1",
    createdBy: "user-demo-1",
    staffActivityId: "activity-2",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    role: { _id: "role-manager-1", roleName: "Manager", status: "ACTIVE" },
  },
];

export const demoRoles = [
  {
    _id: "role-admin-1",
    roleName: "Admin",
    permissions: [
      { _id: "perm-1", permission: "VIEW_SALES", status: "ACTIVE", module: "SALES" },
      { _id: "perm-2", permission: "CREATE_SALES", status: "ACTIVE", module: "SALES" },
      { _id: "perm-3", permission: "VIEW_INVENTORY", status: "ACTIVE", module: "INVENTORY" },
      { _id: "perm-4", permission: "MANAGE_STAFF", status: "ACTIVE", module: "STAFF" },
    ],
    usersAssociated: 1,
  },
  {
    _id: "role-cashier-1",
    roleName: "Cashier",
    permissions: [
      { _id: "perm-5", permission: "VIEW_SALES", status: "ACTIVE", module: "SALES" },
      { _id: "perm-6", permission: "CREATE_SALES", status: "ACTIVE", module: "SALES" },
    ],
    usersAssociated: 1,
  },
  {
    _id: "role-manager-1",
    roleName: "Manager",
    permissions: [
      { _id: "perm-7", permission: "VIEW_SALES", status: "ACTIVE", module: "SALES" },
      { _id: "perm-8", permission: "VIEW_INVENTORY", status: "ACTIVE", module: "INVENTORY" },
      { _id: "perm-9", permission: "MANAGE_STAFF", status: "ACTIVE", module: "STAFF" },
    ],
    usersAssociated: 1,
  },
];

export const demoBusinessPlans = [
  { _id: "plan-1", name: "Basic", price: "0", summary: "Free forever", codeName: "BASIC" },
  { _id: "plan-2", name: "Essential", price: "5000", summary: "For growing businesses", codeName: "ESSENTIAL" },
  { _id: "plan-3", name: "Premium", price: "15000", summary: "For established businesses", codeName: "PREMIUM" },
  { _id: "plan-4", name: "Enterprise", price: "30000", summary: "For large enterprises", codeName: "ENTERPRISE" },
];

export const demoBusinessSectors = [
  { _id: "sector-1", sectorName: "Retail", createdAt: "2026-01-01T00:00:00.000Z" },
  { _id: "sector-2", sectorName: "Food & Beverage", createdAt: "2026-01-01T00:00:00.000Z" },
  { _id: "sector-3", sectorName: "Fashion", createdAt: "2026-01-01T00:00:00.000Z" },
  { _id: "sector-4", sectorName: "Electronics", createdAt: "2026-01-01T00:00:00.000Z" },
  { _id: "sector-5", sectorName: "Health & Beauty", createdAt: "2026-01-01T00:00:00.000Z" },
];

export const demoTerminals = [
  {
    _id: "terminal-1",
    userId: "user-demo-1",
    terminalId: "TID-001",
    status: "ACTIVE",
    terminalName: "Main Counter POS",
    tid: "12345678",
    createdAt: "2026-03-01T00:00:00.000Z",
    isActive: true,
    terminalChargeBy: "TRANSACTION",
    spec: { _id: "spec-1", name: "Moniepoint POS", price: "25000" },
  },
];

export const demoNotifications = [
  {
    _id: "notif-1",
    title: "New Sale Recorded",
    body: "A sale of ₦25,600 was recorded for Mama Titi Store",
    isSeen: false,
    status: "UNREAD",
    extraData: { type: "SALE", refId: "sale-1" },
    createdAt: "2026-05-20T09:30:00.000Z",
  },
  {
    _id: "notif-2",
    title: "Low Stock Alert",
    body: "Demo Rice 5kg is running low (80 units remaining)",
    isSeen: true,
    status: "READ",
    extraData: { type: "INVENTORY", refId: "prod-3" },
    createdAt: "2026-05-19T08:00:00.000Z",
  },
];

export const demoTransactions = [
  {
    id: "txn-1",
    reference: "TXN-REF-001",
    amount: "25600",
    createdAt: new Date("2026-05-20T09:30:00.000Z"),
    summary: "Sale payment received",
    type: "CREDIT",
    narration: "Payment for SALE-001",
    status: "SUCCESSFUL",
    category: { name: "Sales" },
    product: { displayName: "Mixed Products" },
    metadata: [{ label: "Reference", value: "SALE-001" }],
  },
  {
    id: "txn-2",
    reference: "TXN-REF-002",
    amount: "12000",
    createdAt: new Date("2026-05-01T00:00:00.000Z"),
    summary: "Store rent payment",
    type: "DEBIT",
    narration: "Monthly rent",
    status: "SUCCESSFUL",
    category: { name: "Expenses" },
    product: { displayName: "Rent" },
    metadata: [{ label: "Reference", value: "EXP-001" }],
  },
];

export const demoPaymentBanks = [
  { bankName: "Demo Bank", bankCode: "001", logo: null },
  { bankName: "First Demo Bank", bankCode: "002", logo: null },
  { bankName: "United Demo Bank", bankCode: "003", logo: null },
];

export const demoAirtimeProviders = [
  { id: "mtn", name: "MTN", logo: null },
  { id: "airtel", name: "Airtel", logo: null },
  { id: "glo", name: "Glo", logo: null },
  { id: "9mobile", name: "9Mobile", logo: null },
];

export const demoDiscos = [
  { id: "ekedc", name: "Eko Electric (EKEDC)", logo: null },
  { id: "ikedc", name: "Ikeja Electric (IKEDC)", logo: null },
  { id: "ibedc", name: "Ibadan Electric (IBEDC)", logo: null },
];

export const demoCableProviders = [
  { id: "dstv", name: "DSTV", logo: null },
  { id: "gotv", name: "GOtv", logo: null },
  { id: "startimes", name: "StarTimes", logo: null },
];

export const demoStatesAndCities = [
  {
    _id: "state-1",
    stateName: "Oyo",
    cities: [
      { _id: "city-1", cityName: "Ibadan" },
      { _id: "city-2", cityName: "Ogbomoso" },
    ],
  },
  {
    _id: "state-2",
    stateName: "Lagos",
    cities: [
      { _id: "city-3", cityName: "Lagos Island" },
      { _id: "city-4", cityName: "Ikeja" },
    ],
  },
];

export const demoAppConfig = {
  transactionFee: {
    transactionFeeAmount: 50,
    transactionFeeType: "FLAT",
    transactionFeeCap: 200,
  },
  importInventoryTemplate: "https://example.com/demo-inventory-template.xlsx",
  pinLength: 4,
};

export const demoAccountDetail = {
  accountNumber: "0123456789",
  accountName: "Demo Retail Store",
  balance: 125000,
  bank: "Demo Bank",
  currency: "NGN",
};

export const demoReferralSummary = {
  totalActiveReferrals: 5,
  totalInactiveReferrals: 2,
  totalActiveTerminals: 1,
  totalInactiveTerminals: 0,
  totalReferrals: 7,
  totalTerminals: 1,
};

export const demoImportedFiles = [
  {
    _id: "import-1",
    fileName: "inventory-import-may.xlsx",
    status: "COMPLETED",
    totalRecords: 50,
    successRecords: 48,
    failedRecords: 2,
    createdAt: "2026-05-10T00:00:00.000Z",
  },
];

export const demoAlerzoProducts = [
  {
    _id: "alerzo-prod-1",
    productName: "Indomie Noodles 70g (Carton)",
    price: 3200,
    category: "Food",
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
  },
  {
    _id: "alerzo-prod-2",
    productName: "Sunlight Soap 200g",
    price: 1500,
    category: "Household",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  },
];
