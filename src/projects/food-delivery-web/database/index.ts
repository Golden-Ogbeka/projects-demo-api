import { sqlite } from "../../../config/db.js";

export const setupFoodDeliveryWebDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS food_delivery_web_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      otp TEXT,
      otpExpiresAt TEXT,
      resetToken TEXT,
      verifyCode TEXT,
      isVerified INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_delivery_web_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      label TEXT NOT NULL,
      address TEXT NOT NULL,
      lat REAL NOT NULL DEFAULT 0,
      lng REAL NOT NULL DEFAULT 0,
      isDefault INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS food_delivery_web_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      restaurantId INTEGER NOT NULL,
      restaurantName TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total REAL NOT NULL,
      deliveryAddress TEXT NOT NULL,
      paymentMethod TEXT NOT NULL DEFAULT 'paystack',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS food_delivery_web_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      foodId INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS food_delivery_web_cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      foodId INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      restaurantId INTEGER NOT NULL,
      restaurantName TEXT NOT NULL,
      image TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS food_delivery_web_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const userCount = sqlite.prepare("SELECT COUNT(*) as count FROM food_delivery_web_users").get() as { count: number };
  if (userCount.count > 0) return;

  sqlite.prepare(
    `INSERT INTO food_delivery_web_users (name, email, phone, password, isVerified)
     VALUES (@name, @email, @phone, @password, @isVerified)`,
  ).run({
    name: "Demo User",
    email: "demo@demo.com",
    phone: "+2348012345678",
    password: "password",
    isVerified: 1,
  });

  sqlite.prepare(
    `INSERT INTO food_delivery_web_addresses (userId, label, address, lat, lng, isDefault)
     VALUES (@userId, @label, @address, @lat, @lng, @isDefault)`,
  ).run({
    userId: 1,
    label: "Home",
    address: "12 Admiralty Way, Lekki Phase 1, Lagos",
    lat: 6.4489,
    lng: 3.4697,
    isDefault: 1,
  });

  sqlite.prepare(
    `INSERT INTO food_delivery_web_addresses (userId, label, address, lat, lng, isDefault)
     VALUES (@userId, @label, @address, @lat, @lng, @isDefault)`,
  ).run({
    userId: 1,
    label: "Office",
    address: "25 Awolowo Road, Ikoyi, Lagos",
    lat: 6.4529,
    lng: 3.4358,
    isDefault: 0,
  });

  sqlite.prepare(
    `INSERT INTO food_delivery_web_orders (userId, restaurantId, restaurantName, status, total, deliveryAddress, paymentMethod, createdAt)
     VALUES (@userId, @restaurantId, @restaurantName, @status, @total, @deliveryAddress, @paymentMethod, @createdAt)`,
  ).run({
    userId: 1,
    restaurantId: 1,
    restaurantName: "Mama Cass Kitchen",
    status: "delivered",
    total: 6500,
    deliveryAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",
    paymentMethod: "paystack",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  });

  sqlite.prepare(
    `INSERT INTO food_delivery_web_order_items (orderId, foodId, name, price, quantity)
     VALUES (@orderId, @foodId, @name, @price, @quantity)`,
  ).run({ orderId: 1, foodId: 1, name: "Jollof Rice & Chicken", price: 3500, quantity: 1 });

  sqlite.prepare(
    `INSERT INTO food_delivery_web_order_items (orderId, foodId, name, price, quantity)
     VALUES (@orderId, @foodId, @name, @price, @quantity)`,
  ).run({ orderId: 1, foodId: 2, name: "Moi Moi", price: 1500, quantity: 2 });

  sqlite.prepare(
    `INSERT INTO food_delivery_web_orders (userId, restaurantId, restaurantName, status, total, deliveryAddress, paymentMethod, createdAt)
     VALUES (@userId, @restaurantId, @restaurantName, @status, @total, @deliveryAddress, @paymentMethod, @createdAt)`,
  ).run({
    userId: 1,
    restaurantId: 3,
    restaurantName: "Chicken Capital",
    status: "preparing",
    total: 9800,
    deliveryAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",
    paymentMethod: "paystack",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  });

  sqlite.prepare(
    `INSERT INTO food_delivery_web_order_items (orderId, foodId, name, price, quantity)
     VALUES (@orderId, @foodId, @name, @price, @quantity)`,
  ).run({ orderId: 2, foodId: 10, name: "Full Chicken Meal", price: 6500, quantity: 1 });

  sqlite.prepare(
    `INSERT INTO food_delivery_web_order_items (orderId, foodId, name, price, quantity)
     VALUES (@orderId, @foodId, @name, @price, @quantity)`,
  ).run({ orderId: 2, foodId: 11, name: "Chicken Chips", price: 3300, quantity: 1 });

  sqlite.prepare(
    `INSERT INTO food_delivery_web_events (type, description) VALUES ('db_seed', 'Food Delivery Web database seeded successfully')`,
  ).run();
};
