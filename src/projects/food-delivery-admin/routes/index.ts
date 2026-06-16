import { Router } from "express";
import { Response } from "express";
import { FoodDeliveryAdminController } from "../controllers/index.js";

const respond = (res: Response, message: string, data?: unknown, results?: number | null) =>
  res.json({ status: "success", message, results: results ?? (Array.isArray(data) ? data.length : null), data: data ?? null });

const respondError = (res: Response, status: number, message: string) =>
  res.status(status).json({ status: "error", message, data: null });

const respondCatch = (res: Response, error: unknown) =>
  res.status(500).json({ status: "error", message: error instanceof Error ? error.message : "An error occurred", data: null });

const FoodDeliveryAdminRouter = Router();
const Ctrl = FoodDeliveryAdminController();

// ---- shared demo data for inline routes ----
const demoAdmins = [
  { id: 1, name: "Demo Admin", email: "demo@example.com", role: "super_admin" },
];
const demoUsers = [
  { id: 1, name: "Demo Admin", email: "demo@example.com", role: "super_admin" },
  { id: 2, name: "John Doe", email: "chidi@example.com", role: "admin" },
  { id: 3, name: "Alice Johnson", email: "bola@example.com", role: "manager" },
  { id: 4, name: "Grace Williams", email: "fatima@example.com", role: "support" },
  { id: 5, name: "Charlie Brown", email: "emeka@example.com", role: "rider_manager" },
];
const demoRestaurants = [
  { id: 1, name: "Demo Chicken Spot", email: "info@example.com", phone: "+2348010001000", address: "12 Adeniyi Jones, Ikeja, Lagos", status: "active", rating: 4.5, zoneId: 1, zoneName: "Ikeja" },
  { id: 2, name: "Demo Grill House", email: "info@example.com", phone: "+2348010002000", address: "7 Ahmadu Bello Way, VI, Lagos", status: "active", rating: 4.7, zoneId: 2, zoneName: "Victoria Island" },
  { id: 3, name: "Demo Place Eatery", email: "hello@example.com", phone: "+2348010003000", address: "42 Ring Road, Ibadan", status: "active", rating: 4.3, zoneId: 3, zoneName: "Ibadan North" },
  { id: 4, name: "Demo Sweets", email: "info@example.com", phone: "+2348010004000", address: "15 Wuse Zone 4, Abuja", status: "active", rating: 4.1, zoneId: 4, zoneName: "Garki" },
  { id: 5, name: "Shawarma Spot NG", email: "orders@example.com", phone: "+2348010005000", address: "88 Azikiwe Road, PH City", status: "inactive", rating: 4.0, zoneId: 5, zoneName: "Port Harcourt City" },
  { id: 6, name: "Demo Kitchen", email: "mamaput@example.com", phone: "+2348010006000", address: "3 Market Road, Ibadan", status: "active", rating: 4.8, zoneId: 3, zoneName: "Ibadan North" },
];
const demoVendors = [
  { id: 1, name: "Fresh Foods Supply Ltd", email: "fresh@example.com", phone: "+2348020001000", address: "22 Industrial Estate, Ikeja", status: "active", productCount: 45, rating: 4.6 },
  { id: 2, name: "Prime Produce Nigeria", email: "prime@example.com", phone: "+2348020002000", address: "9 Trade Fair Complex, Lagos", status: "active", productCount: 32, rating: 4.4 },
  { id: 3, name: "Farm to Table Services", email: "farm@example.com", phone: "+2348020003000", address: "55 Agriculture Road, Ibadan", status: "active", productCount: 28, rating: 4.7 },
  { id: 4, name: "Global Food Distributors", email: "global@example.com", phone: "+2348020004000", address: "10 Warehouse Road, Abuja", status: "inactive", productCount: 18, rating: 4.2 },
];
const demoProducts = [
  { id: 1, name: "Jollof Rice & Chicken", restaurantId: 1, restaurantName: "Demo Chicken Spot", price: 3500, category: "Main Meals", status: "active", stock: 50 },
  { id: 2, name: "Fried Rice & Turkey", restaurantId: 1, restaurantName: "Demo Chicken Spot", price: 4000, category: "Main Meals", status: "active", stock: 40 },
  { id: 3, name: "Pepperoni Pizza Large", restaurantId: 2, restaurantName: "Demo Grill House", price: 6500, category: "Pizza", status: "active", stock: 25 },
  { id: 4, name: "Chicken Shawarma Wrap", restaurantId: 5, restaurantName: "Shawarma Spot NG", price: 2800, category: "Fast Food", status: "active", stock: 35 },
  { id: 5, name: "Pounded Yam & Egusi Soup", restaurantId: 6, restaurantName: "Demo Kitchen", price: 3200, category: "Local Dishes", status: "active", stock: 30 },
  { id: 6, name: "Banga Rice & Catfish", restaurantId: 6, restaurantName: "Demo Kitchen", price: 3500, category: "Local Dishes", status: "active", stock: 20 },
  { id: 7, name: "Grilled Chicken Half", restaurantId: 3, restaurantName: "Demo Place Eatery", price: 5500, category: "Grills", status: "active", stock: 15 },
  { id: 8, name: "Chicken Burger Meal", restaurantId: 4, restaurantName: "Demo Sweets", price: 3800, category: "Fast Food", status: "active", stock: 28 },
  { id: 9, name: "Pepper Soup (Catfish)", restaurantId: 3, restaurantName: "Demo Place Eatery", price: 4500, category: "Soups", status: "active", stock: 18 },
  { id: 10, name: "Suya Platter", restaurantId: 5, restaurantName: "Shawarma Spot NG", price: 5000, category: "Grills", status: "active", stock: 12 },
];
const demoOrders = [
  { id: 1, orderNumber: "ORD-1001", customerName: "Frank Miller", customerPhone: "+2348030001001", restaurantId: 1, restaurantName: "Demo Chicken Spot", totalAmount: 7500, deliveryFee: 500, status: "delivered", paymentStatus: "paid", zone: "Ikeja", riderId: 1, riderName: "John Rider", createdAt: "2026-06-01T10:30:00.000Z", items: [{ productId: 1, productName: "Jollof Rice & Chicken", qty: 1, price: 3500 }, { productId: 2, productName: "Fried Rice & Turkey", qty: 1, price: 4000 }] },
  { id: 2, orderNumber: "ORD-1002", customerName: "Helen Davis", customerPhone: "+2348030002002", restaurantId: 2, restaurantName: "Demo Grill House", totalAmount: 6500, deliveryFee: 800, status: "preparing", paymentStatus: "paid", zone: "Victoria Island", riderId: null, riderName: null, createdAt: "2026-06-02T12:15:00.000Z", items: [{ productId: 3, productName: "Pepperoni Pizza Large", qty: 1, price: 6500 }] },
  { id: 3, orderNumber: "ORD-1003", customerName: "Ivy Moore", customerPhone: "+2348030003003", restaurantId: 6, restaurantName: "Demo Kitchen", totalAmount: 6700, deliveryFee: 400, status: "pending", paymentStatus: "unpaid", zone: "Ibadan North", riderId: null, riderName: null, createdAt: "2026-06-02T14:00:00.000Z", items: [{ productId: 5, productName: "Pounded Yam & Egusi Soup", qty: 1, price: 3200 }, { productId: 6, productName: "Banga Rice & Catfish", qty: 1, price: 3500 }] },
  { id: 4, orderNumber: "ORD-1004", customerName: "Jack Taylor", customerPhone: "+2348030004004", restaurantId: 5, restaurantName: "Shawarma Spot NG", totalAmount: 2800, deliveryFee: 550, status: "assigned", paymentStatus: "paid", zone: "Port Harcourt City", riderId: 2, riderName: "Bob Courier", createdAt: "2026-06-02T09:45:00.000Z", items: [{ productId: 4, productName: "Chicken Shawarma Wrap", qty: 1, price: 2800 }] },
  { id: 5, orderNumber: "ORD-1005", customerName: "Karen Anderson", customerPhone: "+2348030005005", restaurantId: 3, restaurantName: "Demo Place Eatery", totalAmount: 10000, deliveryFee: 400, status: "delivered", paymentStatus: "paid", zone: "Ibadan North", riderId: 3, riderName: "Alice Driver", createdAt: "2026-06-01T18:00:00.000Z", items: [{ productId: 7, productName: "Grilled Chicken Half", qty: 1, price: 5500 }, { productId: 9, productName: "Pepper Soup (Catfish)", qty: 1, price: 4500 }] },
  { id: 6, orderNumber: "ORD-1006", customerName: "Laura Thomas", customerPhone: "+2348030006006", restaurantId: 4, restaurantName: "Demo Sweets", totalAmount: 3800, deliveryFee: 600, status: "cancelled", paymentStatus: "refunded", zone: "Garki", riderId: null, riderName: null, createdAt: "2026-05-31T16:20:00.000Z", items: [{ productId: 8, productName: "Chicken Burger Meal", qty: 1, price: 3800 }] },
];
const demoNotifications = [
  { id: 1, title: "New Order #ORD-1004", message: "A new order has been placed", type: "order", audience: "all", status: "unread", createdAt: "2026-06-02T09:45:00.000Z" },
  { id: 2, title: "Vendor Approval Pending", message: "New vendor registration requires approval", type: "vendor", audience: "admin", status: "unread", createdAt: "2026-06-01T14:30:00.000Z" },
  { id: 3, title: "Rider Available", message: "Rider Segun Adewale is now online", type: "rider", audience: "all", status: "read", createdAt: "2026-05-31T08:00:00.000Z" },
];
const demoFeedbacks = [
  { id: 1, name: "John Doe", email: "john@example.com", message: "Great service!", rating: 5, createdAt: "2026-06-01T10:00:00.000Z" },
];
const demoTickets = [
  { id: 1, subject: "Login issue", status: "open", priority: "high", createdAt: "2026-06-01T10:00:00.000Z" },
];
const demoTicketResponses = [
  { id: 1, ticketId: 1, message: "We are looking into this", adminId: 1, createdAt: "2026-06-01T12:00:00.000Z" },
];
const demoBanks = [
  { id: 1, name: "Access Bank", code: "044", status: "active" },
  { id: 2, name: "GTBank", code: "058", status: "active" },
  { id: 3, name: "First Bank", code: "011", status: "active" },
];
const demoCompanies = [
  { id: 1, name: "Cravings NG", email: "info@example.com", phone: "+2349000000000", address: "Lagos, Nigeria", status: "active" },
];
const demoTransactions = [
  { id: 1, reference: "TXN-001", amount: 7500, status: "completed", createdAt: "2026-06-01T10:35:00.000Z" },
  { id: 2, reference: "TXN-002", amount: 6500, status: "completed", createdAt: "2026-06-02T12:20:00.000Z" },
  { id: 3, reference: "TXN-003", amount: 50000, status: "pending", createdAt: "2026-06-02T09:00:00.000Z" },
];
const demoMarketers = [
  { id: 1, name: "Maria Jackson", email: "chioma@example.com", phone: "+2348100001001", status: "active", commission: 5000, referrals: 12 },
  { id: 2, name: "Nathan White", email: "segun@example.com", phone: "+2348100002002", status: "active", commission: 3200, referrals: 8 },
];
const demoWaitingList = [
  { id: 1, name: "Olivia Harris", email: "grace@example.com", phone: "+2348110001001", status: "pending", createdAt: "2026-06-01T10:00:00.000Z" },
];
const demoGeneralData = [
  { id: 1, key: "app_version", value: "1.2.0", type: "string" },
  { id: 2, key: "maintenance_mode", value: "false", type: "boolean" },
];
const demoLogistics = [
  { id: 1, name: "Fast Ship Logistics", email: "info@example.com", phone: "+2348120001001", status: "active", zones: "Lagos, Ibadan" },
];
const demoLogisticsApplications = [
  { id: 1, companyName: "Quick Delivery Co", email: "apply@example.com", status: "pending", createdAt: "2026-06-01T10:00:00.000Z" },
];
const demoVendorApplications = [
  { id: 1, companyName: "Farm Fresh Produce", email: "vendor@example.com", status: "pending", createdAt: "2026-06-01T10:00:00.000Z" },
];
const demoFoodCategories = [
  { id: 1, name: "Nigerian", status: "active", priority: 1 },
  { id: 2, name: "Italian", status: "active", priority: 2 },
];
const demoRestaurantCategories = [
  { id: 1, name: "Fast Food", status: "active" },
  { id: 2, name: "Fine Dining", status: "active" },
];
const demoMealMeasurements = [
  { id: 1, name: "Regular", unit: "portion", status: "active" },
  { id: 2, name: "Large", unit: "portion", status: "active" },
];
const demoPermissions = ["manage_users", "manage_restaurants", "manage_orders", "manage_vendors"];

