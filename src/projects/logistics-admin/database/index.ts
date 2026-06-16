import { sqlite } from "../../../config/db.js";

const UNSPLASH = {
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  parcel: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600",
  warehouse: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600",
  avatar2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  avatar3: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
};

export const setupLogisticsAdminDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS logistics_admin_graphql_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_name TEXT,
      root_fields TEXT NOT NULL,
      variables TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      userId TEXT,
      name TEXT, firstName TEXT, lastName TEXT, otherName TEXT,
      userName TEXT, email TEXT, phoneNumber TEXT,
      role TEXT, avatar TEXT, isActive INTEGER DEFAULT 1,
      accountType TEXT, isEmailVerified INTEGER DEFAULT 1,
      password TEXT NOT NULL DEFAULT 'password',
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_parcels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      parcelId TEXT, trackingNumber TEXT,
      status TEXT,
      senderName TEXT, senderAddress TEXT, senderPhone TEXT,
      recipientName TEXT, recipientAddress TEXT, recipientPhone TEXT,
      origin TEXT, destination TEXT,
      weight REAL, dimensions TEXT,
      declaredValue TEXT, deliveryFee TEXT,
      insurance INTEGER DEFAULT 0, notes TEXT,
      assignedTo TEXT,
      createdAt TEXT, updatedAt TEXT,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      reference TEXT, amount REAL,
      status TEXT, type TEXT,
      description TEXT, customerName TEXT,
      paymentMethod TEXT, createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      name TEXT, emailAddress TEXT,
      company TEXT, description TEXT,
      imageUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_disputes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      parcelId TEXT, trackingNumber TEXT,
      customerName TEXT, subject TEXT,
      description TEXT, status TEXT,
      priority TEXT, resolution TEXT,
      createdAt TEXT, updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      title TEXT, message TEXT,
      type TEXT, read INTEGER DEFAULT 0,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      userId TEXT, name TEXT, email TEXT,
      role TEXT, permissions TEXT,
      avatar TEXT, invitedAt TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_shipping_pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      zone TEXT, baseRate REAL,
      perKg REAL, estimatedDays TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_lagos_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      region TEXT, state TEXT, price TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_intra_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      state TEXT, deliveryType TEXT,
      duration TEXT, price TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_inter_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      zone TEXT, weights TEXT, states TEXT
    );

    CREATE TABLE IF NOT EXISTS logistics_admin_intl_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      _id TEXT UNIQUE NOT NULL,
      zone TEXT, duration TEXT,
      parcelType TEXT, weights TEXT,
      countries TEXT
    );
  `);

  const userCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_users").get() as { count: number };
  if (userCount.count === 0) {
    const insert = sqlite.prepare(
      "INSERT INTO logistics_admin_users (_id, userId, name, firstName, lastName, otherName, userName, email, phoneNumber, role, avatar, isActive, accountType, isEmailVerified, password, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    const users = [
      { _id: "user-1", name: "Demo Admin", firstName: "Demo", lastName: "Admin", email: "demo@example.com", phoneNumber: "+2348012345678", role: "super_admin", avatar: UNSPLASH.avatar, userName: "demoadmin" },
      { _id: "user-2", name: "Jane Smith", firstName: "Jane", lastName: "Operator", email: "jane@example.com", phoneNumber: "+2348090001001", role: "operations", avatar: UNSPLASH.avatar2, userName: "janeoperator" },
      { _id: "user-3", name: "Bob Johnson", firstName: "Mike", lastName: "Viewer", email: "mike@example.com", phoneNumber: "+2348090001002", role: "viewer", avatar: UNSPLASH.avatar3, userName: "mikeviewer" },
    ];
    users.forEach((u) => insert.run(u._id, u._id, u.name, u.firstName, u.lastName, "", u.userName, u.email, u.phoneNumber, u.role, u.avatar, 1, "INDIVIDUAL", 1, "password", u._id === "user-1" ? "2026-01-01T00:00:00.000Z" : u._id === "user-2" ? "2026-02-01T00:00:00.000Z" : "2026-03-01T00:00:00.000Z"));
  }

  const parcelCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_parcels").get() as { count: number };
  if (parcelCount.count === 0) {
    const parcelStatuses = ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "returned", "cancelled"];
    const insert = sqlite.prepare(
      "INSERT INTO logistics_admin_parcels (_id, parcelId, trackingNumber, status, senderName, senderAddress, senderPhone, recipientName, recipientAddress, recipientPhone, origin, destination, weight, dimensions, declaredValue, deliveryFee, insurance, notes, assignedTo, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (let i = 0; i < 15; i++) {
      const id = i + 1;
      const status = parcelStatuses[i % parcelStatuses.length];
      const senderName = i % 3 === 0 ? "Acme Corp" : i % 3 === 1 ? "Global Traders" : "ShipFast Ltd";
      const recipientName = i % 2 === 0 ? "Diana Jones" : "Charlie Brown";
      const destination = i % 2 === 0 ? "Abuja" : "Port Harcourt";
      insert.run(
        `parcel-${id}`, `parcel-${id}`, `SA-${String(id).padStart(6, "0")}`, status,
        senderName, `${100 + i * 10} Industrial Avenue, Lagos`, `+2348010000${String(id).padStart(4, "0")}`,
        recipientName, `${200 + i * 5} Peace Estate, Abuja`, `+2348020000${String(id).padStart(4, "0")}`,
        "Lagos", destination, Math.round((1.5 + i * 0.7) * 100) / 100,
        `${30 + i}x${20 + i}x${10 + i} cm`, String(25000 + i * 3000), String(1500 + i * 200),
        i % 3 === 0 ? 1 : 0, i % 4 === 0 ? "Fragile - handle with care" : null,
        i % 3 === 0 ? "user-2" : null,
        new Date(Date.now() - i * 86400000).toISOString(),
        new Date(Date.now() - i * 43200000).toISOString()
      );
    }
  }

  const shipmentCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_shipments").get() as { count: number };
  if (shipmentCount.count === 0) {
    const franchisePartners = [
      { address: "23 Kudirat Street, Ikeja", partnerFullName: "FastTrack Logistics", email: "info@example.com", phoneNumber: "+2348011110001", state: "Lagos" },
      { address: "45 Aba Road, Port Harcourt", partnerFullName: "Swift Delivery Co", email: "hello@example.com", phoneNumber: "+2348011110002", state: "Rivers" },
      { address: "12 Zik Avenue, Enugu", partnerFullName: "SafeHands Logistics", email: "contact@example.com", phoneNumber: "+2348011110003", state: "Enugu" },
    ];
    const users = sqlite.prepare("SELECT * FROM logistics_admin_users").all() as Array<Record<string, unknown>>;
    const makeShipUser = (u: Record<string, unknown>) => ({ _id: u._id, name: u.name, firstName: u.firstName, lastName: u.lastName, otherName: u.otherName, email: u.email, userName: u.userName, phoneNumber: u.phoneNumber, accountType: u.accountType, isEmailVerified: u.isEmailVerified, role: u.role, createdAt: u.createdAt });
    const insert = sqlite.prepare("INSERT INTO logistics_admin_shipments (_id, data) VALUES (?, ?)");
    for (let i = 0; i < 15; i++) {
      const shipUser = makeShipUser(users[i % 3]);
      const idx = i;
      const shipment = {
        _id: `parcel-${idx + 1}`,
        user: shipUser,
        parcelSender: {
          userAddress: `${100 + idx * 10} Industrial Avenue, Lagos`,
          firstName: idx % 2 === 0 ? "Chidi" : "Ngozi",
          lastName: idx % 2 === 0 ? "Okonkwo" : "Eze",
          email: `sender${idx + 1}@example.com`,
          phoneNumber: `+2348010000${String(idx + 1).padStart(4, "0")}`,
          city: "Lagos", state: "Lagos", country: "Nigeria", zipPostalCode: "100001",
          companyName: idx % 3 === 0 ? "Acme Corp" : idx % 3 === 1 ? "Global Traders" : "ShipFast Ltd",
        },
        parcelReceiver: {
          userAddress: `${200 + idx * 5} Peace Estate, Abuja`,
          firstName: idx % 2 === 0 ? "Chinwe" : "Emeka",
          lastName: idx % 2 === 0 ? "Okafor" : "Nwosu",
          email: `receiver${idx + 1}@example.com`,
          phoneNumber: `+2348020000${String(idx + 1).padStart(4, "0")}`,
          city: idx % 2 === 0 ? "Abuja" : "Port Harcourt",
          state: idx % 2 === 0 ? "FCT" : "Rivers",
          country: "Nigeria",
          zipPostalCode: idx % 2 === 0 ? "900001" : "500001",
          companyName: idx % 2 === 0 ? "Chinwe Enterprises" : "Emeka Ventures",
        },
        parcel: {
          parcelType: ["document", "parcel", "fragile", "perishable"][idx % 4],
          franchisePartner: franchisePartners[idx % 3],
          parcelContent: ["Electronics", "Clothing", "Books", "Food Items", "Documents", "Furniture", "Medical Supplies"][idx % 7],
          itemCategory: ["electronics", "fashion", "books", "food", "documents", "furniture", "medical"][idx % 7],
          quantity: String((idx % 5) + 1),
          weight: `${(1.5 + idx * 0.7).toFixed(1)}kg`,
          totalValue: String(25000 + idx * 3000),
          packaging: ["box", "envelope", "crate", "pallet"][idx % 4],
          picture: UNSPLASH.parcel,
          nin: `NIN-${String(idx + 1).padStart(10, "0")}`,
          proofOfPaymentAndOwnership: UNSPLASH.warehouse,
          insurance: idx % 3 === 0 ? "Yes" : "No",
        },
        courierPartner: ["DHL", "FedEx", "UPS", "Aramex", "GIG Logistics"][idx % 5],
        shipmentType: ["international", "interstate", "intrastate", "local"][idx % 4],
        shipmentStatus: ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "returned", "cancelled"][idx % 7],
        payment: {
          _id: `payment-${idx + 1}`,
          shipment: {
            _id: `parcel-${idx + 1}`,
            courierPartner: ["DHL", "FedEx", "UPS", "Aramex", "GIG Logistics"][idx % 5],
            shipmentType: ["international", "interstate", "intrastate", "local"][idx % 4],
            shipmentStatus: ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "returned", "cancelled"][idx % 7],
            createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
          },
          paystackTransId: `paystack-${String(idx + 1).padStart(6, "0")}`,
          amount: String(2500 + idx * 1500),
          status: ["completed", "completed", "completed", "pending", "failed", "completed"][idx % 6],
          createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
        },
        createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
      };
      insert.run(`parcel-${idx + 1}`, JSON.stringify(shipment));
    }
  }

  const txnCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_transactions").get() as { count: number };
  if (txnCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_transactions (_id, reference, amount, status, type, description, customerName, paymentMethod, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (let i = 0; i < 12; i++) {
      insert.run(
        `txn-${i + 1}`, `TXN-${String(i + 1).padStart(6, "0")}`,
        2500 + i * 1500,
        ["completed", "completed", "completed", "pending", "failed", "completed"][i % 6],
        ["shipment", "shipment", "refund", "wallet_funding", "shipment", "withdrawal"][i % 6],
        `Payment for parcel SA-${String(i + 1).padStart(6, "0")}`,
        i % 2 === 0 ? "Diana Jones" : "Charlie Brown",
        ["card", "bank_transfer", "ussd", "wallet"][i % 4],
        new Date(Date.now() - i * 86400000).toISOString()
      );
    }
  }

  const contactCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_contacts").get() as { count: number };
  if (contactCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_contacts (_id, name, emailAddress, company, description, imageUrl) VALUES (?, ?, ?, ?, ?, ?)");
    [
      { _id: "contact-1", name: "John Doe", emailAddress: "john@example.com", company: "Tech Corp", description: "I have a question about shipping rates" },
      { _id: "contact-2", name: "Jane Smith", emailAddress: "jane@example.com", company: "Global Trade Ltd", description: "Looking for bulk shipping discounts" },
      { _id: "contact-3", name: "Paul Martin", emailAddress: "ahmed@example.com", company: "Musa Enterprises", description: "Need help tracking my parcel" },
      { _id: "contact-4", name: "Rachel Robinson", emailAddress: "sarah@example.com", company: "Johnson & Co", description: "Partnership inquiry" },
      { _id: "contact-5", name: "Sam Clark", emailAddress: "peter@example.com", company: "Obi Ventures", description: "Complaint about delayed delivery" },
    ].forEach((c) => insert.run(c._id, c.name, c.emailAddress, c.company, c.description, null));
  }

  const disputeCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_disputes").get() as { count: number };
  if (disputeCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_disputes (_id, parcelId, trackingNumber, customerName, subject, description, status, priority, resolution, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    [
      { _id: "dispute-1", parcelId: "parcel-1", trackingNumber: "SA-000001", customerName: "Diana Jones", subject: "Damaged Item", description: "The package arrived with visible damage to the corner.", status: "open", priority: "high", resolution: null, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      { _id: "dispute-2", parcelId: "parcel-3", trackingNumber: "SA-000003", customerName: "Charlie Brown", subject: "Delayed Delivery", description: "Package was supposed to arrive 2 days ago.", status: "in_progress", priority: "medium", resolution: null, createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
      { _id: "dispute-3", parcelId: "parcel-7", trackingNumber: "SA-000007", customerName: "Diana Jones", subject: "Wrong Item Delivered", description: "Received a different item than what was ordered.", status: "resolved", priority: "high", resolution: "Replacement sent", createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    ].forEach((d) => insert.run(d._id, d.parcelId, d.trackingNumber, d.customerName, d.subject, d.description, d.status, d.priority, d.resolution, d.createdAt, d.updatedAt));
  }

  const notifCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_notifications").get() as { count: number };
  if (notifCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_notifications (_id, title, message, type, read, createdAt) VALUES (?, ?, ?, ?, ?, ?)");
    for (let i = 0; i < 8; i++) {
      const title = i === 0 ? "Parcel Delivered" : i === 1 ? "New Pickup Request" : i === 2 ? "Payment Received" : `Update ${i + 1}`;
      const message = i === 0 ? "Parcel SA-000001 has been delivered successfully" : i === 1 ? "A new pickup has been scheduled for today" : i === 2 ? "Payment of ₦4,500 received for parcel SA-0003" : `Demo notification message ${i + 1}`;
      const type = ["success", "info", "payment", "alert", "info", "success", "warning", "info"][i];
      insert.run(`notif-${i + 1}`, title, message, type, i < 2 ? 1 : 0, new Date(Date.now() - i * 43200000).toISOString());
    }
  }

  const teamCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_team_members").get() as { count: number };
  if (teamCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_team_members (_id, userId, name, email, role, permissions, avatar, invitedAt, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    [
      { _id: "team-1", userId: "user-1", name: "Demo Admin", email: "demo@example.com", role: "super_admin", permissions: ["all"], avatar: UNSPLASH.avatar, invitedAt: "2026-01-01T00:00:00.000Z", status: "active" },
      { _id: "team-2", userId: "user-2", name: "Jane Smith", email: "jane@example.com", role: "operations", permissions: ["view_parcels", "create_parcels", "update_parcels", "view_dashboard"], avatar: UNSPLASH.avatar2, invitedAt: "2026-02-01T00:00:00.000Z", status: "active" },
      { _id: "team-3", userId: "user-3", name: "Bob Johnson", email: "mike@example.com", role: "viewer", permissions: ["view_parcels", "view_dashboard"], avatar: UNSPLASH.avatar3, invitedAt: "2026-03-01T00:00:00.000Z", status: "active" },
      { _id: "team-4", userId: null, name: "Demo Invite", email: "invited@example.com", role: "operations", permissions: ["view_parcels", "create_parcels"], invitedAt: "2026-05-20T00:00:00.000Z", status: "pending" },
    ].forEach((t) => insert.run(t._id, t.userId, t.name, t.email, t.role, JSON.stringify(t.permissions), t.avatar, t.invitedAt, t.status));
  }

  const pricingCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_shipping_pricing").get() as { count: number };
  if (pricingCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_shipping_pricing (_id, zone, baseRate, perKg, estimatedDays) VALUES (?, ?, ?, ?, ?)");
    [
      { _id: "price-1", zone: "Local (Lagos)", baseRate: 1500, perKg: 200, estimatedDays: "1-2" },
      { _id: "price-2", zone: "Interstate (Within Nigeria)", baseRate: 2500, perKg: 350, estimatedDays: "2-4" },
      { _id: "price-3", zone: "International (Africa)", baseRate: 8500, perKg: 1200, estimatedDays: "5-10" },
      { _id: "price-4", zone: "International (Worldwide)", baseRate: 15000, perKg: 2500, estimatedDays: "7-14" },
    ].forEach((p) => insert.run(p._id, p.zone, p.baseRate, p.perKg, p.estimatedDays));
  }

  const lagosCostCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_lagos_costs").get() as { count: number };
  if (lagosCostCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_lagos_costs (_id, region, state, price) VALUES (?, ?, ?, ?)");
    [
      { _id: "lagos-cost-1", region: "Lagos Mainland", price: "1500" },
      { _id: "lagos-cost-2", region: "Lagos Island", price: "2000" },
      { _id: "lagos-cost-3", region: "Ikeja", price: "1200" },
      { _id: "lagos-cost-4", region: "Badagry", price: "3000" },
      { _id: "lagos-cost-5", region: "Epe", price: "3500" },
      { _id: "lagos-cost-6", region: "Ikorodu", price: "2500" },
    ].forEach((c) => insert.run(c._id, c.region, "Lagos", c.price));
  }

  const intraCostCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_intra_costs").get() as { count: number };
  if (intraCostCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_intra_costs (_id, state, deliveryType, duration, price) VALUES (?, ?, ?, ?, ?)");
    [
      { _id: "intra-cost-1", state: "Lagos", deliveryType: "Standard", duration: "1-2 days", price: "1500" },
      { _id: "intra-cost-2", state: "Lagos", deliveryType: "Express", duration: "Same day", price: "3000" },
      { _id: "intra-cost-3", state: "Abuja", deliveryType: "Standard", duration: "1-2 days", price: "1800" },
      { _id: "intra-cost-4", state: "Abuja", deliveryType: "Express", duration: "Same day", price: "3500" },
      { _id: "intra-cost-5", state: "Rivers", deliveryType: "Standard", duration: "1-3 days", price: "2000" },
      { _id: "intra-cost-6", state: "Rivers", deliveryType: "Express", duration: "Same day", price: "4000" },
    ].forEach((c) => insert.run(c._id, c.state, c.deliveryType, c.duration, c.price));
  }

  const interCostCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_inter_costs").get() as { count: number };
  if (interCostCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_inter_costs (_id, zone, weights, states) VALUES (?, ?, ?, ?)");
    [
      { _id: "inter-cost-1", zone: "Zone A (South-West)", weights: [{ kg: 1, price: 1500 }, { kg: 2, price: 2000 }, { kg: 5, price: 3500 }, { kg: 10, price: 5000 }], states: ["Lagos", "Ogun", "Oyo", "Osun", "Ondo", "Ekiti"] },
      { _id: "inter-cost-2", zone: "Zone B (South-East)", weights: [{ kg: 1, price: 1800 }, { kg: 2, price: 2500 }, { kg: 5, price: 4000 }, { kg: 10, price: 5500 }], states: ["Enugu", "Anambra", "Imo", "Abia", "Ebonyi"] },
      { _id: "inter-cost-3", zone: "Zone C (North-Central)", weights: [{ kg: 1, price: 2000 }, { kg: 2, price: 2800 }, { kg: 5, price: 4500 }, { kg: 10, price: 6000 }], states: ["FCT", "Niger", "Plateau", "Benue", "Kogi", "Kwara"] },
      { _id: "inter-cost-4", zone: "Zone D (North-East)", weights: [{ kg: 1, price: 2500 }, { kg: 2, price: 3500 }, { kg: 5, price: 5000 }, { kg: 10, price: 7000 }], states: ["Borno", "Yobe", "Adamawa", "Taraba", "Bauchi", "Gombe"] },
    ].forEach((c) => insert.run(c._id, c.zone, JSON.stringify(c.weights), JSON.stringify(c.states)));
  }

  const intlCostCount = sqlite.prepare("SELECT COUNT(*) as count FROM logistics_admin_intl_costs").get() as { count: number };
  if (intlCostCount.count === 0) {
    const insert = sqlite.prepare("INSERT INTO logistics_admin_intl_costs (_id, zone, duration, parcelType, weights, countries) VALUES (?, ?, ?, ?, ?, ?)");
    [
      { _id: "intl-cost-1", zone: "Africa", duration: "5-10 days", parcelType: "document", weights: [{ kg: 1, price: 8500 }, { kg: 2, price: 12000 }, { kg: 5, price: 20000 }], countries: ["Ghana", "Kenya", "South Africa", "Egypt", "Ethiopia"] },
      { _id: "intl-cost-2", zone: "Europe", duration: "7-14 days", parcelType: "parcel", weights: [{ kg: 1, price: 15000 }, { kg: 2, price: 22000 }, { kg: 5, price: 40000 }, { kg: 10, price: 65000 }], countries: ["United Kingdom", "Germany", "France", "Italy", "Spain", "Netherlands"] },
      { _id: "intl-cost-3", zone: "North America", duration: "7-14 days", parcelType: "parcel", weights: [{ kg: 1, price: 18000 }, { kg: 2, price: 26000 }, { kg: 5, price: 45000 }, { kg: 10, price: 70000 }], countries: ["United States", "Canada", "Mexico"] },
      { _id: "intl-cost-4", zone: "Asia", duration: "10-15 days", parcelType: "parcel", weights: [{ kg: 1, price: 16000 }, { kg: 2, price: 24000 }, { kg: 5, price: 42000 }, { kg: 10, price: 68000 }], countries: ["China", "Japan", "India", "South Korea", "UAE"] },
    ].forEach((c) => insert.run(c._id, c.zone, c.duration, c.parcelType, JSON.stringify(c.weights), JSON.stringify(c.countries)));
  }
};

export const recordLogisticsAdminOperation = (operationName: string | undefined, rootFields: string[], variables: unknown) => {
  sqlite.prepare(`
    INSERT INTO logistics_admin_graphql_events (operation_name, root_fields, variables)
    VALUES (?, ?, ?)
  `).run(operationName || null, JSON.stringify(rootFields), variables ? JSON.stringify(variables) : null);
};

// --- Helper functions for controllers ---

export const getAllUsers = () => sqlite.prepare("SELECT * FROM logistics_admin_users").all() as Array<Record<string, unknown>>;
export const getUserById = (id: string) => sqlite.prepare("SELECT * FROM logistics_admin_users WHERE _id = ?").get(id) as Record<string, unknown> | undefined;
export const getUserByEmail = (email: string) => sqlite.prepare("SELECT * FROM logistics_admin_users WHERE email = ?").get(email) as Record<string, unknown> | undefined;
export const createUser = (data: Record<string, unknown>) => {
  sqlite.prepare("INSERT INTO logistics_admin_users (_id, userId, name, firstName, lastName, otherName, userName, email, phoneNumber, role, avatar, isActive, accountType, isEmailVerified, password, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(data._id, data.userId || data._id, data.name, data.firstName, data.lastName, data.otherName || "", data.userName, data.email, data.phoneNumber, data.role, data.avatar || "", 1, data.accountType || "INDIVIDUAL", 1, data.password || "password", new Date().toISOString());
};

export const getAllParcels = () => sqlite.prepare("SELECT * FROM logistics_admin_parcels").all() as Array<Record<string, unknown>>;
export const getParcelById = (id: string) => sqlite.prepare("SELECT * FROM logistics_admin_parcels WHERE _id = ?").get(id) as Record<string, unknown> | undefined;

export const getAllShipments = () => sqlite.prepare("SELECT * FROM logistics_admin_shipments").all() as Array<Record<string, unknown>>;
export const getShipmentById = (id: string) => sqlite.prepare("SELECT * FROM logistics_admin_shipments WHERE _id = ?").get(id) as Record<string, unknown> | undefined;

export const getAllTransactions = () => sqlite.prepare("SELECT * FROM logistics_admin_transactions").all() as Array<Record<string, unknown>>;

export const getAllContacts = () => sqlite.prepare("SELECT * FROM logistics_admin_contacts").all() as Array<Record<string, unknown>>;

export const getAllDisputes = () => sqlite.prepare("SELECT * FROM logistics_admin_disputes").all() as Array<Record<string, unknown>>;
export const getDisputeById = (id: string) => sqlite.prepare("SELECT * FROM logistics_admin_disputes WHERE _id = ?").get(id) as Record<string, unknown> | undefined;

export const getAllNotifications = () => sqlite.prepare("SELECT * FROM logistics_admin_notifications").all() as Array<Record<string, unknown>>;

export const getAllTeamMembers = () => sqlite.prepare("SELECT * FROM logistics_admin_team_members").all() as Array<Record<string, unknown>>;

export const getAllShippingPricing = () => sqlite.prepare("SELECT * FROM logistics_admin_shipping_pricing").all() as Array<Record<string, unknown>>;

export const getAllLagosCosts = () => sqlite.prepare("SELECT * FROM logistics_admin_lagos_costs").all() as Array<Record<string, unknown>>;
export const getAllIntraCosts = () => sqlite.prepare("SELECT * FROM logistics_admin_intra_costs").all() as Array<Record<string, unknown>>;
export const getAllInterCosts = () => sqlite.prepare("SELECT * FROM logistics_admin_inter_costs").all() as Array<Record<string, unknown>>;
export const getAllIntlCosts = () => sqlite.prepare("SELECT * FROM logistics_admin_intl_costs").all() as Array<Record<string, unknown>>;
