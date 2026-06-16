import { sqlite } from "../../../config/db.js";

export const setupArtisanServicesWebDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS artisan_services_web_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      isVerified INTEGER NOT NULL DEFAULT 0,
      otp TEXT,
      resetToken TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_services_web_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      label TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      isDefault INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS artisan_services_web_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      artisanId INTEGER NOT NULL,
      artisanName TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      amount REAL NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_services_web_appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      artisanId INTEGER NOT NULL,
      artisanName TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_services_web_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_services_web_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      artisanId INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_services_web_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      artisanId INTEGER NOT NULL,
      content TEXT NOT NULL,
      sender TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_services_web_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      isRead INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_services_web_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      reference TEXT NOT NULL UNIQUE,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      description TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_services_web_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      details TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const userCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM artisan_services_web_users")
    .get() as { count: number };

  if (userCount.count > 0) return;

  sqlite
    .prepare(
      `INSERT INTO artisan_services_web_users (name, email, phone, password, isVerified)
       VALUES (@name, @email, @phone, @password, @isVerified)`,
    )
    .run({
      name: "Demo User",
      email: "demo@example.com",
      phone: "08012345678",
      password: "password",
      isVerified: 1,
    });

  sqlite
    .prepare(
      `INSERT INTO artisan_services_web_users (name, email, phone, password, isVerified)
       VALUES (@name, @email, @phone, @password, @isVerified)`,
    )
    .run({
      name: "Jane Doe",
      email: "chioma@example.com",
      phone: "08098765432",
      password: "password",
      isVerified: 1,
    });

  const demoUser = sqlite
    .prepare("SELECT id FROM artisan_services_web_users WHERE email = ?")
    .get("demo@example.com") as { id: number };

  sqlite
    .prepare(
      `INSERT INTO artisan_services_web_addresses (userId, label, address, city, state, isDefault)
       VALUES (@userId, @label, @address, @city, @state, @isDefault)`,
    )
    .run({
      userId: demoUser.id,
      label: "Home",
      address: "15 Adeola Odeku Street",
      city: "Victoria Island",
      state: "Lagos",
      isDefault: 1,
    });

  sqlite
    .prepare(
      `INSERT INTO artisan_services_web_notifications (userId, title, message)
       VALUES (@userId, @title, @message)`,
    )
    .run({
      userId: demoUser.id,
      title: "Welcome to Artisan Services",
      message: "Welcome! Start exploring top-rated artisans near you.",
    });
};