// ---- helpers ----
const ok = (_req: any, res: any) => respond(res, "Success");
const okData = (data: any) => (_req: any, res: any) => respond(res, "Success", data);

const wrap = (handler: (req: any, res: any) => any) => async (req: any, res: any) => {
  try {
    await handler(req, res);
  } catch (error) {
    return respondCatch(res, error);
  }
};

const demoList = (items: any[]) => (_req: any, res: any) => {
  const mapped = items.map((item: any) => ({ _id: String(item.id), ...item, fullname: item.name }));
  return respond(res, `${items.length} items`, mapped);
};

const getByParamId = (items: any[]) => (req: any, res: any) => {
  const item = items.find((x: any) => x.id === parseInt(String(req.params.id)));
  if (!item) return respondError(res, 404, "Not found");
  return respond(res, "Retrieved", { _id: String(item.id), ...item, fullname: item.name });
};

const patchByParamId = (items: any[]) => (req: any, res: any) => {
  const existing = items.find((x: any) => x.id === parseInt(String(req.params.id)));
  if (!existing) return respondError(res, 404, "Not found");
  const updated = { ...existing, ...(req.body || {}) };
  return respond(res, "Updated", { _id: String(existing.id), ...updated, fullname: updated.name });
};

const patchByBodyId = (items: any[]) => (req: any, res: any) => {
  const existing = items.find((x: any) => x.id === parseInt(String(req.body?.id)));
  if (!existing) return respondError(res, 404, "Not found");
  const updated = { ...existing, ...(req.body || {}) };
  return respond(res, "Updated", { _id: String(existing.id), ...updated, fullname: updated.name });
};

