import { sqlite } from "../../../config/db.js";

export const setupLogisticsClientDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS logistics_client_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL,
      otp TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logistics_client_packaging (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      dimensions TEXT NOT NULL,
      price REAL NOT NULL,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_client_shipping (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      weight REAL NOT NULL,
      packaging_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      pickup_date TEXT,
      delivered_date TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_client_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'Nigeria',
      phone TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_client_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      payload TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logistics_client_parcels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Add data column to existing tables for backward compatibility
  try { sqlite.exec("ALTER TABLE logistics_client_packaging ADD COLUMN data TEXT"); } catch {}
  try { sqlite.exec("ALTER TABLE logistics_client_shipping ADD COLUMN data TEXT"); } catch {}
  try { sqlite.exec("ALTER TABLE logistics_client_addresses ADD COLUMN data TEXT"); } catch {}

  const userCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM logistics_client_users")
    .get() as { count: number };

  if (userCount.count === 0) {
    sqlite
      .prepare(
        "INSERT INTO logistics_client_users (name, email, phone, password) VALUES (@name, @email, @phone, @password)",
      )
      .run({
        name: "Demo Customer",
        email: "demo@demo.com",
        phone: "+2348012345678",
        password: "password",
      });
  }

  const packagingCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM logistics_client_packaging")
    .get() as { count: number };

  if (packagingCount.count === 0) {
    const insert = sqlite.prepare(
      "INSERT INTO logistics_client_packaging (name, description, dimensions, price, data) VALUES (@name, @description, @dimensions, @price, @data)",
    );
    [
      {
        name: "Box",
        description: "Standard cardboard box for general items",
        dimensions: "40cm x 30cm x 20cm",
        price: 3500,
        data: JSON.stringify({
          _id: "1", userId: "1", name: "Electronics Box", type: "Box",
          height: "30", length: "40", width: "20", weight: "5",
          sizeUnit: "cm", weightUnit: "kg", packagingId: "1",
          createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      },
      {
        name: "Envelope",
        description: "Lightweight envelope for documents and flat items",
        dimensions: "35cm x 25cm",
        price: 1500,
        data: JSON.stringify({
          _id: "2", userId: "1", name: "Document Envelope", type: "Envelope",
          height: "2", length: "35", width: "25", weight: "0.5",
          sizeUnit: "cm", weightUnit: "kg", packagingId: "2",
          createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      },
      {
        name: "Carton",
        description: "Large carton for bulky items",
        dimensions: "60cm x 40cm x 40cm",
        price: 5500,
        data: JSON.stringify({
          _id: "3", userId: "1", name: "Large Carton", type: "Carton",
          height: "40", length: "60", width: "40", weight: "10",
          sizeUnit: "cm", weightUnit: "kg", packagingId: "3",
          createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      },
      {
        name: "Crate",
        description: "Wooden crate for heavy or fragile goods",
        dimensions: "80cm x 50cm x 50cm",
        price: 8500,
        data: JSON.stringify({
          _id: "4", userId: "1", name: "Wooden Crate", type: "Crate",
          height: "50", length: "80", width: "50", weight: "15",
          sizeUnit: "cm", weightUnit: "kg", packagingId: "4",
          createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      },
      {
        name: "Pallet",
        description: "Full pallet for large freight shipments",
        dimensions: "120cm x 100cm x 120cm",
        price: 15000,
        data: JSON.stringify({
          _id: "5", userId: "1", name: "Freight Pallet", type: "Pallet",
          height: "120", length: "120", width: "100", weight: "25",
          sizeUnit: "cm", weightUnit: "kg", packagingId: "5",
          createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      },
    ].forEach((p) => insert.run(p));
  }

  const parcelCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM logistics_client_parcels")
    .get() as { count: number };

  if (parcelCount.count === 0) {
    const insert = sqlite.prepare(
      "INSERT INTO logistics_client_parcels (user_id, data) VALUES (@user_id, @data)",
    );
    [
      {
        user_id: 1,
        data: JSON.stringify({
          _id: "1", userId: "1",
          description: "Gadgets and accessories",
          metadata: { message: "Handle with care" },
          items: [
            { description: "iPhone 15", name: "Phone", currency: "NGN", value: 850000, quantity: 2, weight: 0.5 },
            { description: "Charger", name: "Charger", currency: "NGN", value: 15000, quantity: 2, weight: 0.2 },
          ],
          parcelId: "1", weightUnit: "kg", packagingDocId: "1",
          createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      },
      {
        user_id: 1,
        data: JSON.stringify({
          _id: "2", userId: "1",
          description: "Important documents",
          metadata: { message: "" },
          items: [
            { description: "Signed contracts", name: "Document", currency: "NGN", value: 0, quantity: 5, weight: 0.1 },
          ],
          parcelId: "2", weightUnit: "kg", packagingDocId: "2",
          createdAt: "2024-01-02T00:00:00.000Z", updatedAt: "2024-01-02T00:00:00.000Z",
        }),
      },
      {
        user_id: 1,
        data: JSON.stringify({
          _id: "3", userId: "1",
          description: "Clothing items",
          metadata: { message: "Fragile" },
          items: [
            { description: "Designer shirts", name: "Shirt", currency: "NGN", value: 50000, quantity: 3, weight: 1.0 },
            { description: "Leather shoes", name: "Shoes", currency: "NGN", value: 35000, quantity: 2, weight: 1.5 },
          ],
          parcelId: "3", weightUnit: "kg", packagingDocId: "3",
          createdAt: "2024-01-03T00:00:00.000Z", updatedAt: "2024-01-03T00:00:00.000Z",
        }),
      },
    ].forEach((p) => insert.run(p));
  }

  const shippingCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM logistics_client_shipping")
    .get() as { count: number };

  if (shippingCount.count === 0) {
    const insert = sqlite.prepare(
      "INSERT INTO logistics_client_shipping (tracking_number, user_id, origin, destination, weight, packaging_id, status, pickup_date, delivered_date, data) VALUES (@tracking_number, @user_id, @origin, @destination, @weight, @packaging_id, @status, @pickup_date, @delivered_date, @data)",
    );
    [
      {
        tracking_number: "SPL-2024-001", user_id: 1, origin: "Lagos, Nigeria", destination: "Abuja, Nigeria",
        weight: 2.5, packaging_id: 1, status: "delivered", pickup_date: "2024-01-10", delivered_date: "2024-01-15",
        data: JSON.stringify({
          _id: "1", userId: "1", shipmentPurpose: "Personal Effects", parcel: "1",
          metadata: { message: "" }, addressToId: "1", addressFromId: "2", addressReturnId: "2",
          status: "delivered", shipmentId: "1", events: [],
          createdAt: "2024-01-05T00:00:00.000Z", updatedAt: "2024-01-10T00:00:00.000Z",
        }),
      },
      {
        tracking_number: "SPL-2024-002", user_id: 1, origin: "Port Harcourt, Nigeria", destination: "Lagos, Nigeria",
        weight: 5.0, packaging_id: 2, status: "in-transit", pickup_date: "2024-01-18", delivered_date: null,
        data: JSON.stringify({
          _id: "2", userId: "1", shipmentPurpose: "Business", parcel: "2",
          metadata: { message: "Urgent delivery" }, addressToId: "1", addressFromId: "2", addressReturnId: "2",
          status: "in-transit", shipmentId: "2", events: [],
          createdAt: "2024-01-15T00:00:00.000Z", updatedAt: "2024-01-16T00:00:00.000Z",
        }),
      },
      {
        tracking_number: "SPL-2024-003", user_id: 1, origin: "Lagos, Nigeria", destination: "Enugu, Nigeria",
        weight: 1.0, packaging_id: 1, status: "picked-up", pickup_date: "2024-01-20", delivered_date: null,
        data: JSON.stringify({
          _id: "3", userId: "1", shipmentPurpose: "Gift", parcel: "3",
          metadata: { message: "" }, addressToId: "1", addressFromId: "2", addressReturnId: "2",
          status: "pending", shipmentId: "3", events: [],
          createdAt: "2024-01-20T00:00:00.000Z", updatedAt: "2024-01-20T00:00:00.000Z",
        }),
      },
      {
        tracking_number: "SPL-2024-004", user_id: 1, origin: "Abuja, Nigeria", destination: "Lagos, Nigeria",
        weight: 10.0, packaging_id: 3, status: "pending", pickup_date: null, delivered_date: null, data: null,
      },
      {
        tracking_number: "SPL-2024-005", user_id: 1, origin: "Ibadan, Nigeria", destination: "Kano, Nigeria",
        weight: 8.0, packaging_id: 2, status: "delivered", pickup_date: "2024-01-05", delivered_date: "2024-01-12", data: null,
      },
      {
        tracking_number: "SPL-2024-006", user_id: 1, origin: "Lagos, Nigeria", destination: "Port Harcourt, Nigeria",
        weight: 3.0, packaging_id: 1, status: "in-transit", pickup_date: "2024-01-22", delivered_date: null, data: null,
      },
    ].forEach((s) => insert.run(s));
  }

  const addressCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM logistics_client_addresses")
    .get() as { count: number };

  if (addressCount.count === 0) {
    const insert = sqlite.prepare(
      "INSERT INTO logistics_client_addresses (user_id, label, street, city, state, country, phone, is_default, data) VALUES (@user_id, @label, @street, @city, @state, @country, @phone, @is_default, @data)",
    );
    [
      {
        user_id: 1, label: "Home",
        street: "15a Awolowo Road", city: "Lagos", state: "Lagos", country: "Nigeria",
        phone: "+2348012345678", is_default: 1,
        data: JSON.stringify({
          _id: "1", userId: "1", packagingDocId: "1",
          firstName: "John", lastName: "Doe", email: "john@example.com", phone: "+2348012345678",
          line1: "15a Awolowo Road, Ikeja", line2: "", country: "NG", state: "Lagos", city: "Ikeja",
          isResidential: true, metadata: { message: "" }, zip: "100001", name: "Home", addressId: "1",
          createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      },
      {
        user_id: 1, label: "Office",
        street: "42 Admiralty Way, Lekki Phase 1", city: "Lagos", state: "Lagos", country: "Nigeria",
        phone: "+2348012345678", is_default: 0,
        data: JSON.stringify({
          _id: "2", userId: "1", packagingDocId: "1",
          firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "+2348098765432",
          line1: "42 Admiralty Way, Lekki Phase 1", line2: "", country: "NG", state: "Lagos", city: "Lekki",
          isResidential: false, metadata: { message: "" }, zip: "105102", name: "Office", addressId: "2",
          createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      },
      {
        user_id: 1, label: "Warehouse",
        street: "Plot 7 Trans-Amadi Industrial Layout", city: "Port Harcourt", state: "Rivers", country: "Nigeria",
        phone: "+2348098765432", is_default: 0,
        data: JSON.stringify({
          _id: "3", userId: "1", packagingDocId: "2",
          firstName: "Bob", lastName: "Johnson", email: "bob@example.com", phone: "+2348055555555",
          line1: "7 Trans-Amadi Industrial Layout", line2: "", country: "NG", state: "Rivers", city: "Port Harcourt",
          isResidential: false, metadata: { message: "" }, zip: "500001", name: "Warehouse", addressId: "3",
          createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      },
    ].forEach((a) => insert.run(a));
  }
};
