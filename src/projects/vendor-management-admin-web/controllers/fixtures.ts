import { PageInfo } from "../types/index.js";

const UNSPLASH = {
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  warehouse: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600",
  product: "https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=400",
  banner: "https://images.unsplash.com/photo-1556742049-0cfed4f06a45?w=1200",
};

export const createDemoJwt = () => {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" }))
    .toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: "user-1",
      userId: "user-1",
      name: "Demo Admin",
      status: "success",
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
  email: "demo.admin@example.com",
  phoneNo: "+2348012345678",
  status: "ACTIVE",
  isActive: true,
  imageUrl: UNSPLASH.avatar,
  warehouseId: "warehouse-1",
  createdAt: "2026-05-21T10:00:00.000Z",
};

export const demoUsers = [
  demoUser,
  {
    ...demoUser,
    _id: "user-2",
    userId: "user-2",
    fullName: "Ada Operations",
    userName: "ada.ops",
    email: "ada.ops@example.com",
  },
  {
    ...demoUser,
    _id: "user-3",
    userId: "user-3",
    fullName: "Chidi Warehouse",
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
