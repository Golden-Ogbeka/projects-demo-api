import { sqlite } from "../../../config/db.js";

export const setupLogisticsWebDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS logistics_web_graphql_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_name TEXT,
      root_fields TEXT NOT NULL,
      variables TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logistics_web_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      userId TEXT,
      email TEXT,
      password TEXT NOT NULL DEFAULT 'password',
      firstName TEXT,
      lastName TEXT,
      fullName TEXT,
      name TEXT,
      phoneNumber TEXT,
      phone TEXT,
      isVerified INTEGER DEFAULT 1,
      accountType TEXT DEFAULT 'personal',
      profilePicture TEXT,
      role TEXT DEFAULT 'CUSTOMER',
      referralCode TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_web_parcels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      parcelId TEXT,
      trackingNumber TEXT,
      name TEXT,
      description TEXT,
      weight REAL,
      weightUnit TEXT DEFAULT 'kg',
      status TEXT,
      origin_city TEXT,
      origin_country TEXT,
      destination_city TEXT,
      destination_country TEXT,
      senderName TEXT,
      senderPhone TEXT,
      receiverName TEXT,
      receiverPhone TEXT,
      shippingPrice REAL,
      currency TEXT DEFAULT 'NGN',
      estimatedDelivery TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      deliveredAt TEXT,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_web_shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT NOT NULL,
      user_id TEXT,
      courierPartner TEXT,
      shipmentType TEXT,
      shipmentStatus TEXT,
      amount REAL,
      paymentStatus TEXT DEFAULT 'AWAITING_PAYMENT',
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_web_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      type TEXT,
      amount REAL,
      status TEXT,
      reference TEXT,
      description TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_web_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      userId TEXT,
      message TEXT,
      isRead INTEGER DEFAULT 0,
      type TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_web_countries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      isoCode TEXT NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS logistics_web_cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      countryCode TEXT NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS logistics_web_pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pricing_group TEXT NOT NULL DEFAULT 'interCity',
      from_loc TEXT NOT NULL DEFAULT '',
      to_loc TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL DEFAULT 0,
      currency TEXT DEFAULT 'NGN',
      estimatedDays TEXT,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_web_wallet (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT NOT NULL,
      userId TEXT,
      balance REAL DEFAULT 0,
      currency TEXT DEFAULT 'NGN',
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_web_business_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      businessName TEXT,
      businessEmail TEXT,
      businessPhone TEXT,
      businessAddress TEXT,
      registrationNumber TEXT,
      businessType TEXT,
      ownerId TEXT,
      isVerified INTEGER DEFAULT 1,
      createdAt TEXT
    );
  `);

  const userCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_web_users").get() as { count: number };
  if (userCount.count > 0) return;

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

  // --- Seed users ---
  sqlite.prepare(`
    INSERT INTO logistics_web_users (_id, userId, email, password, firstName, lastName, fullName, name, phoneNumber, phone, isVerified, accountType, profilePicture, role, createdAt, updatedAt)
    VALUES (@_id, @userId, @email, @password, @firstName, @lastName, @fullName, @name, @phoneNumber, @phone, @isVerified, @accountType, @profilePicture, @role, @createdAt, @updatedAt)
  `).run({
    _id: "ship-user-1",
    userId: "ship-user-1",
    email: "demo@demo.com",
    password: "password",
    firstName: "Demo",
    lastName: "User",
    fullName: "Demo User",
    name: "Demo User",
    phoneNumber: "+2348012345678",
    phone: "+2348012345678",
    isVerified: 1,
    accountType: "personal",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    role: "CUSTOMER",
    createdAt: daysAgo(30),
    updatedAt: daysAgo(0),
  });

  // --- Seed business accounts ---
  sqlite.prepare(`
    INSERT INTO logistics_web_business_accounts (_id, businessName, businessEmail, businessPhone, businessAddress, registrationNumber, businessType, ownerId, isVerified, createdAt)
    VALUES (@_id, @businessName, @businessEmail, @businessPhone, @businessAddress, @registrationNumber, @businessType, @ownerId, @isVerified, @createdAt)
  `).run({
    _id: "ship-business-1",
    businessName: "Demo Shipping Ltd",
    businessEmail: "business@shipplug.africa",
    businessPhone: "+2348098765432",
    businessAddress: "42 Marina Street, Lagos",
    registrationNumber: "RC-1234567",
    businessType: "logistics",
    ownerId: "ship-user-1",
    isVerified: 1,
    createdAt: daysAgo(20),
  });

  // --- Seed parcels ---
  const parcelStmt = sqlite.prepare(`
    INSERT INTO logistics_web_parcels (_id, parcelId, trackingNumber, name, description, weight, weightUnit, status, origin_city, origin_country, destination_city, destination_country, senderName, senderPhone, receiverName, receiverPhone, shippingPrice, currency, estimatedDelivery, createdAt, updatedAt, deliveredAt, data)
    VALUES (@_id, @parcelId, @trackingNumber, @name, @description, @weight, @weightUnit, @status, @origin_city, @origin_country, @destination_city, @destination_country, @senderName, @senderPhone, @receiverName, @receiverPhone, @shippingPrice, @currency, @estimatedDelivery, @createdAt, @updatedAt, @deliveredAt, @data)
  `);

  const parcels = [
    {
      _id: "parcel-1", parcelId: "SA-1001", trackingNumber: "SA-1001-NG-LA",
      name: "Electronics Package", description: "Laptop and accessories",
      weight: 2.5, weightUnit: "kg", status: "in-transit",
      origin_city: "Lagos", origin_country: "Nigeria",
      destination_city: "Abuja", destination_country: "Nigeria",
      senderName: "Demo User", senderPhone: "+2348012345678",
      receiverName: "Abiola Receiver", receiverPhone: "+2348091111111",
      shippingPrice: 4500, currency: "NGN",
      estimatedDelivery: daysAgo(-2), createdAt: daysAgo(3), updatedAt: daysAgo(1), deliveredAt: null,
      data: JSON.stringify({ dimensions: { length: 40, width: 30, height: 10, unit: "cm" } }),
    },
    {
      _id: "parcel-2", parcelId: "SA-1002", trackingNumber: "SA-1002-NG-LA",
      name: "Documents Envelope", description: "Business contract documents",
      weight: 0.5, weightUnit: "kg", status: "delivered",
      origin_city: "Lagos", origin_country: "Nigeria",
      destination_city: "Ibadan", destination_country: "Nigeria",
      senderName: "Demo User", senderPhone: "+2348012345678",
      receiverName: "Chidi Recipient", receiverPhone: "+2348092222222",
      shippingPrice: 2500, currency: "NGN",
      estimatedDelivery: daysAgo(-5), createdAt: daysAgo(7), updatedAt: daysAgo(4), deliveredAt: daysAgo(-4),
      data: JSON.stringify({ dimensions: { length: 33, width: 25, height: 2, unit: "cm" } }),
    },
    {
      _id: "parcel-3", parcelId: "SA-1003", trackingNumber: "SA-1003-NG-LA",
      name: "Clothing Box", description: "Seasonal clothing collection",
      weight: 3.0, weightUnit: "kg", status: "pending",
      origin_city: "Abuja", origin_country: "Nigeria",
      destination_city: "Accra", destination_country: "Ghana",
      senderName: "Demo User", senderPhone: "+2348012345678",
      receiverName: "Grace Mensah", receiverPhone: "+233501234567",
      shippingPrice: 18500, currency: "NGN",
      estimatedDelivery: daysAgo(-8), createdAt: daysAgo(1), updatedAt: daysAgo(1), deliveredAt: null,
      data: JSON.stringify({ dimensions: { length: 50, width: 40, height: 30, unit: "cm" } }),
    },
    {
      _id: "parcel-4", parcelId: "SA-1004", trackingNumber: "SA-1004-NG-LA",
      name: "Grocery Items", description: "Assorted local groceries",
      weight: 5.0, weightUnit: "kg", status: "cancelled",
      origin_city: "Lagos", origin_country: "Nigeria",
      destination_city: "Port Harcourt", destination_country: "Nigeria",
      senderName: "Demo User", senderPhone: "+2348012345678",
      receiverName: "Ngozi Eze", receiverPhone: "+2348093333333",
      shippingPrice: 5500, currency: "NGN",
      estimatedDelivery: daysAgo(-10), createdAt: daysAgo(6), updatedAt: daysAgo(3), deliveredAt: null,
      data: JSON.stringify({ dimensions: { length: 45, width: 35, height: 25, unit: "cm" }, cancelledAt: daysAgo(-3), cancelReason: "Changed mind" }),
    },
    {
      _id: "parcel-5", parcelId: "SA-1005", trackingNumber: "SA-1005-NG-UK",
      name: "Gift Package", description: "Birthday gift for family",
      weight: 1.2, weightUnit: "kg", status: "in-transit",
      origin_city: "Lagos", origin_country: "Nigeria",
      destination_city: "London", destination_country: "United Kingdom",
      senderName: "Demo User", senderPhone: "+2348012345678",
      receiverName: "Sarah Johnson", receiverPhone: "+447911123456",
      shippingPrice: 45000, currency: "NGN",
      estimatedDelivery: daysAgo(-14), createdAt: daysAgo(10), updatedAt: daysAgo(8), deliveredAt: null,
      data: JSON.stringify({ dimensions: { length: 30, width: 20, height: 15, unit: "cm" } }),
    },
  ];

  for (const p of parcels) {
    parcelStmt.run(p);
  }

  // --- Seed shipments ---
  const shipmentStmt = sqlite.prepare(`
    INSERT INTO logistics_web_shipments (_id, user_id, courierPartner, shipmentType, shipmentStatus, amount, paymentStatus, data)
    VALUES (@_id, @user_id, @courierPartner, @shipmentType, @shipmentStatus, @amount, @paymentStatus, @data)
  `);

  const seedShipments = [
    { _id: "ship-1", user_id: "ship-user-1", courierPartner: "DHL", shipmentType: "INTERNATIONAL", shipmentStatus: "PROCESSING", amount: 45000, paymentStatus: "AWAITING_PAYMENT", data: JSON.stringify({ _id: "ship-1", courierPartner: "DHL", shipmentType: "INTERNATIONAL", shipmentStatus: "PROCESSING", amount: 45000, paymentStatus: "AWAITING_PAYMENT" }) },
    { _id: "ship-2", user_id: "ship-user-1", courierPartner: "DHL", shipmentType: "LOCAL", shipmentStatus: "COMPLETED", amount: 3500, paymentStatus: "COMPLETED", data: JSON.stringify({ _id: "ship-2", courierPartner: "DHL", shipmentType: "LOCAL", shipmentStatus: "COMPLETED", amount: 3500, paymentStatus: "COMPLETED", receiverCity: "Ibadan", receiverFirstName: "Chidi" }) },
    { _id: "ship-3", user_id: "ship-user-1", courierPartner: "TOPSHIP", shipmentType: "INTERNATIONAL", shipmentStatus: "CANCELLED", amount: 18500, paymentStatus: "AWAITING_PAYMENT", data: JSON.stringify({ _id: "ship-3", courierPartner: "TOPSHIP", shipmentType: "INTERNATIONAL", shipmentStatus: "CANCELLED", amount: 18500, paymentStatus: "AWAITING_PAYMENT" }) },
    { _id: "ship-4", user_id: "ship-user-1", courierPartner: "DHL", shipmentType: "LOCAL", shipmentStatus: "AWAITING_PAYMENT", amount: 2500, paymentStatus: "AWAITING_PAYMENT", data: JSON.stringify({ _id: "ship-4", courierPartner: "DHL", shipmentType: "LOCAL", shipmentStatus: "AWAITING_PAYMENT", amount: 2500, paymentStatus: "AWAITING_PAYMENT", receiverCity: "Port Harcourt", receiverFirstName: "Ngozi" }) },
    { _id: "ship-5", user_id: "ship-user-1", courierPartner: "FEDEX", shipmentType: "INTERNATIONAL", shipmentStatus: "COMPLETED", amount: 55000, paymentStatus: "COMPLETED", data: JSON.stringify({ _id: "ship-5", courierPartner: "FEDEX", shipmentType: "INTERNATIONAL", shipmentStatus: "COMPLETED", amount: 55000, paymentStatus: "COMPLETED", receiverCity: "London", receiverFirstName: "Sarah", receiverCountry: "United Kingdom" }) },
  ];

  for (const s of seedShipments) {
    shipmentStmt.run(s);
  }

  // --- Seed transactions ---
  const txnStmt = sqlite.prepare(`
    INSERT INTO logistics_web_transactions (_id, type, amount, status, reference, description, createdAt)
    VALUES (@_id, @type, @amount, @status, @reference, @description, @createdAt)
  `);

  const transactions = [
    { _id: "txn-1", type: "payment", amount: 4500, status: "completed", reference: "TXN-SA-001", description: "Shipping fee for SA-1001", createdAt: daysAgo(3) },
    { _id: "txn-2", type: "payment", amount: 2500, status: "completed", reference: "TXN-SA-002", description: "Shipping fee for SA-1002", createdAt: daysAgo(7) },
    { _id: "txn-3", type: "payment", amount: 18500, status: "pending", reference: "TXN-SA-003", description: "Shipping fee for SA-1003", createdAt: daysAgo(1) },
    { _id: "txn-4", type: "refund", amount: 5500, status: "completed", reference: "TXN-SA-004", description: "Refund for cancelled parcel SA-1004", createdAt: daysAgo(3) },
    { _id: "txn-5", type: "payment", amount: 45000, status: "completed", reference: "TXN-SA-005", description: "Shipping fee for SA-1005", createdAt: daysAgo(10) },
    { _id: "txn-6", type: "funding", amount: 100000, status: "completed", reference: "TXN-SA-006", description: "Wallet top-up", createdAt: daysAgo(15) },
  ];

  for (const t of transactions) {
    txnStmt.run(t);
  }

  // --- Seed notifications ---
  const notifStmt = sqlite.prepare(`
    INSERT INTO logistics_web_notifications (_id, userId, message, isRead, type, createdAt)
    VALUES (@_id, @userId, @message, @isRead, @type, @createdAt)
  `);

  const notifications = [
    { _id: "notif-1", userId: "ship-user-1", message: "Your parcel SA-1002 has been delivered successfully.", isRead: 0, type: "delivery", createdAt: daysAgo(4) },
    { _id: "notif-2", userId: "ship-user-1", message: "Your parcel SA-1001 is now in transit.", isRead: 0, type: "tracking", createdAt: daysAgo(2) },
    { _id: "notif-3", userId: "ship-user-1", message: "International shipping to London starts from \u20A645,000.", isRead: 1, type: "promo", createdAt: daysAgo(10) },
    { _id: "notif-4", userId: "ship-user-1", message: "Thank you for joining ShipPlug Africa. Start shipping today!", isRead: 1, type: "onboarding", createdAt: daysAgo(30) },
    { _id: "notif-5", userId: "ship-user-1", message: "Your parcel SA-1004 has been cancelled as requested.", isRead: 1, type: "cancellation", createdAt: daysAgo(3) },
  ];

  for (const n of notifications) {
    notifStmt.run(n);
  }

  // --- Seed countries ---
  const countryStmt = sqlite.prepare(`
    INSERT INTO logistics_web_countries (isoCode, name) VALUES (@isoCode, @name)
  `);

  const countries = [
    { isoCode: "NG", name: "Nigeria" },
    { isoCode: "GH", name: "Ghana" },
    { isoCode: "GB", name: "United Kingdom" },
    { isoCode: "US", name: "United States" },
    { isoCode: "CA", name: "Canada" },
  ];

  for (const c of countries) {
    countryStmt.run(c);
  }

  // --- Seed cities ---
  const cityStmt = sqlite.prepare(`
    INSERT INTO logistics_web_cities (countryCode, name) VALUES (@countryCode, @name)
  `);

  const cities = [
    { countryCode: "NG", name: "Lagos" },
    { countryCode: "NG", name: "Abuja" },
    { countryCode: "NG", name: "Ibadan" },
    { countryCode: "NG", name: "Port Harcourt" },
    { countryCode: "NG", name: "Kano" },
    { countryCode: "NG", name: "Enugu" },
    { countryCode: "GH", name: "Accra" },
    { countryCode: "GH", name: "Kumasi" },
    { countryCode: "GB", name: "London" },
    { countryCode: "GB", name: "Manchester" },
    { countryCode: "GB", name: "Birmingham" },
    { countryCode: "US", name: "New York" },
    { countryCode: "US", name: "Los Angeles" },
    { countryCode: "US", name: "Chicago" },
    { countryCode: "US", name: "Houston" },
    { countryCode: "CA", name: "Toronto" },
    { countryCode: "CA", name: "Vancouver" },
  ];

  for (const ci of cities) {
    cityStmt.run(ci);
  }

  // --- Seed pricing ---
  const pricingStmt = sqlite.prepare(`
    INSERT INTO logistics_web_pricing (pricing_group, from_loc, to_loc, price, currency, estimatedDays, data)
    VALUES (@pricing_group, @from_loc, @to_loc, @price, @currency, @estimatedDays, @data)
  `);

  const pricingItems = [
    { pricing_group: "intraCity", from_loc: "Lagos", to_loc: "Lagos", price: 1500, currency: "NGN", estimatedDays: "1-2", data: JSON.stringify({ from: "Lagos", to: "Lagos", price: 1500, currency: "NGN", estimatedDays: "1-2" }) },
    { pricing_group: "intraCity", from_loc: "Abuja", to_loc: "Abuja", price: 1500, currency: "NGN", estimatedDays: "1-2", data: JSON.stringify({ from: "Abuja", to: "Abuja", price: 1500, currency: "NGN", estimatedDays: "1-2" }) },
    { pricing_group: "intraCity", from_loc: "Accra", to_loc: "Accra", price: 30, currency: "GHS", estimatedDays: "1-2", data: JSON.stringify({ from: "Accra", to: "Accra", price: 30, currency: "GHS", estimatedDays: "1-2" }) },
    { pricing_group: "interCity", from_loc: "Lagos", to_loc: "Abuja", price: 3500, currency: "NGN", estimatedDays: "2-3", data: JSON.stringify({ from: "Lagos", to: "Abuja", price: 3500, currency: "NGN", estimatedDays: "2-3" }) },
    { pricing_group: "interCity", from_loc: "Lagos", to_loc: "Ibadan", price: 2500, currency: "NGN", estimatedDays: "1-2", data: JSON.stringify({ from: "Lagos", to: "Ibadan", price: 2500, currency: "NGN", estimatedDays: "1-2" }) },
    { pricing_group: "interCity", from_loc: "Lagos", to_loc: "Port Harcourt", price: 5000, currency: "NGN", estimatedDays: "2-4", data: JSON.stringify({ from: "Lagos", to: "Port Harcourt", price: 5000, currency: "NGN", estimatedDays: "2-4" }) },
    { pricing_group: "interCity", from_loc: "Abuja", to_loc: "Lagos", price: 3500, currency: "NGN", estimatedDays: "2-3", data: JSON.stringify({ from: "Abuja", to: "Lagos", price: 3500, currency: "NGN", estimatedDays: "2-3" }) },
    { pricing_group: "interCity", from_loc: "Accra", to_loc: "Kumasi", price: 50, currency: "GHS", estimatedDays: "1-2", data: JSON.stringify({ from: "Accra", to: "Kumasi", price: 50, currency: "GHS", estimatedDays: "1-2" }) },
    { pricing_group: "international", from_loc: "Nigeria", to_loc: "Ghana", price: 18000, currency: "NGN", estimatedDays: "5-7", data: JSON.stringify({ from: "Nigeria", to: "Ghana", price: 18000, currency: "NGN", estimatedDays: "5-7" }) },
    { pricing_group: "international", from_loc: "Nigeria", to_loc: "United Kingdom", price: 45000, currency: "NGN", estimatedDays: "7-10", data: JSON.stringify({ from: "Nigeria", to: "United Kingdom", price: 45000, currency: "NGN", estimatedDays: "7-10" }) },
    { pricing_group: "international", from_loc: "Nigeria", to_loc: "United States", price: 55000, currency: "NGN", estimatedDays: "7-12", data: JSON.stringify({ from: "Nigeria", to: "United States", price: 55000, currency: "NGN", estimatedDays: "7-12" }) },
    { pricing_group: "international", from_loc: "Nigeria", to_loc: "Canada", price: 52000, currency: "NGN", estimatedDays: "7-12", data: JSON.stringify({ from: "Nigeria", to: "Canada", price: 52000, currency: "NGN", estimatedDays: "7-12" }) },
    { pricing_group: "international", from_loc: "Ghana", to_loc: "Nigeria", price: 16000, currency: "NGN", estimatedDays: "5-7", data: JSON.stringify({ from: "Ghana", to: "Nigeria", price: 16000, currency: "NGN", estimatedDays: "5-7" }) },
    { pricing_group: "international", from_loc: "Ghana", to_loc: "United Kingdom", price: 350, currency: "GBP", estimatedDays: "5-8", data: JSON.stringify({ from: "Ghana", to: "United Kingdom", price: 350, currency: "GBP", estimatedDays: "5-8" }) },
  ];

  for (const pi of pricingItems) {
    pricingStmt.run(pi);
  }

  // --- Seed wallet ---
  sqlite.prepare(`
    INSERT INTO logistics_web_wallet (_id, userId, balance, currency, data)
    VALUES (@_id, @userId, @balance, @currency, @data)
  `).run({
    _id: "wallet-1",
    userId: "ship-user-1",
    balance: 150000,
    currency: "NGN",
    data: JSON.stringify({ _id: "wallet-1", userId: "ship-user-1", balance: 150000, currency: "NGN", ledgerBalance: 150000, createdAt: daysAgo(30), updatedAt: daysAgo(0) }),
  });
};

export const recordLogisticsWebOperation = (operationName: string | undefined, rootFields: string[], variables: unknown) => {
  sqlite.prepare(`
    INSERT INTO logistics_web_graphql_events (operation_name, root_fields, variables)
    VALUES (?, ?, ?)
  `).run(
    operationName || null,
    JSON.stringify(rootFields),
    variables ? JSON.stringify(variables) : null
  );
};