const toggleActiveStatus = (items: any[]) => (req: any, res: any) => {
  const existing = items.find((x: any) => x.id === parseInt(String(req.body?.id)));
  if (!existing) return respondError(res, 404, "Not found");
  const updated = { ...existing, status: req.body?.status || "active" };
  return respond(res, "Status updated", { _id: String(existing.id), ...updated, fullname: updated.name });
};

const approveSingle = (items: any[], label: string) => (req: any, res: any) => {
  const id = parseInt(String(req.body?.id));
  const item = items.find((x: any) => x.id === id);
  if (!item) return respondError(res, 404, `${label} not found`);
  const updated = { ...item, status: "active" };
  return respond(res, `${label} approved`, { _id: String(item.id), ...updated, fullname: updated.name });
};

// ---- root health ----
FoodDeliveryAdminRouter.get("/", (_req, res) => {
  res.json({ status: "success", message: "food-delivery-admin dummy backend" });
});

// ==================== AUTH ====================
FoodDeliveryAdminRouter.post("/admin/v1/login", Ctrl.Login);
FoodDeliveryAdminRouter.post("/admin/v1/register", wrap(okData({ token: "demo-token", user: { _id: "1", id: 1, fullname: "Demo Admin", name: "Demo Admin", email: "admin@example.com" } })));
FoodDeliveryAdminRouter.post("/admin/v1/forgot-password", wrap(okData({ emailSent: true })));
FoodDeliveryAdminRouter.patch("/admin/v1/reset-password", wrap(ok));
FoodDeliveryAdminRouter.get("/admin/v1/send-verification", wrap(okData({ emailSent: true })));
FoodDeliveryAdminRouter.post("/admin/v1/verify", wrap(okData({ verified: true })));
FoodDeliveryAdminRouter.get("/admin/v1/logout", Ctrl.Logout);
FoodDeliveryAdminRouter.get("/admin/v1/me", Ctrl.GetMe);
FoodDeliveryAdminRouter.patch("/admin/v1/update-self", Ctrl.UpdateAdminProfile);
FoodDeliveryAdminRouter.patch("/admin/v1/update-password", Ctrl.UpdateAdminPassword);
FoodDeliveryAdminRouter.patch("/admin/v1/update-email", wrap(okData({ email: "admin@example.com" })));
FoodDeliveryAdminRouter.patch("/admin/v1/profile-image", wrap(okData({ image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" })));

// ==================== DASHBOARD ====================
FoodDeliveryAdminRouter.get("/admin/v1/stat", Ctrl.GetStat);

// ==================== LIST (POST /all/{resource}) ====================
const listAllRoutes: Record<string, (req: any, res: any) => Promise<any>> = {
  admin: wrap(demoList(demoAdmins)),
  user: Ctrl.ListUsers,
  restaurant: Ctrl.ListRestaurants,
  vendor: Ctrl.ListVendors,
  product: Ctrl.ListProducts,
  coupon: Ctrl.ListCoupons,
  promotion: Ctrl.ListPromos,
  order: Ctrl.ListOrders,
  feedback: wrap(demoList(demoFeedbacks)),
  ticket: wrap(demoList(demoTickets)),
  "ticket-response": wrap(demoList(demoTicketResponses)),
  bank: wrap(demoList(demoBanks)),
  company: wrap(demoList(demoCompanies)),
  transaction: wrap(demoList(demoTransactions)),
  wallet: Ctrl.ListWallet,
  notification: Ctrl.ListNotifications,
  marketer: wrap(demoList(demoMarketers)),
  "waiting-list": wrap(demoList(demoWaitingList)),
  "general-data": wrap(demoList(demoGeneralData)),
  logistics: wrap(demoList(demoLogistics)),
  "logistics-application": wrap(demoList(demoLogisticsApplications)),
  "vendor-application": wrap(demoList(demoVendorApplications)),
  "food-category": wrap(demoList(demoFoodCategories)),
  "restaurant-category": wrap(demoList(demoRestaurantCategories)),
  "meal-measurement": wrap(demoList(demoMealMeasurements)),
};

for (const [resource, handler] of Object.entries(listAllRoutes)) {
  FoodDeliveryAdminRouter.post(`/admin/v1/all/${resource}`, handler);
}

// ==================== SINGLE (GET /single/{resource}/:id) ====================
const getSingleRoutes: Record<string, (req: any, res: any) => Promise<any>> = {
  admin: wrap(getByParamId(demoAdmins)),
  user: Ctrl.GetUser,
  restaurant: Ctrl.GetRestaurant,
  vendor: Ctrl.GetVendor,
  product: Ctrl.GetProduct,
  coupon: Ctrl.GetCoupon,
  promotion: Ctrl.GetPromo,
  order: Ctrl.GetOrder,
  feedback: wrap(getByParamId(demoFeedbacks)),
  ticket: wrap(getByParamId(demoTickets)),
  bank: wrap(getByParamId(demoBanks)),
  company: wrap(getByParamId(demoCompanies)),
  transaction: wrap(getByParamId(demoTransactions)),
  wallet: Ctrl.GetWallet,
  marketer: wrap(getByParamId(demoMarketers)),
  logistics: wrap(getByParamId(demoLogistics)),
  "logistics-application": wrap(getByParamId(demoLogisticsApplications)),
  "vendor-application": wrap(getByParamId(demoVendorApplications)),
};

for (const [resource, handler] of Object.entries(getSingleRoutes)) {
  FoodDeliveryAdminRouter.get(`/admin/v1/single/${resource}/:id`, handler);
}

// ==================== CREATE (POST /{resource}) ====================
FoodDeliveryAdminRouter.post("/admin/v1/restaurant", Ctrl.SaveRestaurant);
FoodDeliveryAdminRouter.post("/admin/v1/coupon", Ctrl.SaveCoupon);
FoodDeliveryAdminRouter.post("/admin/v1/tickets", wrap(okData({ id: 99, subject: "New Ticket", status: "open" })));
FoodDeliveryAdminRouter.post("/admin/v1/company", wrap(okData({ id: 99, name: "Demo Company", status: "active" })));
FoodDeliveryAdminRouter.post("/admin/v1/products", Ctrl.SaveProduct);
FoodDeliveryAdminRouter.post("/admin/v1/food/category", Ctrl.SaveFoodType);
FoodDeliveryAdminRouter.post("/admin/v1/meal-measurement/category", wrap(okData({ id: 99, name: "Demo Measurement", unit: "portion", status: "active" })));
FoodDeliveryAdminRouter.post("/admin/v1/restaurant/category", wrap(okData({ id: 99, name: "Demo Category", status: "active" })));
FoodDeliveryAdminRouter.post("/admin/v1/logistics", wrap(okData({ id: 99, name: "Demo Logistics", status: "active" })));
FoodDeliveryAdminRouter.post("/admin/v1/logistics-admin", wrap(okData({ id: 99, name: "Demo Logistics Admin", role: "LogisticsAdmin" })));
FoodDeliveryAdminRouter.post("/admin/v1/marketer", wrap(okData({ id: 99, name: "Demo Marketer", status: "active" })));
FoodDeliveryAdminRouter.post("/admin/v1/general-data", wrap(okData({ id: 99, key: "new_key", value: "new_value" })));
FoodDeliveryAdminRouter.post("/admin/v1/notify", Ctrl.SaveNotification);

// ====== Missing frontend routes ======
FoodDeliveryAdminRouter.post("/admin/v1/promotions", wrap(okData({ id: 99, name: "Demo Promotion", status: "active" })));
FoodDeliveryAdminRouter.patch("/admin/v1/promotions/", wrap(okData({ isDeleted: true })));
FoodDeliveryAdminRouter.delete("/admin/v1/coupon/:id", wrap(ok));
FoodDeliveryAdminRouter.delete("/admin/v1/marketer/:id", (_req, res) => res.status(204).send());

// ==================== UPDATE (PATCH /{resource}) with ID in body ====================
FoodDeliveryAdminRouter.patch("/admin/v1/restaurant", wrap(patchByBodyId(demoRestaurants)));
FoodDeliveryAdminRouter.patch("/admin/v1/vendor", wrap(patchByBodyId(demoVendors)));
FoodDeliveryAdminRouter.patch("/admin/v1/tickets/respond", wrap(okData({ id: 1, response: "Response sent", status: "responded" })));
FoodDeliveryAdminRouter.patch("/admin/v1/tickets/update", wrap(okData({ id: 1, status: "resolved" })));
FoodDeliveryAdminRouter.patch("/admin/v1/company", wrap(patchByBodyId(demoCompanies)));
FoodDeliveryAdminRouter.patch("/admin/v1/logistics", wrap(patchByBodyId(demoLogistics)));
FoodDeliveryAdminRouter.patch("/admin/v1/notification/settings", wrap(okData({ pushEnabled: true, emailEnabled: true })));
FoodDeliveryAdminRouter.patch("/admin/v1/order/update", wrap(patchByBodyId(demoOrders)));

// ==================== UPDATE BY ID (PATCH /{resource}/:id) ====================
FoodDeliveryAdminRouter.patch("/admin/v1/products/:id", Ctrl.UpdateProduct);
FoodDeliveryAdminRouter.patch("/admin/v1/notification/update/:id", wrap(patchByParamId(demoNotifications)));
FoodDeliveryAdminRouter.patch("/admin/v1/general-data/:id", wrap(patchByParamId(demoGeneralData)));
FoodDeliveryAdminRouter.patch("/admin/v1/marketer/:id", wrap(patchByParamId(demoMarketers)));

// ==================== STATUS TOGGLE (PATCH /activestatus/{resource}) ====================
FoodDeliveryAdminRouter.patch("/admin/v1/activestatus/restaurant", wrap(toggleActiveStatus(demoRestaurants)));
FoodDeliveryAdminRouter.patch("/admin/v1/activestatus/user", wrap(toggleActiveStatus(demoUsers)));
FoodDeliveryAdminRouter.patch("/admin/v1/activestatus/vendor", wrap(toggleActiveStatus(demoVendors)));

// ==================== APPROVE ====================
FoodDeliveryAdminRouter.post("/admin/v1/approve/single/restaurant", wrap(approveSingle(demoRestaurants, "Restaurant")));
FoodDeliveryAdminRouter.post("/admin/v1/approve/single/vendor", wrap(approveSingle(demoVendors, "Vendor")));
FoodDeliveryAdminRouter.post("/admin/v1/approve/single/product", wrap(approveSingle(demoProducts, "Product")));
FoodDeliveryAdminRouter.post("/admin/v1/approve/single/bank", wrap(approveSingle(demoBanks, "Bank")));
FoodDeliveryAdminRouter.patch("/admin/v1/approve/withdrawals", wrap(okData({ approved: true, message: "Withdrawals approved" })));

// ==================== DELETE (DELETE /delete/{resource}/:id) ====================
FoodDeliveryAdminRouter.delete("/admin/v1/delete/waiting-list/:id", wrap(ok));
FoodDeliveryAdminRouter.delete("/admin/v1/delete/logistics-application/:id", wrap(ok));
FoodDeliveryAdminRouter.delete("/admin/v1/delete/vendor-application/:id", wrap(ok));

// ==================== MISC ====================
FoodDeliveryAdminRouter.post("/admin/v1/food-categories/:id/set-priority", wrap(okData({ id: 1, priority: 1 })));
FoodDeliveryAdminRouter.patch("/admin/v1/permissions", wrap(okData({ permissions: demoPermissions })));
FoodDeliveryAdminRouter.patch("/admin/v1/toggle-active-status/admin", wrap(okData({ id: 1, status: "active" })));
FoodDeliveryAdminRouter.post("/admin/v1/marketers/pay", wrap(okData({ paid: true, amount: 5000, marketerId: 1 })));
FoodDeliveryAdminRouter.get("/admin/v1/marketers/pay", wrap(okData({ paid: true, amount: 5000, marketerId: 1 })));
FoodDeliveryAdminRouter.post("/admin/v1/logistics-applications/:id/send-agreement-email", wrap(okData({ emailSent: true })));
FoodDeliveryAdminRouter.patch("/admin/v1/logistics-applications/:id", wrap(patchByParamId(demoLogisticsApplications)));
FoodDeliveryAdminRouter.post("/admin/v1/vendor-applications/:id/send-agreement-email", wrap(okData({ emailSent: true })));
FoodDeliveryAdminRouter.patch("/admin/v1/vendor-applications/:id", wrap(patchByParamId(demoVendorApplications)));
FoodDeliveryAdminRouter.get("/admin/v1/company/:id", wrap(getByParamId(demoCompanies)));

// ==================== BACKWARD-COMPAT (old POST-based routes) ====================
FoodDeliveryAdminRouter.post("/admin/v1/stat", Ctrl.GetStat);
FoodDeliveryAdminRouter.post("/admin/v1/logout", Ctrl.Logout);
FoodDeliveryAdminRouter.post("/admin/v1/me", Ctrl.GetMe);
FoodDeliveryAdminRouter.post("/admin/v1/update/admin/profile", Ctrl.UpdateAdminProfile);
FoodDeliveryAdminRouter.post("/admin/v1/update/admin/password", Ctrl.UpdateAdminPassword);
FoodDeliveryAdminRouter.post("/admin/v1/stat/chart", Ctrl.GetStatChart);
FoodDeliveryAdminRouter.post("/admin/v1/top/vendors", Ctrl.GetTopVendors);
FoodDeliveryAdminRouter.post("/admin/v1/save/zone", Ctrl.SaveZone);
FoodDeliveryAdminRouter.post("/admin/v1/update/zone/:id", Ctrl.UpdateZone);
FoodDeliveryAdminRouter.post("/admin/v1/delete/zone", Ctrl.DeleteZone);
FoodDeliveryAdminRouter.post("/admin/v1/status/zone/:id", Ctrl.UpdateZoneStatus);
FoodDeliveryAdminRouter.post("/admin/v1/save/restaurant", Ctrl.SaveRestaurant);
FoodDeliveryAdminRouter.post("/admin/v1/update/restaurant/:id", Ctrl.UpdateRestaurant);
FoodDeliveryAdminRouter.post("/admin/v1/status/restaurant/:id", Ctrl.UpdateRestaurantStatus);
FoodDeliveryAdminRouter.post("/admin/v1/delete/restaurant", Ctrl.DeleteRestaurant);
FoodDeliveryAdminRouter.post("/admin/v1/save/vendor", Ctrl.SaveVendor);
FoodDeliveryAdminRouter.post("/admin/v1/update/vendor/:id", Ctrl.UpdateVendor);
FoodDeliveryAdminRouter.post("/admin/v1/status/vendor/:id", Ctrl.UpdateVendorStatus);
FoodDeliveryAdminRouter.post("/admin/v1/delete/vendor", Ctrl.DeleteVendor);
FoodDeliveryAdminRouter.post("/admin/v1/save/product", Ctrl.SaveProduct);
FoodDeliveryAdminRouter.post("/admin/v1/update/product/:id", Ctrl.UpdateProduct);
FoodDeliveryAdminRouter.post("/admin/v1/status/product/:id", Ctrl.UpdateProductStatus);
FoodDeliveryAdminRouter.post("/admin/v1/delete/product", Ctrl.DeleteProduct);
FoodDeliveryAdminRouter.post("/admin/v1/save/banner", Ctrl.SaveBanner);
FoodDeliveryAdminRouter.post("/admin/v1/update/banner/:id", Ctrl.UpdateBanner);
FoodDeliveryAdminRouter.post("/admin/v1/delete/banner", Ctrl.DeleteBanner);
FoodDeliveryAdminRouter.post("/admin/v1/save/promo", Ctrl.SavePromo);
FoodDeliveryAdminRouter.post("/admin/v1/update/promo/:id", Ctrl.UpdatePromo);
FoodDeliveryAdminRouter.post("/admin/v1/delete/promo", Ctrl.DeletePromo);
FoodDeliveryAdminRouter.post("/admin/v1/save/coupon", Ctrl.SaveCoupon);
FoodDeliveryAdminRouter.post("/admin/v1/update/coupon/:id", Ctrl.UpdateCoupon);
FoodDeliveryAdminRouter.post("/admin/v1/delete/coupon", Ctrl.DeleteCoupon);
FoodDeliveryAdminRouter.post("/admin/v1/status/coupon/:id", Ctrl.UpdateCouponStatus);
FoodDeliveryAdminRouter.post("/admin/v1/save/foodtype", Ctrl.SaveFoodType);
FoodDeliveryAdminRouter.post("/admin/v1/delete/foodtype", Ctrl.DeleteFoodType);
FoodDeliveryAdminRouter.post("/admin/v1/save/deliveryfee", Ctrl.SaveDeliveryFee);
FoodDeliveryAdminRouter.post("/admin/v1/update/deliveryfee/:id", Ctrl.UpdateDeliveryFee);
FoodDeliveryAdminRouter.post("/admin/v1/delete/deliveryfee", Ctrl.DeleteDeliveryFee);
FoodDeliveryAdminRouter.post("/admin/v1/update/order/:id", Ctrl.UpdateOrder);
FoodDeliveryAdminRouter.post("/admin/v1/delete/order", Ctrl.DeleteOrder);
FoodDeliveryAdminRouter.post("/admin/v1/save/setting", Ctrl.SaveSetting);
FoodDeliveryAdminRouter.post("/admin/v1/update/setting/:id", Ctrl.UpdateSetting);
FoodDeliveryAdminRouter.post("/admin/v1/delete/setting", Ctrl.DeleteSetting);
FoodDeliveryAdminRouter.post("/admin/v1/save/wallet", Ctrl.SaveWallet);
FoodDeliveryAdminRouter.post("/admin/v1/update/wallet/:id", Ctrl.UpdateWallet);
FoodDeliveryAdminRouter.post("/admin/v1/delete/wallet", Ctrl.DeleteWallet);
FoodDeliveryAdminRouter.post("/admin/v1/save/rider", Ctrl.SaveRider);
FoodDeliveryAdminRouter.post("/admin/v1/update/rider/:id", Ctrl.UpdateRider);
FoodDeliveryAdminRouter.post("/admin/v1/status/rider/:id", Ctrl.UpdateRiderStatus);
FoodDeliveryAdminRouter.post("/admin/v1/delete/rider", Ctrl.DeleteRider);
FoodDeliveryAdminRouter.post("/admin/v1/save/notification", Ctrl.SaveNotification);
FoodDeliveryAdminRouter.post("/admin/v1/send/notification", Ctrl.SendNotification);
FoodDeliveryAdminRouter.post("/admin/v1/delete/notification", Ctrl.DeleteNotification);
FoodDeliveryAdminRouter.post("/admin/v1/approve/single/vendor/:id", Ctrl.ApproveVendor);
FoodDeliveryAdminRouter.post("/admin/v1/reject/single/vendor/:id", Ctrl.RejectVendor);
FoodDeliveryAdminRouter.post("/admin/v1/approve/single/artisan/:id", Ctrl.ApproveArtisan);
FoodDeliveryAdminRouter.post("/admin/v1/reject/single/artisan/:id", Ctrl.RejectArtisan);
FoodDeliveryAdminRouter.post("/admin/v1/approve/single/restaurant/:id", Ctrl.ApproveRestaurant);
FoodDeliveryAdminRouter.post("/admin/v1/reject/single/restaurant/:id", Ctrl.RejectRestaurant);
FoodDeliveryAdminRouter.post("/admin/v1/approve/single/rider/:id", Ctrl.ApproveRider);
FoodDeliveryAdminRouter.post("/admin/v1/reject/single/rider/:id", Ctrl.RejectRider);
FoodDeliveryAdminRouter.post("/admin/v1/all/zone", Ctrl.ListZones);
FoodDeliveryAdminRouter.post("/admin/v1/all/banner", Ctrl.ListBanners);
FoodDeliveryAdminRouter.post("/admin/v1/all/deliveryfee", Ctrl.ListDeliveryFees);
FoodDeliveryAdminRouter.post("/admin/v1/all/setting", Ctrl.ListSettings);
FoodDeliveryAdminRouter.post("/admin/v1/all/riders", Ctrl.ListRiders);
FoodDeliveryAdminRouter.post("/admin/v1/all/foodtype", Ctrl.ListFoodTypes);
FoodDeliveryAdminRouter.post("/admin/v1/single/zone/:id", Ctrl.GetZone);
FoodDeliveryAdminRouter.post("/admin/v1/single/banner/:id", Ctrl.GetBanner);
FoodDeliveryAdminRouter.post("/admin/v1/single/setting/:id", Ctrl.GetSetting);
FoodDeliveryAdminRouter.post("/admin/v1/single/rider/:id", Ctrl.GetRider);

export default FoodDeliveryAdminRouter;
