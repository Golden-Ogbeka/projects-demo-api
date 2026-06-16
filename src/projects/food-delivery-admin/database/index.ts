import { sqlite } from "../../../config/db.js";

export const setupFoodDeliveryAdminDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS food_delivery_admin_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT,
      method TEXT NOT NULL,
      body TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT, role TEXT, password TEXT, status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, state TEXT, status TEXT, deliveryFee REAL, riderCount INTEGER
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_restaurants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT, phone TEXT, address TEXT,
      status TEXT, rating REAL, image TEXT, zoneId INTEGER, zoneName TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT, phone TEXT, address TEXT,
      status TEXT, productCount INTEGER, rating REAL
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, restaurantId INTEGER, restaurantName TEXT,
      price REAL, category TEXT, status TEXT, image TEXT, stock INTEGER
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNumber TEXT, customerName TEXT, customerPhone TEXT,
      restaurantId INTEGER, restaurantName TEXT,
      totalAmount REAL, deliveryFee REAL,
      status TEXT, paymentStatus TEXT,
      zone TEXT, riderId INTEGER, riderName TEXT,
      createdAt TEXT, items TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER, productId INTEGER,
      productName TEXT, qty INTEGER, price REAL
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT, image TEXT, status TEXT, link TEXT,
      startDate TEXT, endDate TEXT, createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_promos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, discountType TEXT, discountValue REAL,
      code TEXT, status TEXT, minOrder REAL,
      maxDiscount REAL, usageLimit INTEGER,
      usedCount INTEGER, startDate TEXT, endDate TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT, description TEXT, discountType TEXT,
      discountValue REAL, minOrder REAL, status TEXT,
      usageLimit INTEGER, usedCount INTEGER, expiresAt TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_food_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, status TEXT, sortOrder INTEGER
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_delivery_fees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zoneName TEXT, baseFee REAL, perKmFee REAL,
      minDistance REAL, maxDistance REAL, status TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_wallets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT, description TEXT, amount REAL,
      fee REAL, net REAL, status TEXT,
      reference TEXT, createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_riders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT, phone TEXT, status TEXT,
      zoneId INTEGER, zoneName TEXT,
      completedOrders INTEGER, rating REAL,
      vehicleType TEXT, image TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT, message TEXT, type TEXT,
      audience TEXT, status TEXT, createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, status TEXT, priority INTEGER
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_top_vendors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendorId INTEGER, name TEXT,
      totalOrders INTEGER, totalRevenue REAL, rating REAL
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_payout_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendorId INTEGER, vendorName TEXT, amount REAL,
      status TEXT, reference TEXT, createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_customer_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT, customerEmail TEXT, customerPhone TEXT,
      totalAmount REAL, status TEXT, createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_subscription (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      planName TEXT, customerEmail TEXT, amount REAL,
      status TEXT, startDate TEXT, endDate TEXT, createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_review (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT, email TEXT, message TEXT,
      rating INTEGER, createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS food_delivery_admin_complaint (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT, status TEXT, priority TEXT, createdAt TEXT
    );
  `);

  if ((sqlite.prepare("SELECT COUNT(*) as c FROM food_delivery_admin_users").get() as { c: number }).c === 0) {
    const img = (url: string) => url;
    const restaurantImg = img("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600");
    const foodImg = img("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600");
    const bannerImg = img("https://images.unsplash.com/photo-1556742049-0cfed4f06a45?w=1200");
    const vendorImg = img("https://images.unsplash.com/photo-1553413077-190dd305871c?w=200");
    const riderImg = img("https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200");

    const insertUser = sqlite.prepare("INSERT INTO food_delivery_admin_users (name,email,role,password) VALUES (?,?,?,?)");
    insertUser.run("Demo Admin", "demo@example.com", "super_admin", "password");
    insertUser.run("John Doe", "chidi@example.com", "admin", "password");
    insertUser.run("Alice Johnson", "bola@example.com", "manager", "password");
    insertUser.run("Grace Williams", "fatima@example.com", "support", "password");
    insertUser.run("Charlie Brown", "emeka@example.com", "rider_manager", "password");

    const insertZone = sqlite.prepare("INSERT INTO food_delivery_admin_zones (name,state,status,deliveryFee,riderCount) VALUES (?,?,?,?,?)");
    insertZone.run("Ikeja", "Lagos", "active", 500, 12);
    insertZone.run("Victoria Island", "Lagos", "active", 800, 8);
    insertZone.run("Ibadan North", "Oyo", "active", 400, 6);
    insertZone.run("Garki", "Abuja FCT", "inactive", 600, 3);
    insertZone.run("Port Harcourt City", "Rivers", "active", 550, 5);

    const insertRest = sqlite.prepare("INSERT INTO food_delivery_admin_restaurants (name,email,phone,address,status,rating,image,zoneId,zoneName) VALUES (?,?,?,?,?,?,?,?,?)");
    insertRest.run("Demo Chicken Spot", "info@example.com", "+2348010001000", "12 Adeniyi Jones, Ikeja, Lagos", "active", 4.5, restaurantImg, 1, "Ikeja");
    insertRest.run("Demo Grill House", "info@example.com", "+2348010002000", "7 Ahmadu Bello Way, VI, Lagos", "active", 4.7, restaurantImg, 2, "Victoria Island");
    insertRest.run("Demo Place Eatery", "hello@example.com", "+2348010003000", "42 Ring Road, Ibadan", "active", 4.3, restaurantImg, 3, "Ibadan North");
    insertRest.run("Demo Sweets", "info@example.com", "+2348010004000", "15 Wuse Zone 4, Abuja", "active", 4.1, restaurantImg, 4, "Garki");
    insertRest.run("Shawarma Spot NG", "orders@example.com", "+2348010005000", "88 Azikiwe Road, PH City", "inactive", 4.0, restaurantImg, 5, "Port Harcourt City");
    insertRest.run("Demo Kitchen", "mamaput@example.com", "+2348010006000", "3 Market Road, Ibadan", "active", 4.8, restaurantImg, 3, "Ibadan North");

    const insertVendor = sqlite.prepare("INSERT INTO food_delivery_admin_vendors (name,email,phone,address,status,productCount,rating) VALUES (?,?,?,?,?,?,?)");
    insertVendor.run("Fresh Foods Supply Ltd", "fresh@example.com", "+2348020001000", "22 Industrial Estate, Ikeja", "active", 45, 4.6);
    insertVendor.run("Prime Produce Nigeria", "prime@example.com", "+2348020002000", "9 Trade Fair Complex, Lagos", "active", 32, 4.4);
    insertVendor.run("Farm to Table Services", "farm@example.com", "+2348020003000", "55 Agriculture Road, Ibadan", "active", 28, 4.7);
    insertVendor.run("Global Food Distributors", "global@example.com", "+2348020004000", "10 Warehouse Road, Abuja", "inactive", 18, 4.2);

    const insertProduct = sqlite.prepare("INSERT INTO food_delivery_admin_products (name,restaurantId,restaurantName,price,category,status,image,stock) VALUES (?,?,?,?,?,?,?,?)");
    insertProduct.run("Jollof Rice & Chicken", 1, "Demo Chicken Spot", 3500, "Main Meals", "active", foodImg, 50);
    insertProduct.run("Fried Rice & Turkey", 1, "Demo Chicken Spot", 4000, "Main Meals", "active", foodImg, 40);
    insertProduct.run("Pepperoni Pizza Large", 2, "Demo Grill House", 6500, "Pizza", "active", foodImg, 25);
    insertProduct.run("Chicken Shawarma Wrap", 5, "Shawarma Spot NG", 2800, "Fast Food", "active", foodImg, 35);
    insertProduct.run("Pounded Yam & Egusi Soup", 6, "Demo Kitchen", 3200, "Local Dishes", "active", foodImg, 30);
    insertProduct.run("Banga Rice & Catfish", 6, "Demo Kitchen", 3500, "Local Dishes", "active", foodImg, 20);
    insertProduct.run("Grilled Chicken Half", 3, "Demo Place Eatery", 5500, "Grills", "active", foodImg, 15);
    insertProduct.run("Chicken Burger Meal", 4, "Demo Sweets", 3800, "Fast Food", "active", foodImg, 28);
    insertProduct.run("Pepper Soup (Catfish)", 3, "Demo Place Eatery", 4500, "Soups", "active", foodImg, 18);
    insertProduct.run("Suya Platter", 5, "Shawarma Spot NG", 5000, "Grills", "active", foodImg, 12);

    const insertOrder = sqlite.prepare("INSERT INTO food_delivery_admin_orders (orderNumber,customerName,customerPhone,restaurantId,restaurantName,totalAmount,deliveryFee,status,paymentStatus,zone,riderId,riderName,createdAt,items) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    insertOrder.run("ORD-1001", "Frank Miller", "+2348030001001", 1, "Demo Chicken Spot", 7500, 500, "delivered", "paid", "Ikeja", 1, "John Rider", "2026-06-01T10:30:00.000Z", JSON.stringify([{ productId: 1, productName: "Jollof Rice & Chicken", qty: 1, price: 3500 }, { productId: 2, productName: "Fried Rice & Turkey", qty: 1, price: 4000 }]));
    insertOrder.run("ORD-1002", "Helen Davis", "+2348030002002", 2, "Demo Grill House", 6500, 800, "preparing", "paid", "Victoria Island", null, null, "2026-06-02T12:15:00.000Z", JSON.stringify([{ productId: 3, productName: "Pepperoni Pizza Large", qty: 1, price: 6500 }]));
    insertOrder.run("ORD-1003", "Ivy Moore", "+2348030003003", 6, "Demo Kitchen", 6700, 400, "pending", "unpaid", "Ibadan North", null, null, "2026-06-02T14:00:00.000Z", JSON.stringify([{ productId: 5, productName: "Pounded Yam & Egusi Soup", qty: 1, price: 3200 }, { productId: 6, productName: "Banga Rice & Catfish", qty: 1, price: 3500 }]));
    insertOrder.run("ORD-1004", "Jack Taylor", "+2348030004004", 5, "Shawarma Spot NG", 2800, 550, "assigned", "paid", "Port Harcourt City", 2, "Bob Courier", "2026-06-02T09:45:00.000Z", JSON.stringify([{ productId: 4, productName: "Chicken Shawarma Wrap", qty: 1, price: 2800 }]));
    insertOrder.run("ORD-1005", "Karen Anderson", "+2348030005005", 3, "Demo Place Eatery", 10000, 400, "delivered", "paid", "Ibadan North", 3, "Alice Driver", "2026-06-01T18:00:00.000Z", JSON.stringify([{ productId: 7, productName: "Grilled Chicken Half", qty: 1, price: 5500 }, { productId: 9, productName: "Pepper Soup (Catfish)", qty: 1, price: 4500 }]));
    insertOrder.run("ORD-1006", "Laura Thomas", "+2348030006006", 4, "Demo Sweets", 3800, 600, "cancelled", "refunded", "Garki", null, null, "2026-05-31T16:20:00.000Z", JSON.stringify([{ productId: 8, productName: "Chicken Burger Meal", qty: 1, price: 3800 }]));

    const insertBanner = sqlite.prepare("INSERT INTO food_delivery_admin_banners (title,image,status,link,startDate,endDate,createdAt) VALUES (?,?,?,?,?,?,?)");
    insertBanner.run("Summer Special - 20% Off", bannerImg, "active", "/promos/summer", "2026-06-01T00:00:00.000Z", "2026-06-30T23:59:59.000Z", "2026-05-25T10:00:00.000Z");
    insertBanner.run("New Restaurants Added", bannerImg, "active", "/restaurants", "2026-06-01T00:00:00.000Z", "2026-07-15T23:59:59.000Z", "2026-05-28T10:00:00.000Z");
    insertBanner.run("Free Delivery This Weekend", bannerImg, "inactive", "/promos/free-delivery", "2026-05-01T00:00:00.000Z", "2026-05-31T23:59:59.000Z", "2026-04-28T10:00:00.000Z");

    const insertPromo = sqlite.prepare("INSERT INTO food_delivery_admin_promos (name,discountType,discountValue,code,status,minOrder,maxDiscount,usageLimit,usedCount,startDate,endDate) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
    insertPromo.run("Summer Sale", "percentage", 20, "SUMMER20", "active", 3000, 2000, 500, 87, "2026-06-01T00:00:00.000Z", "2026-06-30T23:59:59.000Z");
    insertPromo.run("First Order Discount", "percentage", 15, "FIRST15", "active", 2000, 1500, 1000, 312, "2026-01-01T00:00:00.000Z", "2026-12-31T23:59:59.000Z");
    insertPromo.run("Weekend Special", "fixed", 500, "WEEKEND500", "inactive", 2500, 500, 200, 45, "2026-05-01T00:00:00.000Z", "2026-05-31T23:59:59.000Z");

    const insertCoupon = sqlite.prepare("INSERT INTO food_delivery_admin_coupons (code,description,discountType,discountValue,minOrder,status,usageLimit,usedCount,expiresAt) VALUES (?,?,?,?,?,?,?,?,?)");
    insertCoupon.run("CHICKEN100", "N100 off Chicken Republic orders", "fixed", 100, 2000, "active", 300, 45, "2026-12-31T23:59:59.000Z");
    insertCoupon.run("FREEDELIVERY", "Free delivery on orders above N5000", "free_delivery", 0, 5000, "active", 200, 23, "2026-09-30T23:59:59.000Z");
    insertCoupon.run("WELCOME500", "N500 off your first order", "fixed", 500, 3000, "active", 500, 210, "2026-12-31T23:59:59.000Z");

    const insertFoodType = sqlite.prepare("INSERT INTO food_delivery_admin_food_types (name,status,sortOrder) VALUES (?,?,?)");
    insertFoodType.run("Nigerian", "active", 1);
    insertFoodType.run("Italian", "active", 2);
    insertFoodType.run("Chinese", "active", 3);
    insertFoodType.run("Fast Food", "active", 4);
    insertFoodType.run("Pastries & Bakery", "active", 5);
    insertFoodType.run("Drinks & Beverages", "active", 6);

    const insertDF = sqlite.prepare("INSERT INTO food_delivery_admin_delivery_fees (zoneName,baseFee,perKmFee,minDistance,maxDistance,status) VALUES (?,?,?,?,?,?)");
    insertDF.run("Ikeja", 500, 100, 1, 15, "active");
    insertDF.run("Victoria Island", 800, 150, 1, 10, "active");
    insertDF.run("Ibadan North", 400, 80, 1, 20, "active");
    insertDF.run("Garki", 600, 120, 1, 12, "active");
    insertDF.run("Port Harcourt City", 550, 100, 1, 18, "active");

    sqlite.prepare("INSERT INTO food_delivery_admin_settings (data) VALUES (?)").run(JSON.stringify({
      appName: "Food Delivery",
      currency: "NGN",
      currencySymbol: "N",
      taxRate: 7.5,
      deliveryRadiusKm: 20,
      maxOrderItems: 20,
      minOrderAmount: 500,
      supportEmail: "support@example.com",
      supportPhone: "+2349000000000",
      oneSignalAppId: "demo-onesignal-app-id",
      enableGuestCheckout: true,
      enableSMSNotifications: true,
      enableEmailNotifications: true,
      orderAutoAssignInterval: 5,
    }));

    const insertWallet = sqlite.prepare("INSERT INTO food_delivery_admin_wallets (type,description,amount,fee,net,status,reference,createdAt) VALUES (?,?,?,?,?,?,?,?)");
    insertWallet.run("order_payment", "Payment for order ORD-1001", 7500, 150, 7350, "completed", "TXN-001", "2026-06-01T10:35:00.000Z");
    insertWallet.run("order_payment", "Payment for order ORD-1002", 6500, 130, 6370, "completed", "TXN-002", "2026-06-02T12:20:00.000Z");
    insertWallet.run("withdrawal", "Vendor payout - Chicken Republic", 50000, 250, 49750, "pending", "TXN-003", "2026-06-02T09:00:00.000Z");
    insertWallet.run("refund", "Refund for cancelled order ORD-1006", 3800, 0, 3800, "completed", "TXN-004", "2026-05-31T16:25:00.000Z");
    insertWallet.run("order_payment", "Payment for order ORD-1005", 10000, 200, 9800, "completed", "TXN-005", "2026-06-01T18:05:00.000Z");
    insertWallet.run("order_payment", "Payment for order ORD-1004", 2800, 56, 2744, "pending", "TXN-006", "2026-06-02T09:50:00.000Z");

    const insertRider = sqlite.prepare("INSERT INTO food_delivery_admin_riders (name,email,phone,status,zoneId,zoneName,completedOrders,rating,vehicleType,image) VALUES (?,?,?,?,?,?,?,?,?,?)");
    insertRider.run("John Rider", "musa@example.com", "+2348050001001", "online", 1, "Ikeja", 345, 4.8, "motorcycle", riderImg);
    insertRider.run("Bob Courier", "emeka@example.com", "+2348050002002", "busy", 5, "Port Harcourt City", 212, 4.6, "motorcycle", riderImg);
    insertRider.run("Alice Driver", "taiwo@example.com", "+2348050003003", "online", 3, "Ibadan North", 178, 4.9, "bicycle", riderImg);
    insertRider.run("Charlie Delivery", "chinedu@example.com", "+2348050004004", "offline", 2, "Victoria Island", 290, 4.5, "motorcycle", riderImg);
    insertRider.run("Diana Logistics", "aisha@example.com", "+2348050005005", "online", 4, "Garki", 156, 4.7, "motorcycle", riderImg);
    insertRider.run("Frank Transporter", "segun@example.com", "+2348050006006", "busy", 1, "Ikeja", 98, 4.3, "motorcycle", riderImg);

    const insertNotif = sqlite.prepare("INSERT INTO food_delivery_admin_notifications (title,message,type,audience,status,createdAt) VALUES (?,?,?,?,?,?)");
    insertNotif.run("New Order #ORD-1004", "A new order has been placed", "order", "all", "unread", "2026-06-02T09:45:00.000Z");
    insertNotif.run("Vendor Approval Pending", "New vendor registration requires approval", "vendor", "admin", "unread", "2026-06-01T14:30:00.000Z");
    insertNotif.run("Rider Available", "Rider Segun Adewale is now online", "rider", "all", "read", "2026-05-31T08:00:00.000Z");

    sqlite.prepare("INSERT INTO food_delivery_admin_categories (name,status,priority) VALUES (?,?,?)").run("Nigerian", "active", 1);
    sqlite.prepare("INSERT INTO food_delivery_admin_categories (name,status,priority) VALUES (?,?,?)").run("Italian", "active", 2);

    sqlite.prepare("INSERT INTO food_delivery_admin_top_vendors (vendorId,name,totalOrders,totalRevenue,rating) VALUES (?,?,?,?,?)").run(1, "Fresh Foods Supply Ltd", 156, 425000, 4.6);
    sqlite.prepare("INSERT INTO food_delivery_admin_top_vendors (vendorId,name,totalOrders,totalRevenue,rating) VALUES (?,?,?,?,?)").run(2, "Prime Produce Nigeria", 98, 312000, 4.4);
    sqlite.prepare("INSERT INTO food_delivery_admin_top_vendors (vendorId,name,totalOrders,totalRevenue,rating) VALUES (?,?,?,?,?)").run(3, "Farm to Table Services", 74, 198000, 4.7);
    sqlite.prepare("INSERT INTO food_delivery_admin_top_vendors (vendorId,name,totalOrders,totalRevenue,rating) VALUES (?,?,?,?,?)").run(4, "Global Food Distributors", 42, 89000, 4.2);

    sqlite.prepare("INSERT INTO food_delivery_admin_payout_history (vendorId,vendorName,amount,status,reference,createdAt) VALUES (?,?,?,?,?,?)").run(1, "Fresh Foods Supply Ltd", 425000, "completed", "POUT-001", "2026-06-01T00:00:00.000Z");
    sqlite.prepare("INSERT INTO food_delivery_admin_payout_history (vendorId,vendorName,amount,status,reference,createdAt) VALUES (?,?,?,?,?,?)").run(2, "Prime Produce Nigeria", 312000, "pending", "POUT-002", "2026-06-02T00:00:00.000Z");

    sqlite.prepare("INSERT INTO food_delivery_admin_customer_orders (customerName,customerEmail,customerPhone,totalAmount,status,createdAt) VALUES (?,?,?,?,?,?)").run("Frank Miller", "tunde@example.com", "+2348030001001", 7500, "delivered", "2026-06-01T10:30:00.000Z");
    sqlite.prepare("INSERT INTO food_delivery_admin_customer_orders (customerName,customerEmail,customerPhone,totalAmount,status,createdAt) VALUES (?,?,?,?,?,?)").run("Helen Davis", "amina@example.com", "+2348030002002", 6500, "preparing", "2026-06-02T12:15:00.000Z");

    sqlite.prepare("INSERT INTO food_delivery_admin_subscription (planName,customerEmail,amount,status,startDate,endDate,createdAt) VALUES (?,?,?,?,?,?,?)").run("Monthly Premium", "vendor@example.com", 15000, "active", "2026-06-01T00:00:00.000Z", "2026-07-01T00:00:00.000Z", "2026-06-01T00:00:00.000Z");
    sqlite.prepare("INSERT INTO food_delivery_admin_subscription (planName,customerEmail,amount,status,startDate,endDate,createdAt) VALUES (?,?,?,?,?,?,?)").run("Annual Basic", "restaurant@example.com", 100000, "active", "2026-01-01T00:00:00.000Z", "2027-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z");

    sqlite.prepare("INSERT INTO food_delivery_admin_review (name,email,message,rating,createdAt) VALUES (?,?,?,?,?)").run("John Doe", "john@example.com", "Great service!", 5, "2026-06-01T10:00:00.000Z");
    sqlite.prepare("INSERT INTO food_delivery_admin_review (name,email,message,rating,createdAt) VALUES (?,?,?,?,?)").run("Jane Smith", "jane@example.com", "Fast delivery and good food", 4, "2026-06-02T12:00:00.000Z");

    sqlite.prepare("INSERT INTO food_delivery_admin_complaint (subject,status,priority,createdAt) VALUES (?,?,?,?)").run("Late delivery", "open", "high", "2026-06-01T10:00:00.000Z");
    sqlite.prepare("INSERT INTO food_delivery_admin_complaint (subject,status,priority,createdAt) VALUES (?,?,?,?)").run("Wrong order received", "open", "medium", "2026-06-02T14:00:00.000Z");
  }
};

export const recordFoodDeliveryAdminEvent = (endpoint: string, method: string, body: unknown) => {
  sqlite.prepare(`
    INSERT INTO food_delivery_admin_events (endpoint, method, body)
    VALUES (?, ?, ?)
  `).run(endpoint, method, body ? JSON.stringify(body) : null);
};
