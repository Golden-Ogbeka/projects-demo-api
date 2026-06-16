import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { recordFoodDeliveryAdminEvent } from "../database/index.js";

const respond = (res: Response, message: string, data?: unknown, results?: number | null) =>
  res.json({ status: "success", message, results: results ?? (Array.isArray(data) ? data.length : null), data: data ?? null });

const respondError = (res: Response, status: number, message: string) =>
  res.status(status).json({ status: "error", message, data: null });

const respondCatch = (res: Response, error: unknown) =>
  res.status(500).json({ status: "error", message: error instanceof Error ? error.message : "An error occurred", data: null });

const IMAGES = {
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
  food: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
  banner: "https://images.unsplash.com/photo-1556742049-0cfed4f06a45?w=1200",
  vendor: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=200",
  rider: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200",
};

type Row = Record<string, unknown>;

const getPagination = (body: Row) => {
  const page = parseInt(String(body?.page)) || 1;
  const limit = parseInt(String(body?.limit)) || 20;
  return { page, limit };
};

const parseOrder = (row: Row | undefined) => {
  if (!row) return null;
  return { ...row, items: row.items ? JSON.parse(row.items as string) : [] };
};

const getSettingsList = () => {
  const row = sqlite.prepare("SELECT data FROM food_delivery_admin_settings WHERE id = 1").get() as { data: string } | undefined;
  if (!row) return [];
  const data = JSON.parse(row.data);
  return Object.entries(data).map(([key, value], index) => ({
    id: index + 1,
    key,
    value: String(value),
    type: typeof value,
  }));
};

const updateSettingsData = (mutator: (data: Row) => void) => {
  const row = sqlite.prepare("SELECT data FROM food_delivery_admin_settings WHERE id = 1").get() as { data: string } | undefined;
  if (!row) return;
  const data = JSON.parse(row.data) as Row;
  mutator(data);
  sqlite.prepare("UPDATE food_delivery_admin_settings SET data = ? WHERE id = 1").run(JSON.stringify(data));
};

