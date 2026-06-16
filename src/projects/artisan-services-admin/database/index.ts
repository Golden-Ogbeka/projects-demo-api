import { sqlite } from "../../../config/db.js";

export const setupArtisanServicesAdminDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS artisan_services_admin_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      adminId INTEGER NOT NULL,
      details TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS artisan_services_admin_admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      avatar TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const adminCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM artisan_services_admin_admins")
    .get() as { count: number };

  if (adminCount.count > 0) return;

  sqlite
    .prepare(
      `INSERT INTO artisan_services_admin_admins (email, password, name, role)
       VALUES (@email, @password, @name, @role)`,
    )
    .run({
      email: "demo@example.com",
      password: "password",
      name: "Demo Admin",
      role: "superadmin",
    });

  sqlite
    .prepare(
      `INSERT INTO artisan_services_admin_admins (email, password, name, role)
       VALUES (@email, @password, @name, @role)`,
    )
    .run({
      email: "admin2@example.com",
      password: "password",
      name: "Jane Doe",
      role: "admin",
    });

  sqlite
    .prepare(
      `INSERT INTO artisan_services_admin_admins (email, password, name, role)
       VALUES (@email, @password, @name, @role)`,
    )
    .run({
      email: "admin3@example.com",
      password: "password",
      name: "Bob Smith",
      role: "moderator",
    });
};
