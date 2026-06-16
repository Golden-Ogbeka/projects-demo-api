import { sqlite } from "../../../config/db.js";

const IMAGES = {
  property: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  blog: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600",
  development: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
};

export const setupRealEstateAdminDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS real_estate_admin_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT,
      method TEXT NOT NULL,
      body TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT,
      phone TEXT,
      role TEXT DEFAULT 'buyer',
      status TEXT DEFAULT 'active',
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT,
      price REAL,
      location TEXT,
      bedrooms INTEGER DEFAULT 0,
      bathrooms INTEGER DEFAULT 0,
      area REAL,
      status TEXT DEFAULT 'available',
      image TEXT,
      description TEXT,
      features TEXT DEFAULT '[]',
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_developments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phase TEXT,
      type TEXT,
      units INTEGER DEFAULT 0,
      completedUnits INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ongoing',
      budget REAL,
      location TEXT,
      startDate TEXT,
      expectedEndDate TEXT,
      progress INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      propertyId INTEGER,
      propertyName TEXT,
      investor TEXT,
      amount REAL,
      roi REAL,
      status TEXT DEFAULT 'active',
      startDate TEXT,
      expectedMaturity TEXT,
      returnsPaid REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      propertyId INTEGER,
      propertyName TEXT,
      buyer TEXT,
      investor TEXT,
      amount REAL,
      type TEXT,
      status TEXT DEFAULT 'pending',
      reference TEXT,
      date TEXT,
      paymentMethod TEXT
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT,
      excerpt TEXT,
      content TEXT,
      author TEXT,
      category TEXT,
      image TEXT,
      status TEXT DEFAULT 'draft',
      publishedAt TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_grows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      targetAmount REAL,
      raisedAmount REAL DEFAULT 0,
      roi REAL,
      durationMonths INTEGER,
      status TEXT DEFAULT 'active',
      investors INTEGER DEFAULT 0,
      startDate TEXT,
      endDate TEXT
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT,
      property TEXT,
      status TEXT DEFAULT 'unread',
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transactionId INTEGER,
      transactionRef TEXT,
      client TEXT,
      amount REAL,
      status TEXT DEFAULT 'pending',
      dueDate TEXT,
      issuedAt TEXT,
      paidAt TEXT
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      propertyId INTEGER,
      propertyName TEXT,
      reviewer TEXT,
      rating INTEGER,
      comment TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS real_estate_admin_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL
    );
  `);

  const userCount = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_users").get() as { c: number }).c;
  if (userCount > 0) return;

  const insertUser = sqlite.prepare(`INSERT INTO real_estate_admin_users (name,email,password,phone,role,status,createdAt) VALUES (?,?,?,?,?,?,?)`);
  insertUser.run("Demo Admin", "demo@example.com", "password", null, "admin", "active", new Date(Date.now() - 180 * 86400000).toISOString());
  insertUser.run("Tina Lewis", "chioma@example.com", null, "+2348020001001", "agent", "active", "2025-11-15T10:00:00.000Z");
  insertUser.run("Bob Smith", "femi@example.com", null, "+2348020002002", "investor", "active", "2026-01-20T08:30:00.000Z");
  insertUser.run("Uma Walker", "zainab@example.com", null, "+2348020003003", "buyer", "active", "2026-02-10T14:00:00.000Z");
  insertUser.run("Charlie Brown", "emeka@example.com", null, "+2348020004004", "seller", "inactive", "2025-08-05T09:00:00.000Z");
  insertUser.run("Victor Hall", "kemi@example.com", null, "+2348020005005", "buyer", "active", "2026-03-12T11:15:00.000Z");
  insertUser.run("Wendy Young", "segun@example.com", null, "+2348020006006", "agent", "active", "2025-09-28T16:00:00.000Z");

  const insertProperty = sqlite.prepare(`INSERT INTO real_estate_admin_properties (title,type,price,location,bedrooms,bathrooms,area,status,image,description,features,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  insertProperty.run("Luxury Villa in Ikoyi", "villa", 250000000, "Ikoyi, Lagos", 5, 6, 850, "available", IMAGES.property, "Stunning 5-bedroom luxury villa in the heart of Ikoyi with modern finishes, swimming pool, and 24/7 security.", JSON.stringify(["Swimming Pool", "Smart Home", "CCTV", "Generator", "Staff Quarters"]), "2026-01-10T10:00:00.000Z");
  insertProperty.run("Commercial Plot in Lekki", "land", 85000000, "Lekki Phase 1, Lagos", 0, 0, 1200, "available", IMAGES.property, "Prime commercial plot in the rapidly developing Lekki corridor. Perfect for retail or office development.", JSON.stringify(["C of O", "Survey Plan", "Road Access", "Drainage"]), "2026-01-15T10:00:00.000Z");
  insertProperty.run("Executive Duplex in Wuse 2", "duplex", 180000000, "Wuse 2, Abuja", 4, 5, 600, "occupied", IMAGES.property, "Elegant 4-bedroom duplex in a quiet Wuse 2 street. Close to embassies and shopping districts.", JSON.stringify(["BQ", "Garden", "Solar Power", "Parking"]), "2026-02-01T10:00:00.000Z");
  insertProperty.run("Affordable 2-Bedroom Flat", "apartment", 35000000, "Gwarimpa, Abuja", 2, 2, 120, "available", IMAGES.property, "Well-maintained 2-bedroom flat in the largest housing estate in West Africa. Great for first-time home buyers.", JSON.stringify(["Tiled Floors", "POP Ceiling", "Kitchen Cabinets", "24hr Water"]), "2026-02-20T10:00:00.000Z");
  insertProperty.run("Beachfront Land in Elegushi", "land", 120000000, "Elegushi, Lekki, Lagos", 0, 0, 800, "sold", IMAGES.property, "Rare beachfront land with direct ocean access. Ideal for a resort or luxury holiday home.", JSON.stringify(["Beach Front", "C of O", "Approved Plan"]), "2026-03-01T10:00:00.000Z");
  insertProperty.run("3-Bedroom Terrace in GRA", "terrace", 65000000, "GRA, Port Harcourt", 3, 3, 280, "available", IMAGES.property, "Modern terrace in the prestigious GRA Port Harcourt. Secure estate with recreational facilities.", JSON.stringify(["Estate Gate", "Playground", "Generator", "Parking", "CCTV"]), "2026-03-10T10:00:00.000Z");
  insertProperty.run("Penthouse in Banana Island", "penthouse", 500000000, "Banana Island, Lagos", 6, 7, 1200, "available", IMAGES.property, "Ultra-luxury penthouse overlooking Lagos Lagoon. World-class finishes, private elevator, and rooftop infinity pool.", JSON.stringify(["Infinity Pool", "Private Elevator", "Home Theatre", "Wine Cellar", "Rooftop Garden", "Smart Home"]), "2026-04-05T10:00:00.000Z");
  insertProperty.run("Industrial Warehouse in Agbara", "commercial", 200000000, "Agbara Industrial Estate, Ogun", 0, 4, 3500, "occupied", IMAGES.property, "Large industrial warehouse with office spaces. 24/7 security and easy access to Lagos-Badagry expressway.", JSON.stringify(["Loading Bay", "24hr Security", "Office Space", "Parking", "Generator"]), "2026-04-15T10:00:00.000Z");

  const insertDevelopment = sqlite.prepare(`INSERT INTO real_estate_admin_developments (name,phase,type,units,completedUnits,status,budget,location,startDate,expectedEndDate,progress) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  insertDevelopment.run("Ibeju-Lekki Smart City", "Phase 1", "mixed_use", 250, 80, "ongoing", 5000000000, "Ibeju-Lekki, Lagos", "2025-06-01T00:00:00.000Z", "2028-12-31T00:00:00.000Z", 32);
  insertDevelopment.run("Asokoro Luxury Estate", "Phase 2", "residential", 120, 45, "ongoing", 2400000000, "Asokoro, Abuja", "2025-09-01T00:00:00.000Z", "2027-06-30T00:00:00.000Z", 38);
  insertDevelopment.run("PH City Mall & Residences", "Completed", "mixed_use", 180, 180, "completed", 3800000000, "Port Harcourt, Rivers", "2024-01-15T00:00:00.000Z", "2026-03-31T00:00:00.000Z", 100);
  insertDevelopment.run("Eko Atlantic Phase 3", "Phase 3", "commercial", 90, 15, "ongoing", 6000000000, "Eko Atlantic, Lagos", "2026-01-01T00:00:00.000Z", "2029-06-30T00:00:00.000Z", 17);
  insertDevelopment.run("Green Garden Estate", "Phase 1", "residential", 200, 200, "completed", 1500000000, "Abeokuta, Ogun", "2023-03-01T00:00:00.000Z", "2025-12-31T00:00:00.000Z", 100);
  insertDevelopment.run("Lekki County Homes", "Phase 4", "residential", 300, 210, "ongoing", 3500000000, "Lekki, Lagos", "2024-06-01T00:00:00.000Z", "2027-09-30T00:00:00.000Z", 70);

  const insertInvestment = sqlite.prepare(`INSERT INTO real_estate_admin_investments (propertyId,propertyName,investor,amount,roi,status,startDate,expectedMaturity,returnsPaid) VALUES (?,?,?,?,?,?,?,?,?)`);
  insertInvestment.run(1, "Luxury Villa in Ikoyi", "Bob Smith", 50000000, 12.5, "active", "2026-01-15T00:00:00.000Z", "2028-01-15T00:00:00.000Z", 5208333);
  insertInvestment.run(2, "Commercial Plot in Lekki", "Tina Lewis", 25000000, 15, "active", "2026-02-01T00:00:00.000Z", "2028-02-01T00:00:00.000Z", 1562500);
  insertInvestment.run(7, "Penthouse in Banana Island", "Uma Walker", 100000000, 10, "active", "2026-04-10T00:00:00.000Z", "2029-04-10T00:00:00.000Z", 1666667);
  insertInvestment.run(4, "Affordable 2-Bedroom Flat", "Wendy Young", 10000000, 18, "active", "2026-03-01T00:00:00.000Z", "2027-03-01T00:00:00.000Z", 450000);
  insertInvestment.run(3, "Executive Duplex in Wuse 2", "Victor Hall", 35000000, 11, "matured", "2024-06-01T00:00:00.000Z", "2026-06-01T00:00:00.000Z", 7700000);
  insertInvestment.run(8, "Industrial Warehouse in Agbara", "Charlie Brown", 60000000, 14, "active", "2026-05-01T00:00:00.000Z", "2029-05-01T00:00:00.000Z", 1166667);

  const insertTransaction = sqlite.prepare(`INSERT INTO real_estate_admin_transactions (propertyId,propertyName,buyer,investor,amount,type,status,reference,date,paymentMethod) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  insertTransaction.run(1, "Luxury Villa in Ikoyi", "Uma Walker", null, 250000000, "sale", "completed", "TXN-LS-001", "2026-04-15T14:30:00.000Z", "bank_transfer");
  insertTransaction.run(4, "Affordable 2-Bedroom Flat", "Wendy Young", null, 35000000, "sale", "pending", "TXN-LS-002", "2026-05-20T10:00:00.000Z", "installment");
  insertTransaction.run(1, "Luxury Villa in Ikoyi", null, "Bob Smith", 50000000, "investment_returns", "completed", "TXN-LS-003", "2026-04-30T08:00:00.000Z", "bank_transfer");
  insertTransaction.run(6, "3-Bedroom Terrace in GRA", "Demo Admin", null, 65000000, "sale", "completed", "TXN-LS-004", "2026-03-25T12:00:00.000Z", "bank_transfer");
  insertTransaction.run(2, "Commercial Plot in Lekki", "Tina Lewis", null, 85000000, "sale", "pending", "TXN-LS-005", "2026-06-01T09:00:00.000Z", "mortgage");
  insertTransaction.run(5, "Beachfront Land in Elegushi", "Charlie Brown", null, 120000000, "sale", "completed", "TXN-LS-006", "2026-03-10T16:00:00.000Z", "bank_transfer");
  insertTransaction.run(6, "3-Bedroom Terrace in GRA", null, "Bob Smith", 15000000, "investment_returns", "pending", "TXN-LS-007", "2026-06-01T11:00:00.000Z", "bank_transfer");
  insertTransaction.run(3, "Executive Duplex in Wuse 2", "Victor Hall", null, 180000000, "sale", "completed", "TXN-LS-008", "2026-02-28T15:00:00.000Z", "bank_transfer");

  const insertBlog = sqlite.prepare(`INSERT INTO real_estate_admin_blog_posts (title,slug,excerpt,content,author,category,image,status,publishedAt,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  insertBlog.run("Top 5 Real Estate Investment Trends in Lagos 2026", "top-5-real-estate-trends-lagos-2026", "Discover the hottest real estate trends shaping Lagos property market this year.", "Lagos real estate continues to evolve rapidly. From smart homes to sustainable developments, here are the top trends driving the market in 2026...", "Demo Admin", "Market Insights", IMAGES.blog, "published", "2026-05-15T10:00:00.000Z", "2026-05-10T10:00:00.000Z");
  insertBlog.run("A Beginner's Guide to Real Estate Investment in Nigeria", "beginners-guide-real-estate-investment-nigeria", "Everything you need to know before making your first property investment.", "Investing in real estate in Nigeria can be lucrative if you understand the fundamentals. This guide walks you through the process...", "Tina Lewis", "Investment Guide", IMAGES.blog, "published", "2026-04-20T10:00:00.000Z", "2026-04-15T10:00:00.000Z");
  insertBlog.run("Abuja vs Lagos: Where Should You Invest in 2026?", "abuja-vs-lagos-invest-2026", "A comparative analysis of the two biggest real estate markets in Nigeria.", "Both Abuja and Lagos offer unique opportunities for real estate investors. We break down the pros and cons of each market...", "Demo Admin", "Market Insights", IMAGES.blog, "published", "2026-03-10T10:00:00.000Z", "2026-03-05T10:00:00.000Z");
  insertBlog.run("Understanding Land Titles and C of O in Nigeria", "understanding-land-titles-c-of-o-nigeria", "A comprehensive overview of property documentation and why it matters.", "One of the most critical aspects of real estate transactions in Nigeria is understanding land titles and Certificates of Occupancy...", "Demo Admin", "Legal Guide", IMAGES.blog, "published", "2026-02-25T10:00:00.000Z", "2026-02-20T10:00:00.000Z");
  insertBlog.run("The Rise of Co-living Spaces in Nigerian Cities", "rise-of-co-living-spaces-nigeria", "How co-living is changing the rental landscape for young professionals.", "Co-living spaces are gaining popularity among Nigeria's urban professionals. We explore why this trend is catching on...", "Bob Smith", "Trends", IMAGES.blog, "draft", null, "2026-05-28T10:00:00.000Z");

  const insertGrow = sqlite.prepare(`INSERT INTO real_estate_admin_grows (name,type,targetAmount,raisedAmount,roi,durationMonths,status,investors,startDate,endDate) VALUES (?,?,?,?,?,?,?,?,?,?)`);
  insertGrow.run("Land Banking Scheme - Lekki", "land_banking", 200000000, 145000000, 20, 24, "active", 45, "2025-12-01T00:00:00.000Z", "2027-12-01T00:00:00.000Z");
  insertGrow.run("Real Estate Mutual Fund II", "mutual_fund", 500000000, 380000000, 15, 36, "active", 120, "2025-06-01T00:00:00.000Z", "2028-06-01T00:00:00.000Z");
  insertGrow.run("Short-Term Property Flipping Fund", "flipping", 100000000, 100000000, 25, 12, "completed", 30, "2025-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z");
  insertGrow.run("Green Building Initiative", "development", 350000000, 210000000, 18, 30, "active", 78, "2026-03-01T00:00:00.000Z", "2028-09-01T00:00:00.000Z");
  insertGrow.run("Rental Income Pool - Abuja", "rental_pool", 150000000, 95000000, 12, 18, "active", 55, "2026-04-01T00:00:00.000Z", "2027-10-01T00:00:00.000Z");

  const insertContact = sqlite.prepare(`INSERT INTO real_estate_admin_contacts (name,email,phone,message,property,status,createdAt) VALUES (?,?,?,?,?,?,?)`);
  insertContact.run("John Doe", "bola@example.com", "+2348030001001", "I am interested in the Luxury Villa in Ikoyi. Please send more details.", "Luxury Villa in Ikoyi", "unread", "2026-05-30T14:30:00.000Z");
  insertContact.run("Charlie Brown", "ifeanyi@example.com", "+2348030002002", "Do you have any 3-bedroom apartments available in Abuja under 40 million?", null, "read", "2026-05-28T11:00:00.000Z");
  insertContact.run("Grace Williams", "grace@example.com", "+2348030003003", "I would like to schedule a viewing for the Commercial Plot in Lekki.", "Commercial Plot in Lekki", "read", "2026-05-25T09:00:00.000Z");
  insertContact.run("Frank Miller", "tunde@example.com", "+2348030004004", "Please send me the brochure for Ibeju-Lekki Smart City.", "Ibeju-Lekki Smart City", "unread", "2026-06-01T08:15:00.000Z");
  insertContact.run("Karen Anderson", "ngozi@example.com", "+2348030005005", "I am looking for commercial spaces for lease in Victoria Island.", null, "unread", "2026-06-02T16:45:00.000Z");

  const insertInvoice = sqlite.prepare(`INSERT INTO real_estate_admin_invoices (transactionId,transactionRef,client,amount,status,dueDate,issuedAt,paidAt) VALUES (?,?,?,?,?,?,?,?)`);
  insertInvoice.run(1, "TXN-LS-001", "Uma Walker", 250000000, "paid", "2026-04-30T00:00:00.000Z", "2026-04-10T10:00:00.000Z", "2026-04-15T14:30:00.000Z");
  insertInvoice.run(2, "TXN-LS-002", "Wendy Young", 35000000, "pending", "2026-07-20T00:00:00.000Z", "2026-05-20T10:00:00.000Z", null);
  insertInvoice.run(4, "TXN-LS-004", "Demo Admin", 65000000, "paid", "2026-04-01T00:00:00.000Z", "2026-03-20T12:00:00.000Z", "2026-03-25T12:00:00.000Z");
  insertInvoice.run(6, "TXN-LS-006", "Charlie Brown", 120000000, "paid", "2026-03-25T00:00:00.000Z", "2026-03-05T16:00:00.000Z", "2026-03-10T16:00:00.000Z");
  insertInvoice.run(5, "TXN-LS-005", "Tina Lewis", 85000000, "pending", "2026-08-01T00:00:00.000Z", "2026-06-01T09:00:00.000Z", null);
  insertInvoice.run(8, "TXN-LS-008", "Victor Hall", 180000000, "paid", "2026-03-15T00:00:00.000Z", "2026-02-20T15:00:00.000Z", "2026-02-28T15:00:00.000Z");

  const insertReview = sqlite.prepare(`INSERT INTO real_estate_admin_reviews (propertyId,propertyName,reviewer,rating,comment,status,createdAt) VALUES (?,?,?,?,?,?,?)`);
  insertReview.run(1, "Luxury Villa in Ikoyi", "Uma Walker", 5, "Absolutely stunning property. The team made the purchase seamless.", "approved", "2026-05-01T12:00:00.000Z");
  insertReview.run(6, "3-Bedroom Terrace in GRA", "Demo Admin", 4, "Great location and well-built. The estate management is top-notch.", "approved", "2026-04-10T14:00:00.000Z");
  insertReview.run(3, "Executive Duplex in Wuse 2", "Victor Hall", 5, "Couldn't be happier with my purchase. The duplex exceeded expectations.", "approved", "2026-03-15T10:00:00.000Z");
  insertReview.run(5, "Beachfront Land in Elegushi", "Charlie Brown", 3, "Good land but took longer than expected to process the documents.", "approved", "2026-04-01T09:00:00.000Z");
  insertReview.run(2, "Commercial Plot in Lekki", "Tina Lewis", 5, "Excellent investment opportunity. Professional and transparent process.", "pending", "2026-06-02T11:00:00.000Z");

  const insertSettings = sqlite.prepare(`INSERT INTO real_estate_admin_settings (id, data) VALUES (1, ?)`);
  insertSettings.run(JSON.stringify({
    siteName: "Real Estate Admin",
    tagline: "Your Trusted Real Estate Partner",
    email: "info@example.com",
    phone: "+2349000000000",
    address: "22 Admiralty Way, Lekki Phase 1, Lagos",
    currency: "NGN",
    currencySymbol: "₦",
    taxRate: 5,
    commissionRate: 3,
    enablePropertyInquiries: true,
    enableOnlinePayments: true,
    maintenanceMode: false,
    socialLinks: {
      facebook: "https://facebook.com/landshop",
      twitter: "https://twitter.com/landshop",
      instagram: "https://instagram.com/landshop",
      linkedin: "https://linkedin.com/company/landshop",
    },
  }));
};

export const recordRealEstateAdminEvent = (endpoint: string, method: string, body: unknown) => {
  sqlite.prepare(
    "INSERT INTO real_estate_admin_events (endpoint, method, body) VALUES (?, ?, ?)"
  ).run(endpoint, method, body ? JSON.stringify(body) : null);
};

// ---- helpers ----

const mapProperty = (r: any) => r ? { ...r, features: r.features ? JSON.parse(r.features) : [] } : undefined;

export const dbGetAllUsers = (page: number, limit: number) => {
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_users").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_users ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total, page };
};

export const dbGetUserById = (id: number): any => {
  return sqlite.prepare("SELECT * FROM real_estate_admin_users WHERE id = ?").get(id);
};

export const dbFindUserByEmail = (email: string): any => {
  return sqlite.prepare("SELECT * FROM real_estate_admin_users WHERE email = ?").get(email);
};

export const dbUpdateUser = (id: number, data: any) => {
  const existing = sqlite.prepare("SELECT * FROM real_estate_admin_users WHERE id = ?").get(id) as any;
  if (!existing) return undefined;
  const merged = { ...existing, ...data };
  sqlite.prepare("UPDATE real_estate_admin_users SET name=?,email=?,phone=?,role=?,status=? WHERE id=?").run(
    merged.name, merged.email, merged.phone, merged.role, merged.status, id
  );
  return merged;
};

export const dbDeleteUser = (id: number) => {
  sqlite.prepare("DELETE FROM real_estate_admin_users WHERE id = ?").run(id);
};

export const dbGetAllProperties = (page: number, limit: number, type?: string) => {
  if (type) {
    const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_properties WHERE type = ?").get(type) as { c: number }).c;
    const items = (sqlite.prepare("SELECT * FROM real_estate_admin_properties WHERE type = ? ORDER BY id LIMIT ? OFFSET ?").all(type, limit, (page - 1) * limit) as any[]).map(mapProperty);
    return { items, total, page };
  }
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_properties").get() as { c: number }).c;
  const items = (sqlite.prepare("SELECT * FROM real_estate_admin_properties ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit) as any[]).map(mapProperty);
  return { items, total, page };
};

export const dbGetPropertyById = (id: number) => {
  return mapProperty(sqlite.prepare("SELECT * FROM real_estate_admin_properties WHERE id = ?").get(id));
};

export const dbCreateProperty = (data: any) => {
  const features = Array.isArray(data.features) ? JSON.stringify(data.features) : "[]";
  const info = sqlite.prepare(`INSERT INTO real_estate_admin_properties (title,type,price,location,bedrooms,bathrooms,area,status,image,description,features,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    data.title || "New Property",
    data.type || "apartment",
    data.price || 50000000,
    data.location || "Lagos",
    data.bedrooms || 3,
    data.bathrooms || 2,
    data.area || 200,
    "available",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
    data.description || "Property description",
    features,
    new Date().toISOString()
  );
  return mapProperty(sqlite.prepare("SELECT * FROM real_estate_admin_properties WHERE id = ?").get(info.lastInsertRowid));
};

export const dbUpdateProperty = (id: number, data: any) => {
  const existing = mapProperty(sqlite.prepare("SELECT * FROM real_estate_admin_properties WHERE id = ?").get(id));
  if (!existing) return undefined;
  const merged = { ...existing, ...data };
  const features = Array.isArray(merged.features) ? JSON.stringify(merged.features) : merged.features || "[]";
  sqlite.prepare(`UPDATE real_estate_admin_properties SET title=?,type=?,price=?,location=?,bedrooms=?,bathrooms=?,area=?,status=?,image=?,description=?,features=?,createdAt=? WHERE id=?`).run(
    merged.title, merged.type, merged.price, merged.location, merged.bedrooms, merged.bathrooms, merged.area, merged.status, merged.image, merged.description, features, merged.createdAt, id
  );
  return { ...merged, features: JSON.parse(features) };
};

export const dbDeleteProperty = (id: number) => {
  sqlite.prepare("DELETE FROM real_estate_admin_properties WHERE id = ?").run(id);
};

export const dbGetAllDevelopments = (page: number, limit: number) => {
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_developments").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_developments ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total, page };
};

export const dbGetDevelopmentById = (id: number): any => {
  return sqlite.prepare("SELECT * FROM real_estate_admin_developments WHERE id = ?").get(id);
};

export const dbCreateDevelopment = (data: any): any => {
  const info = sqlite.prepare(`INSERT INTO real_estate_admin_developments (name,phase,type,units,completedUnits,status,budget,location,startDate,expectedEndDate,progress) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    data.name || "New Development",
    data.phase || "Phase 1",
    data.type || "residential",
    data.units || 50,
    0,
    "ongoing",
    data.budget || 1000000000,
    data.location || "Lagos",
    new Date().toISOString(),
    new Date(Date.now() + 365 * 86400000).toISOString(),
    0
  );
  return sqlite.prepare("SELECT * FROM real_estate_admin_developments WHERE id = ?").get(info.lastInsertRowid) as any;
};

export const dbUpdateDevelopment = (id: number, data: any) => {
  const existing = sqlite.prepare("SELECT * FROM real_estate_admin_developments WHERE id = ?").get(id) as any;
  if (!existing) return undefined;
  const merged = { ...existing, ...data };
  sqlite.prepare(`UPDATE real_estate_admin_developments SET name=?,phase=?,type=?,units=?,completedUnits=?,status=?,budget=?,location=?,startDate=?,expectedEndDate=?,progress=? WHERE id=?`).run(
    merged.name, merged.phase, merged.type, merged.units, merged.completedUnits, merged.status, merged.budget, merged.location, merged.startDate, merged.expectedEndDate, merged.progress, id
  );
  return merged;
};

export const dbDeleteDevelopment = (id: number) => {
  sqlite.prepare("DELETE FROM real_estate_admin_developments WHERE id = ?").run(id);
};

export const dbGetOngoingDevelopments = (page: number, limit: number) => {
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_developments WHERE status = 'ongoing'").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_developments WHERE status = 'ongoing' ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total };
};

export const dbGetAllGrows = (page: number, limit: number) => {
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_grows").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_grows ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total, page };
};

export const dbGetGrowById = (id: number): any => {
  return sqlite.prepare("SELECT * FROM real_estate_admin_grows WHERE id = ?").get(id);
};

export const dbCreateGrow = (data: any): any => {
  const durationMonths = data.durationMonths || 24;
  const info = sqlite.prepare(`INSERT INTO real_estate_admin_grows (name,type,targetAmount,raisedAmount,roi,durationMonths,status,investors,startDate,endDate) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    data.name || "New Grow Fund",
    data.type || "land_banking",
    data.targetAmount || 100000000,
    0,
    data.roi || 15,
    durationMonths,
    "active",
    0,
    new Date().toISOString(),
    new Date(Date.now() + durationMonths * 30 * 86400000).toISOString()
  );
  return sqlite.prepare("SELECT * FROM real_estate_admin_grows WHERE id = ?").get(info.lastInsertRowid) as any;
};

export const dbUpdateGrow = (id: number, data: any) => {
  const existing = sqlite.prepare("SELECT * FROM real_estate_admin_grows WHERE id = ?").get(id) as any;
  if (!existing) return undefined;
  const merged = { ...existing, ...data };
  sqlite.prepare(`UPDATE real_estate_admin_grows SET name=?,type=?,targetAmount=?,raisedAmount=?,roi=?,durationMonths=?,status=?,investors=?,startDate=?,endDate=? WHERE id=?`).run(
    merged.name, merged.type, merged.targetAmount, merged.raisedAmount, merged.roi, merged.durationMonths, merged.status, merged.investors, merged.startDate, merged.endDate, id
  );
  return merged;
};

export const dbDeleteGrow = (id: number) => {
  sqlite.prepare("DELETE FROM real_estate_admin_grows WHERE id = ?").run(id);
};

export const dbGetActiveGrows = (page: number, limit: number) => {
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_grows WHERE status = 'active'").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_grows WHERE status = 'active' ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total };
};

export const dbGetAllInvestments = (page: number, limit: number) => {
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_investments").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_investments ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total, page };
};

export const dbGetInvestmentById = (id: number): any => {
  return sqlite.prepare("SELECT * FROM real_estate_admin_investments WHERE id = ?").get(id);
};

export const dbCreateInvestment = (data: any): any => {
  const info = sqlite.prepare(`INSERT INTO real_estate_admin_investments (propertyId,propertyName,investor,amount,roi,status,startDate,expectedMaturity,returnsPaid) VALUES (?,?,?,?,?,?,?,?,?)`).run(
    data.propertyId || 1,
    data.propertyName || "Property",
    data.investor || "New Investor",
    data.amount || 10000000,
    data.roi || 12,
    "active",
    new Date().toISOString(),
    new Date(Date.now() + 2 * 365 * 86400000).toISOString(),
    0
  );
  return sqlite.prepare("SELECT * FROM real_estate_admin_investments WHERE id = ?").get(info.lastInsertRowid) as any;
};

export const dbGetAllTransactions = (page: number, limit: number, type?: string) => {
  if (type) {
    const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_transactions WHERE type = ?").get(type) as { c: number }).c;
    const items = sqlite.prepare("SELECT * FROM real_estate_admin_transactions WHERE type = ? ORDER BY id LIMIT ? OFFSET ?").all(type, limit, (page - 1) * limit);
    return { items, total, page };
  }
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_transactions").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_transactions ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total, page };
};

export const dbGetTransactionById = (id: number): any => {
  return sqlite.prepare("SELECT * FROM real_estate_admin_transactions WHERE id = ?").get(id);
};

export const dbGetAllBlogPosts = (page: number, limit: number) => {
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_blog_posts").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_blog_posts ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total, page };
};

export const dbGetBlogPostById = (id: number): any => {
  return sqlite.prepare("SELECT * FROM real_estate_admin_blog_posts WHERE id = ?").get(id);
};

export const dbCreateBlogPost = (data: any): any => {
  const slug = (data.title || "new-post").toLowerCase().replace(/\s+/g, "-");
  const info = sqlite.prepare(`INSERT INTO real_estate_admin_blog_posts (title,slug,excerpt,content,author,category,image,status,publishedAt,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    data.title || "New Post",
    slug,
    data.excerpt || "",
    data.content || "",
    "Demo Admin",
    data.category || "Uncategorized",
    "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600",
    "draft",
    null,
    new Date().toISOString()
  );
  return sqlite.prepare("SELECT * FROM real_estate_admin_blog_posts WHERE id = ?").get(info.lastInsertRowid) as any;
};

export const dbUpdateBlogPost = (id: number, data: any) => {
  const existing = sqlite.prepare("SELECT * FROM real_estate_admin_blog_posts WHERE id = ?").get(id) as any;
  if (!existing) return undefined;
  const merged = { ...existing, ...data };
  sqlite.prepare(`UPDATE real_estate_admin_blog_posts SET title=?,slug=?,excerpt=?,content=?,author=?,category=?,image=?,status=?,publishedAt=?,createdAt=? WHERE id=?`).run(
    merged.title, merged.slug, merged.excerpt, merged.content, merged.author, merged.category, merged.image, merged.status, merged.publishedAt, merged.createdAt, id
  );
  return merged;
};

export const dbDeleteBlogPost = (id: number) => {
  sqlite.prepare("DELETE FROM real_estate_admin_blog_posts WHERE id = ?").run(id);
};

export const dbGetAllContacts = (page: number, limit: number, status?: string) => {
  if (status) {
    const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_contacts WHERE status = ?").get(status) as { c: number }).c;
    const items = sqlite.prepare("SELECT * FROM real_estate_admin_contacts WHERE status = ? ORDER BY id LIMIT ? OFFSET ?").all(status, limit, (page - 1) * limit);
    return { items, total, page };
  }
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_contacts").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_contacts ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total, page };
};

export const dbDeleteContact = (id: number) => {
  sqlite.prepare("DELETE FROM real_estate_admin_contacts WHERE id = ?").run(id);
};

export const dbGetAllInvoices = (page: number, limit: number) => {
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_invoices").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_invoices ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total, page };
};

export const dbGetInvoiceById = (id: number): any => {
  return sqlite.prepare("SELECT * FROM real_estate_admin_invoices WHERE id = ?").get(id);
};

export const dbGetAllReviews = (page: number, limit: number, status?: string) => {
  if (status) {
    const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_reviews WHERE status = ?").get(status) as { c: number }).c;
    const items = sqlite.prepare("SELECT * FROM real_estate_admin_reviews WHERE status = ? ORDER BY id LIMIT ? OFFSET ?").all(status, limit, (page - 1) * limit);
    return { items, total, page };
  }
  const total = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_reviews").get() as { c: number }).c;
  const items = sqlite.prepare("SELECT * FROM real_estate_admin_reviews ORDER BY id LIMIT ? OFFSET ?").all(limit, (page - 1) * limit);
  return { items, total, page };
};

export const dbDeleteReview = (id: number) => {
  sqlite.prepare("DELETE FROM real_estate_admin_reviews WHERE id = ?").run(id);
};

export const dbGetSettings = () => {
  const row = sqlite.prepare("SELECT data FROM real_estate_admin_settings WHERE id = 1").get() as { data: string } | undefined;
  return row ? JSON.parse(row.data) : null;
};

export const dbUpdateSettings = (data: any) => {
  const existing = dbGetSettings();
  const merged = { ...existing, ...data };
  sqlite.prepare("UPDATE real_estate_admin_settings SET data = ? WHERE id = 1").run(JSON.stringify(merged));
  return merged;
};

export const dbGetDashboardStats = () => {
  const totalProperties = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_properties").get() as { c: number }).c;
  const availableProperties = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_properties WHERE status = 'available'").get() as { c: number }).c;
  const totalPropertyValue = (sqlite.prepare("SELECT COALESCE(SUM(price), 0) as s FROM real_estate_admin_properties").get() as { s: number }).s;
  const activeInvestments = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_investments WHERE status = 'active'").get() as { c: number }).c;
  const totalInvested = (sqlite.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM real_estate_admin_investments").get() as { s: number }).s;
  const totalTransactions = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_transactions WHERE status = 'completed'").get() as { c: number }).c;
  const totalRevenue = (sqlite.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM real_estate_admin_transactions WHERE type = 'sale' AND status = 'completed'").get() as { s: number }).s;
  const totalUsers = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_users").get() as { c: number }).c;
  const activeDevelopments = (sqlite.prepare("SELECT COUNT(*) as c FROM real_estate_admin_developments WHERE status = 'ongoing'").get() as { c: number }).c;
  const recentTransactions = sqlite.prepare("SELECT * FROM real_estate_admin_transactions ORDER BY date DESC LIMIT 5").all();
  return {
    totalProperties,
    availableProperties,
    totalPropertyValue,
    activeInvestments,
    totalInvested,
    totalTransactions,
    totalRevenue,
    totalUsers,
    activeDevelopments,
    recentTransactions,
  };
};