export const FoodDeliveryAdminController = () => {
  // ============ AUTH ============

  const Login = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const { email, password } = body;
      const user = sqlite.prepare("SELECT * FROM food_delivery_admin_users WHERE email = ? AND password = ?").get(email, password) as Row | undefined;
      if (user) {
        const { password: _, ...safeUser } = user;
        return respond(res, "Login successful", {
          _id: String(user.id),
          token: "demo-food-delivery-admin-token",
          ...safeUser,
          fullname: user.name,
          isApproved: true,
          isVerified: true,
          userPermissions: { login: true },
        });
      }
      return respondError(res, 401, "Invalid email or password");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const Logout = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Logged out successfully");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetMe = async (_req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT id, name, email, role FROM food_delivery_admin_users WHERE id = 1").get() as Record<string, unknown>;
      return respond(res, "Profile retrieved", { _id: String(user?.id), ...user, fullname: user?.name });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateAdminProfile = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_users WHERE id = 1").get() as Row | undefined;
      if (!existing) return respondError(res, 404, "User not found");
      const name = body.name || body.fullname || existing.name;
      const email = body.email ?? existing.email;
      const role = body.role ?? existing.role;
      sqlite.prepare("UPDATE food_delivery_admin_users SET name = ?, email = ?, role = ? WHERE id = 1").run(name, email, role);
      const updated = sqlite.prepare("SELECT id, name, email, role FROM food_delivery_admin_users WHERE id = 1").get() as Row;
      return respond(res, "Profile updated", { _id: String(updated?.id), ...updated, fullname: updated?.name });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateAdminPassword = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Password updated");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ DASHBOARD ============

  const GetStat = async (_req: Request, res: Response) => {
    try {
      const totalOrders = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_orders").get() as { c: number }).c;
      const totalRevenue = (sqlite.prepare("SELECT COALESCE(SUM(totalAmount),0) as s FROM food_delivery_admin_orders").get() as { s: number }).s;
      const completedOrders = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_orders WHERE status = 'delivered'").get() as { c: number }).c;
      const totalUsers = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_users").get() as { c: number }).c;
      const totalVendors = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_vendors").get() as { c: number }).c;
      const totalRestaurants = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_restaurants WHERE status = 'active'").get() as { c: number }).c;
      const totalRiders = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_riders").get() as { c: number }).c;
      const onlineRiders = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_riders WHERE status = 'online'").get() as { c: number }).c;
      const pendingOrders = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_orders WHERE status = 'pending'").get() as { c: number }).c;
      const cancelledOrders = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_orders WHERE status = 'cancelled'").get() as { c: number }).c;
      const assignedOrders = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_orders WHERE status = 'assigned'").get() as { c: number }).c;
      const preparingOrders = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_orders WHERE status = 'preparing'").get() as { c: number }).c;
      return respond(res, "Dashboard data retrieved", {
        totalOrders, totalRevenue, totalUsers, totalVendors, totalRestaurants,
        totalRiders, onlineRiders, pendingOrders, completedOrders, cancelledOrders, assignedOrders, preparingOrders,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetStatChart = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Chart data retrieved", {
        orders: [
          { period: "Mon", value: 45 }, { period: "Tue", value: 52 }, { period: "Wed", value: 38 },
          { period: "Thu", value: 61 }, { period: "Fri", value: 78 }, { period: "Sat", value: 95 },
          { period: "Sun", value: 72 },
        ],
        revenue: [
          { period: "Mon", value: 180000 }, { period: "Tue", value: 220000 }, { period: "Wed", value: 165000 },
          { period: "Thu", value: 275000 }, { period: "Fri", value: 350000 }, { period: "Sat", value: 410000 },
          { period: "Sun", value: 320000 },
        ],
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetTopVendors = async (_req: Request, res: Response) => {
    try {
      const vendors = sqlite.prepare("SELECT * FROM food_delivery_admin_vendors WHERE status = 'active' LIMIT 5").all() as Row[];
      const items = vendors.map((v) => ({
        id: v.id, name: v.name,
        totalOrders: Math.floor(Math.random() * 200) + 50,
        totalRevenue: Math.floor(Math.random() * 500000) + 100000,
        rating: v.rating,
      }));
      return respond(res, "Top vendors retrieved", items, items.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ USERS ============

  const ListUsers = async (req: Request, res: Response) => {
    try {
      const { page, limit } = getPagination(req.body as Row);
      const all = sqlite.prepare("SELECT id, name, email, role FROM food_delivery_admin_users").all() as Row[];
      const items = all.slice((page - 1) * limit, page * limit);
      return respond(res, "Users retrieved", items.map((u: any) => ({ _id: String(u.id), ...u, fullname: u.name })), all.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetUser = async (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT id, name, email, role FROM food_delivery_admin_users WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!user) return respondError(res, 404, "User not found");
      return respond(res, "User retrieved", user);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateUserStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_users WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "User not found");
      const status = (req.body as Row)?.status || "active";
      sqlite.prepare("UPDATE food_delivery_admin_users SET status = ? WHERE id = ?").run(status, id);
      const updated = sqlite.prepare("SELECT id, name, email, role, status FROM food_delivery_admin_users WHERE id = ?").get(id);
      return respond(res, "User status updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ ZONES ============

  const ListZones = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_zones").all() as Row[];
      return respond(res, "Zones retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetZone = async (req: Request, res: Response) => {
    try {
      const zone = sqlite.prepare("SELECT * FROM food_delivery_admin_zones WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!zone) return respondError(res, 404, "Zone not found");
      return respond(res, "Zone retrieved", zone);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveZone = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_zones (name,state,status,deliveryFee,riderCount) VALUES (?,?,?,?,?)").run(
        body.name || "New Zone", body.state || "Lagos", "active", body.deliveryFee || 500, 0
      );
      const newZone = sqlite.prepare("SELECT * FROM food_delivery_admin_zones WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Zone created", newZone);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateZone = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_zones WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Zone not found");
      const body = req.body as Row;
      const name = body.name ?? existing.name;
      const state = body.state ?? existing.state;
      const status = body.status ?? existing.status;
      const deliveryFee = body.deliveryFee ?? existing.deliveryFee;
      const riderCount = body.riderCount ?? existing.riderCount;
      sqlite.prepare("UPDATE food_delivery_admin_zones SET name=?,state=?,status=?,deliveryFee=?,riderCount=? WHERE id=?").run(name, state, status, deliveryFee, riderCount, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_zones WHERE id = ?").get(id);
      return respond(res, "Zone updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteZone = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Zone deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateZoneStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_zones WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Zone not found");
      const status = (req.body as Row)?.status ?? existing.status;
      sqlite.prepare("UPDATE food_delivery_admin_zones SET status = ? WHERE id = ?").run(status, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_zones WHERE id = ?").get(id);
      return respond(res, "Zone status updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ RESTAURANTS ============

  const ListRestaurants = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_restaurants").all() as Row[];
      return respond(res, "Restaurants retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetRestaurant = async (req: Request, res: Response) => {
    try {
      const restaurant = sqlite.prepare("SELECT * FROM food_delivery_admin_restaurants WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!restaurant) return respondError(res, 404, "Restaurant not found");
      return respond(res, "Restaurant retrieved", restaurant);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveRestaurant = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_restaurants (name,email,phone,address,status,rating,image,zoneId,zoneName) VALUES (?,?,?,?,?,?,?,?,?)").run(
        body.name || "New Restaurant", body.email || "new@example.com", body.phone || "+2348000000000",
        body.address || "Demo Address", "active", 0, IMAGES.restaurant, body.zoneId || 1, body.zoneName || "Ikeja"
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_restaurants WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Restaurant created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateRestaurant = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_restaurants WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Restaurant not found");
      const body = req.body as Row;
      const name = body.name ?? existing.name;
      const email = body.email ?? existing.email;
      const phone = body.phone ?? existing.phone;
      const address = body.address ?? existing.address;
      const status = body.status ?? existing.status;
      const rating = body.rating ?? existing.rating;
      const image = body.image ?? existing.image;
      const zoneId = body.zoneId ?? existing.zoneId;
      const zoneName = body.zoneName ?? existing.zoneName;
      sqlite.prepare("UPDATE food_delivery_admin_restaurants SET name=?,email=?,phone=?,address=?,status=?,rating=?,image=?,zoneId=?,zoneName=? WHERE id=?").run(name, email, phone, address, status, rating, image, zoneId, zoneName, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_restaurants WHERE id = ?").get(id);
      return respond(res, "Restaurant updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateRestaurantStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_restaurants WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Restaurant not found");
      const status = (req.body as Row)?.status ?? existing.status;
      sqlite.prepare("UPDATE food_delivery_admin_restaurants SET status = ? WHERE id = ?").run(status, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_restaurants WHERE id = ?").get(id);
      return respond(res, "Restaurant status updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteRestaurant = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Restaurant deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ VENDORS ============

  const ListVendors = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_vendors").all() as Row[];
      return respond(res, "Vendors retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetVendor = async (req: Request, res: Response) => {
    try {
      const vendor = sqlite.prepare("SELECT * FROM food_delivery_admin_vendors WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!vendor) return respondError(res, 404, "Vendor not found");
      return respond(res, "Vendor retrieved", vendor);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveVendor = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_vendors (name,email,phone,address,status,productCount,rating) VALUES (?,?,?,?,?,?,?)").run(
        body.name || "New Vendor", body.email || "vendor@example.com", body.phone || "+2348000000000",
        body.address || "Demo Address", "active", 0, 0
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_vendors WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Vendor created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateVendor = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_vendors WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Vendor not found");
      const body = req.body as Row;
      const name = body.name ?? existing.name;
      const email = body.email ?? existing.email;
      const phone = body.phone ?? existing.phone;
      const address = body.address ?? existing.address;
      const status = body.status ?? existing.status;
      const productCount = body.productCount ?? existing.productCount;
      const rating = body.rating ?? existing.rating;
      sqlite.prepare("UPDATE food_delivery_admin_vendors SET name=?,email=?,phone=?,address=?,status=?,productCount=?,rating=? WHERE id=?").run(name, email, phone, address, status, productCount, rating, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_vendors WHERE id = ?").get(id);
      return respond(res, "Vendor updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateVendorStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_vendors WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Vendor not found");
      const status = (req.body as Row)?.status ?? existing.status;
      sqlite.prepare("UPDATE food_delivery_admin_vendors SET status = ? WHERE id = ?").run(status, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_vendors WHERE id = ?").get(id);
      return respond(res, "Vendor status updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteVendor = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Vendor deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ PRODUCTS ============

  const ListProducts = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_products").all() as Row[];
      return respond(res, "Products retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetProduct = async (req: Request, res: Response) => {
    try {
      const product = sqlite.prepare("SELECT * FROM food_delivery_admin_products WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!product) return respondError(res, 404, "Product not found");
      return respond(res, "Product retrieved", product);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveProduct = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_products (name,restaurantId,restaurantName,price,category,status,image,stock) VALUES (?,?,?,?,?,?,?,?)").run(
        body.name || "New Product", body.restaurantId || 1, body.restaurantName || "Restaurant",
        body.price || 2000, body.category || "Main Meals", "active", IMAGES.food, body.stock || 50
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_products WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Product created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateProduct = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_products WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Product not found");
      const body = req.body as Row;
      const name = body.name ?? existing.name;
      const restaurantId = body.restaurantId ?? existing.restaurantId;
      const restaurantName = body.restaurantName ?? existing.restaurantName;
      const price = body.price ?? existing.price;
      const category = body.category ?? existing.category;
      const status = body.status ?? existing.status;
      const image = body.image ?? existing.image;
      const stock = body.stock ?? existing.stock;
      sqlite.prepare("UPDATE food_delivery_admin_products SET name=?,restaurantId=?,restaurantName=?,price=?,category=?,status=?,image=?,stock=? WHERE id=?").run(name, restaurantId, restaurantName, price, category, status, image, stock, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_products WHERE id = ?").get(id);
      return respond(res, "Product updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateProductStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_products WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Product not found");
      const status = (req.body as Row)?.status ?? existing.status;
      sqlite.prepare("UPDATE food_delivery_admin_products SET status = ? WHERE id = ?").run(status, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_products WHERE id = ?").get(id);
      return respond(res, "Product status updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteProduct = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Product deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ BANNERS ============

  const ListBanners = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_banners").all() as Row[];
      return respond(res, "Banners retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetBanner = async (req: Request, res: Response) => {
    try {
      const banner = sqlite.prepare("SELECT * FROM food_delivery_admin_banners WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!banner) return respondError(res, 404, "Banner not found");
      return respond(res, "Banner retrieved", banner);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveBanner = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const now = new Date().toISOString();
      const end = (body.endDate as string) || new Date(Date.now() + 30 * 86400000).toISOString();
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_banners (title,image,status,link,startDate,endDate,createdAt) VALUES (?,?,?,?,?,?,?)").run(
        body.title || "New Banner", IMAGES.banner, "active", body.link || "/",
        body.startDate || now, end, now
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_banners WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Banner created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateBanner = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_banners WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Banner not found");
      const body = req.body as Row;
      const title = body.title ?? existing.title;
      const image = body.image ?? existing.image;
      const status = body.status ?? existing.status;
      const link = body.link ?? existing.link;
      const startDate = body.startDate ?? existing.startDate;
      const endDate = body.endDate ?? existing.endDate;
      sqlite.prepare("UPDATE food_delivery_admin_banners SET title=?,image=?,status=?,link=?,startDate=?,endDate=? WHERE id=?").run(title, image, status, link, startDate, endDate, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_banners WHERE id = ?").get(id);
      return respond(res, "Banner updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteBanner = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Banner deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ PROMOS ============

  const ListPromos = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_promos").all() as Row[];
      return respond(res, "Promos retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetPromo = async (req: Request, res: Response) => {
    try {
      const promo = sqlite.prepare("SELECT * FROM food_delivery_admin_promos WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!promo) return respondError(res, 404, "Promo not found");
      return respond(res, "Promo retrieved", promo);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SavePromo = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const now = new Date().toISOString();
      const end = (body.endDate as string) || new Date(Date.now() + 30 * 86400000).toISOString();
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_promos (name,discountType,discountValue,code,status,minOrder,maxDiscount,usageLimit,usedCount,startDate,endDate) VALUES (?,?,?,?,?,?,?,?,?,?,?)").run(
        body.name || "New Promo", body.discountType || "percentage", body.discountValue || 10,
        body.code || "NEWPROMO", "active", body.minOrder || 0, body.maxDiscount || 0,
        body.usageLimit || 100, 0, body.startDate || now, end
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_promos WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Promo created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdatePromo = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_promos WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Promo not found");
      const body = req.body as Row;
      const name = body.name ?? existing.name;
      const discountType = body.discountType ?? existing.discountType;
      const discountValue = body.discountValue ?? existing.discountValue;
      const code = body.code ?? existing.code;
      const status = body.status ?? existing.status;
      const minOrder = body.minOrder ?? existing.minOrder;
      const maxDiscount = body.maxDiscount ?? existing.maxDiscount;
      const usageLimit = body.usageLimit ?? existing.usageLimit;
      const usedCount = body.usedCount ?? existing.usedCount;
      const startDate = body.startDate ?? existing.startDate;
      const endDate = body.endDate ?? existing.endDate;
      sqlite.prepare("UPDATE food_delivery_admin_promos SET name=?,discountType=?,discountValue=?,code=?,status=?,minOrder=?,maxDiscount=?,usageLimit=?,usedCount=?,startDate=?,endDate=? WHERE id=?").run(name, discountType, discountValue, code, status, minOrder, maxDiscount, usageLimit, usedCount, startDate, endDate, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_promos WHERE id = ?").get(id);
      return respond(res, "Promo updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeletePromo = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Promo deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ COUPONS ============

  const ListCoupons = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_coupons").all() as Row[];
      return respond(res, "Coupons retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetCoupon = async (req: Request, res: Response) => {
    try {
      const coupon = sqlite.prepare("SELECT * FROM food_delivery_admin_coupons WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!coupon) return respondError(res, 404, "Coupon not found");
      return respond(res, "Coupon retrieved", coupon);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveCoupon = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const expires = (body.expiresAt as string) || new Date(Date.now() + 90 * 86400000).toISOString();
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_coupons (code,description,discountType,discountValue,minOrder,status,usageLimit,usedCount,expiresAt) VALUES (?,?,?,?,?,?,?,?,?)").run(
        body.code || "NEWCOUPON", body.description || "New coupon", body.discountType || "fixed",
        body.discountValue || 200, body.minOrder || 0, "active", body.usageLimit || 100, 0, expires
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_coupons WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Coupon created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateCoupon = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_coupons WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Coupon not found");
      const body = req.body as Row;
      const code = body.code ?? existing.code;
      const description = body.description ?? existing.description;
      const discountType = body.discountType ?? existing.discountType;
      const discountValue = body.discountValue ?? existing.discountValue;
      const minOrder = body.minOrder ?? existing.minOrder;
      const status = body.status ?? existing.status;
      const usageLimit = body.usageLimit ?? existing.usageLimit;
      const usedCount = body.usedCount ?? existing.usedCount;
      const expiresAt = body.expiresAt ?? existing.expiresAt;
      sqlite.prepare("UPDATE food_delivery_admin_coupons SET code=?,description=?,discountType=?,discountValue=?,minOrder=?,status=?,usageLimit=?,usedCount=?,expiresAt=? WHERE id=?").run(code, description, discountType, discountValue, minOrder, status, usageLimit, usedCount, expiresAt, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_coupons WHERE id = ?").get(id);
      return respond(res, "Coupon updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteCoupon = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Coupon deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateCouponStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_coupons WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Coupon not found");
      const status = (req.body as Row)?.status ?? existing.status;
      sqlite.prepare("UPDATE food_delivery_admin_coupons SET status = ? WHERE id = ?").run(status, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_coupons WHERE id = ?").get(id);
      return respond(res, "Coupon status updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ FOOD TYPES ============

  const ListFoodTypes = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_food_types").all() as Row[];
      return respond(res, "Food types retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveFoodType = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const maxSort = (sqlite.prepare("SELECT COALESCE(MAX(sortOrder),0) as s FROM food_delivery_admin_food_types").get() as { s: number }).s;
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_food_types (name,status,sortOrder) VALUES (?,?,?)").run(
        body.name || "New Type", "active", maxSort + 1
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_food_types WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Food type created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteFoodType = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Food type deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ DELIVERY FEES ============

  const ListDeliveryFees = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_delivery_fees").all() as Row[];
      return respond(res, "Delivery fees retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveDeliveryFee = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_delivery_fees (zoneName,baseFee,perKmFee,minDistance,maxDistance,status) VALUES (?,?,?,?,?,?)").run(
        body.zoneName || "New Zone", body.baseFee || 500, body.perKmFee || 100,
        body.minDistance || 1, body.maxDistance || 15, "active"
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_delivery_fees WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Delivery fee created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateDeliveryFee = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_delivery_fees WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Delivery fee not found");
      const body = req.body as Row;
      const zoneName = body.zoneName ?? existing.zoneName;
      const baseFee = body.baseFee ?? existing.baseFee;
      const perKmFee = body.perKmFee ?? existing.perKmFee;
      const minDistance = body.minDistance ?? existing.minDistance;
      const maxDistance = body.maxDistance ?? existing.maxDistance;
      const status = body.status ?? existing.status;
      sqlite.prepare("UPDATE food_delivery_admin_delivery_fees SET zoneName=?,baseFee=?,perKmFee=?,minDistance=?,maxDistance=?,status=? WHERE id=?").run(zoneName, baseFee, perKmFee, minDistance, maxDistance, status, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_delivery_fees WHERE id = ?").get(id);
      return respond(res, "Delivery fee updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteDeliveryFee = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Delivery fee deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ ORDERS ============

  const ListOrders = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const { page, limit } = getPagination(body);
      const status = String(body?.status || "");
      let rows: Row[];
      if (status) {
        rows = sqlite.prepare("SELECT * FROM food_delivery_admin_orders WHERE status = ?").all(status) as Row[];
      } else {
        rows = sqlite.prepare("SELECT * FROM food_delivery_admin_orders").all() as Row[];
      }
      const items = rows.map((r) => parseOrder(r));
      const paged = items.slice((page - 1) * limit, page * limit);
      return respond(res, "Orders retrieved", paged, items.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetOrder = async (req: Request, res: Response) => {
    try {
      const row = sqlite.prepare("SELECT * FROM food_delivery_admin_orders WHERE id = ?").get(parseInt(String(req.params.id))) as Row | undefined;
      const order = parseOrder(row);
      if (!order) return respondError(res, 404, "Order not found");
      return respond(res, "Order retrieved", order);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateOrder = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_orders WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Order not found");
      const body = req.body as Row;
      const orderNumber = body.orderNumber ?? existing.orderNumber;
      const customerName = body.customerName ?? existing.customerName;
      const customerPhone = body.customerPhone ?? existing.customerPhone;
      const restaurantId = body.restaurantId ?? existing.restaurantId;
      const restaurantName = body.restaurantName ?? existing.restaurantName;
      const totalAmount = body.totalAmount ?? existing.totalAmount;
      const deliveryFee = body.deliveryFee ?? existing.deliveryFee;
      const status = body.status ?? existing.status;
      const paymentStatus = body.paymentStatus ?? existing.paymentStatus;
      const zone = body.zone ?? existing.zone;
      const riderId = body.riderId ?? existing.riderId;
      const riderName = body.riderName ?? existing.riderName;
      const items = body.items ? JSON.stringify(body.items) : existing.items;
      sqlite.prepare("UPDATE food_delivery_admin_orders SET orderNumber=?,customerName=?,customerPhone=?,restaurantId=?,restaurantName=?,totalAmount=?,deliveryFee=?,status=?,paymentStatus=?,zone=?,riderId=?,riderName=?,items=? WHERE id=?").run(orderNumber, customerName, customerPhone, restaurantId, restaurantName, totalAmount, deliveryFee, status, paymentStatus, zone, riderId, riderName, items, id);
      const updated = parseOrder(sqlite.prepare("SELECT * FROM food_delivery_admin_orders WHERE id = ?").get(id) as Row | undefined);
      return respond(res, "Order updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteOrder = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Order deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ SETTINGS ============

  const ListSettings = async (_req: Request, res: Response) => {
    try {
      const items = getSettingsList();
      return respond(res, "Settings retrieved", items, items.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetSetting = async (req: Request, res: Response) => {
    try {
      const items = getSettingsList();
      const setting = items.find((s: Row) => s.id === parseInt(String(req.params.id)));
      if (!setting) return respondError(res, 404, "Setting not found");
      return respond(res, "Setting retrieved", setting);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveSetting = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const key = String(body.key || "new_setting");
      const rawValue = body.value;
      const strValue = String(rawValue ?? "");
      const valType = typeof rawValue;
      let newId = 1;
      updateSettingsData((data) => {
        data[key] = rawValue ?? "";
        const entries = Object.keys(data);
        newId = entries.indexOf(key) + 1;
      });
      return respond(res, "Setting created", { id: newId, key, value: strValue, type: valType });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateSetting = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const items = getSettingsList();
      const existing = items.find((s: Row) => s.id === id);
      if (!existing) return respondError(res, 404, "Setting not found");
      const body = req.body as Row;
      const key = String(body.key ?? existing.key);
      const rawValue = body.value ?? existing.value;
      const valType = typeof body.value !== "undefined" ? typeof body.value : existing.type;
      updateSettingsData((data) => {
        delete data[existing.key as string];
        data[key] = rawValue;
      });
      return respond(res, "Setting updated", { id, key, value: String(rawValue), type: valType });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteSetting = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Setting deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ WALLET ============

  const ListWallet = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_wallets").all() as Row[];
      return respond(res, "Wallet transactions retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetWallet = async (req: Request, res: Response) => {
    try {
      const txn = sqlite.prepare("SELECT * FROM food_delivery_admin_wallets WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!txn) return respondError(res, 404, "Wallet transaction not found");
      return respond(res, "Wallet transaction retrieved", txn);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveWallet = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const amount = Number(body.amount || 0);
      const fee = Number(body.fee || 0);
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_wallets (type,description,amount,fee,net,status,reference,createdAt) VALUES (?,?,?,?,?,?,?,?)").run(
        body.type || "order_payment", body.description || "New transaction", amount, fee,
        amount - fee, "completed", `TXN-DEMO-${Date.now()}`, new Date().toISOString()
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_wallets WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Wallet transaction created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateWallet = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_wallets WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Wallet transaction not found");
      const body = req.body as Row;
      const type = body.type ?? existing.type;
      const description = body.description ?? existing.description;
      const amount = body.amount ?? existing.amount;
      const fee = body.fee ?? existing.fee;
      const net = body.net ?? (Number(amount) - Number(fee));
      const status = body.status ?? existing.status;
      const reference = body.reference ?? existing.reference;
      sqlite.prepare("UPDATE food_delivery_admin_wallets SET type=?,description=?,amount=?,fee=?,net=?,status=?,reference=? WHERE id=?").run(type, description, amount, fee, net, status, reference, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_wallets WHERE id = ?").get(id);
      return respond(res, "Wallet transaction updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteWallet = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Wallet transaction deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ RIDERS ============

  const ListRiders = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_riders").all() as Row[];
      return respond(res, "Riders retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetRider = async (req: Request, res: Response) => {
    try {
      const rider = sqlite.prepare("SELECT * FROM food_delivery_admin_riders WHERE id = ?").get(parseInt(String(req.params.id)));
      if (!rider) return respondError(res, 404, "Rider not found");
      return respond(res, "Rider retrieved", rider);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveRider = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_riders (name,email,phone,status,zoneId,zoneName,completedOrders,rating,vehicleType,image) VALUES (?,?,?,?,?,?,?,?,?,?)").run(
        body.name || "New Rider", body.email || "rider@example.com", body.phone || "+2348000000000",
        "offline", body.zoneId || 1, body.zoneName || "Ikeja", 0, 0,
        body.vehicleType || "motorcycle", IMAGES.rider
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_riders WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Rider created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateRider = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_riders WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Rider not found");
      const body = req.body as Row;
      const name = body.name ?? existing.name;
      const email = body.email ?? existing.email;
      const phone = body.phone ?? existing.phone;
      const status = body.status ?? existing.status;
      const zoneId = body.zoneId ?? existing.zoneId;
      const zoneName = body.zoneName ?? existing.zoneName;
      const completedOrders = body.completedOrders ?? existing.completedOrders;
      const rating = body.rating ?? existing.rating;
      const vehicleType = body.vehicleType ?? existing.vehicleType;
      const image = body.image ?? existing.image;
      sqlite.prepare("UPDATE food_delivery_admin_riders SET name=?,email=?,phone=?,status=?,zoneId=?,zoneName=?,completedOrders=?,rating=?,vehicleType=?,image=? WHERE id=?").run(name, email, phone, status, zoneId, zoneName, completedOrders, rating, vehicleType, image, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_riders WHERE id = ?").get(id);
      return respond(res, "Rider updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateRiderStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id));
      const existing = sqlite.prepare("SELECT * FROM food_delivery_admin_riders WHERE id = ?").get(id) as Row | undefined;
      if (!existing) return respondError(res, 404, "Rider not found");
      const status = (req.body as Row)?.status ?? existing.status;
      sqlite.prepare("UPDATE food_delivery_admin_riders SET status = ? WHERE id = ?").run(status, id);
      const updated = sqlite.prepare("SELECT * FROM food_delivery_admin_riders WHERE id = ?").get(id);
      return respond(res, "Rider status updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteRider = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Rider deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ NOTIFICATIONS ============

  const ListNotifications = async (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM food_delivery_admin_notifications").all() as Row[];
      return respond(res, "Notifications retrieved", rows, rows.length);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SaveNotification = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const result = sqlite.prepare("INSERT INTO food_delivery_admin_notifications (title,message,type,audience,status,createdAt) VALUES (?,?,?,?,?,?)").run(
        body.title || "New Notification", body.message || "", body.type || "general",
        body.audience || "all", "unread", new Date().toISOString()
      );
      const newItem = sqlite.prepare("SELECT * FROM food_delivery_admin_notifications WHERE id = ?").get(result.lastInsertRowid);
      return respond(res, "Notification created", newItem);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SendNotification = async (req: Request, res: Response) => {
    try {
      const body = req.body as Row;
      const userCount = (sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_users").get() as { c: number }).c;
      return respond(res, "Notification sent", {
        oneSignalResponse: {
          id: "demo-onesignal-id",
          recipients: body.audience === "all" ? userCount : 1,
          externalId: `demo-ext-${Date.now()}`,
        },
        emailSent: true,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteNotification = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Notification deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ============ APPROVALS ============

  const genericApprove = async (req: Request, res: Response, entity: string) => {
    try {
      const id = parseInt(String(req.params.id));
      if (entity === "artisan") {
        return respond(res, "Artisan approved", { id, name: "Demo Artisan", status: "active" });
      }
      const tableMap: Record<string, string> = {
        vendor: "food_delivery_admin_vendors",
        restaurant: "food_delivery_admin_restaurants",
        rider: "food_delivery_admin_riders",
      };
      const table = tableMap[entity];
      if (!table) return respondError(res, 404, `${entity} not found`);
      const item = sqlite.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as Row | undefined;
      if (!item) return respondError(res, 404, `${entity} not found`);
      sqlite.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run("active", id);
      const updated = sqlite.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
      const label = entity.charAt(0).toUpperCase() + entity.slice(1);
      return respond(res, `${label} approved`, updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const genericReject = async (req: Request, res: Response, entity: string) => {
    try {
      const id = parseInt(String(req.params.id));
      if (entity === "artisan") {
        return respond(res, "Artisan rejected", { id, name: "Demo Artisan", status: "inactive" });
      }
      const tableMap: Record<string, string> = {
        vendor: "food_delivery_admin_vendors",
        restaurant: "food_delivery_admin_restaurants",
        rider: "food_delivery_admin_riders",
      };
      const table = tableMap[entity];
      if (!table) return respondError(res, 404, `${entity} not found`);
      const item = sqlite.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as Row | undefined;
      if (!item) return respondError(res, 404, `${entity} not found`);
      sqlite.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run("inactive", id);
      const updated = sqlite.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
      const label = entity.charAt(0).toUpperCase() + entity.slice(1);
      return respond(res, `${label} rejected`, updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ApproveVendor = async (req: Request, res: Response) => genericApprove(req, res, "vendor");
  const RejectVendor = async (req: Request, res: Response) => genericReject(req, res, "vendor");
  const ApproveArtisan = async (req: Request, res: Response) => genericApprove(req, res, "artisan");
  const RejectArtisan = async (req: Request, res: Response) => genericReject(req, res, "artisan");
  const ApproveRestaurant = async (req: Request, res: Response) => genericApprove(req, res, "restaurant");
  const RejectRestaurant = async (req: Request, res: Response) => genericReject(req, res, "restaurant");
  const ApproveRider = async (req: Request, res: Response) => genericApprove(req, res, "rider");
  const RejectRider = async (req: Request, res: Response) => genericReject(req, res, "rider");

  return {
    Login, Logout, GetMe, UpdateAdminProfile, UpdateAdminPassword,
    GetStat, GetStatChart, GetTopVendors,
    ListUsers, GetUser, UpdateUserStatus,
    ListZones, GetZone, SaveZone, UpdateZone, DeleteZone, UpdateZoneStatus,
    ListRestaurants, GetRestaurant, SaveRestaurant, UpdateRestaurant, UpdateRestaurantStatus, DeleteRestaurant,
    ListVendors, GetVendor, SaveVendor, UpdateVendor, UpdateVendorStatus, DeleteVendor,
    ListProducts, GetProduct, SaveProduct, UpdateProduct, UpdateProductStatus, DeleteProduct,
    ListBanners, GetBanner, SaveBanner, UpdateBanner, DeleteBanner,
    ListPromos, GetPromo, SavePromo, UpdatePromo, DeletePromo,
    ListCoupons, GetCoupon, SaveCoupon, UpdateCoupon, DeleteCoupon, UpdateCouponStatus,
    ListFoodTypes, SaveFoodType, DeleteFoodType,
    ListDeliveryFees, SaveDeliveryFee, UpdateDeliveryFee, DeleteDeliveryFee,
    ListOrders, GetOrder, UpdateOrder, DeleteOrder,
    ListSettings, GetSetting, SaveSetting, UpdateSetting, DeleteSetting,
    ListWallet, GetWallet, SaveWallet, UpdateWallet, DeleteWallet,
    ListRiders, GetRider, SaveRider, UpdateRider, UpdateRiderStatus, DeleteRider,
    ListNotifications, SaveNotification, SendNotification, DeleteNotification,
    ApproveVendor, RejectVendor, ApproveArtisan, RejectArtisan,
    ApproveRestaurant, RejectRestaurant, ApproveRider, RejectRider,
  };
};
