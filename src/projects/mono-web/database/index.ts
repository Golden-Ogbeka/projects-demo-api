import { sqlite } from "../../../config/db.js";

const USERS = [
  {
    profileId: "CS0000000000001",
    firstName: "Demo",
    lastName: "User",
    email: "demo@example.com",
    phoneNumber: "08012345678",
    password: "password",
    isVerified: 1,
    twoFactorAuthStatus: "D",
    profileImage:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  },
  {
    profileId: "CS0000000000002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    phoneNumber: "08098765432",
    password: "Password2",
    isVerified: 1,
    twoFactorAuthStatus: "R",
    profileImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
  },
  {
    profileId: "CS0000000000003",
    firstName: "Unverified",
    lastName: "User",
    email: "unverified@example.com",
    phoneNumber: "08055555555",
    password: "password",
    isVerified: 0,
    twoFactorAuthStatus: "D",
    profileImage: null,
  },
];

const TRANSACTIONS: {
  email: string;
  items: {
    type: string;
    amount: number;
    description: string;
    days: number;
    status: string;
  }[];
}[] = [
  {
    email: "demo@example.com",
    items: [
      { type: "credit", amount: 1000000, description: "Wallet funded via bank transfer", days: 60, status: "successful" },
      { type: "credit", amount: 500000, description: "Wallet funded via card payment", days: 45, status: "successful" },
      { type: "debit", amount: 300000, description: "Investment in Lekki Gardens Phase 2", days: 40, status: "successful" },
      { type: "debit", amount: 500000, description: "Investment in Abuja Crown Estate", days: 30, status: "successful" },
      { type: "credit", amount: 45000, description: "Monthly ROI payout — Lekki Gardens Phase 2", days: 25, status: "successful" },
      { type: "credit", amount: 300000, description: "Wallet funded via bank transfer", days: 20, status: "successful" },
      { type: "credit", amount: 62500, description: "Monthly ROI payout — Abuja Crown Estate", days: 15, status: "successful" },
      { type: "debit", amount: 150000, description: "Investment in Port Harcourt Shoreline", days: 14, status: "successful" },
      { type: "debit", amount: 100000, description: "Cash out to GTBank (****6789)", days: 10, status: "successful" },
      { type: "credit", amount: 25000, description: "Port Harcourt Shoreline ROI payout", days: 7, status: "successful" },
      { type: "credit", amount: 75000, description: "Investment payout — matured property", days: 4, status: "successful" },
      { type: "debit", amount: 50000, description: "Cash out to GTBank (****6789)", days: 1, status: "successful" },
    ],
  },
  {
    email: "jane@example.com",
    items: [
      { type: "credit", amount: 2000000, description: "Wallet funded via bank transfer", days: 90, status: "successful" },
      { type: "credit", amount: 750000, description: "Wallet funded via card payment", days: 60, status: "successful" },
      { type: "debit", amount: 500000, description: "Investment in Lekki Gardens Phase 2", days: 55, status: "successful" },
      { type: "debit", amount: 1000000, description: "Investment in Abuja Crown Estate", days: 40, status: "successful" },
      { type: "credit", amount: 75000, description: "Monthly ROI payout — Lekki Gardens Phase 2", days: 30, status: "successful" },
      { type: "credit", amount: 125000, description: "Monthly ROI payout — Abuja Crown Estate", days: 20, status: "successful" },
      { type: "debit", amount: 375000, description: "Investment in Port Harcourt Shoreline", days: 18, status: "successful" },
      { type: "debit", amount: 200000, description: "Cash out to Access Bank (****2345)", days: 12, status: "successful" },
      { type: "credit", amount: 50000, description: "Port Harcourt Shoreline ROI payout", days: 8, status: "successful" },
      { type: "credit", amount: 150000, description: "Wallet funded via bank transfer", days: 5, status: "successful" },
      { type: "debit", amount: 300000, description: "New investment — Lagos Business Park", days: 3, status: "successful" },
    ],
  },
];

const PROPERTIES = [
  {
    propertyId: "PROP-001",
    name: "Lekki Gardens Phase 2",
    description:
      "Premium residential plots in the heart of Lekki. Guaranteed 18% ROI in 12 months with flexible payment plans. Located close to schools, hospitals, and shopping malls.",
    location: "Lekki, Lagos",
    price: 500000,
    roi: 18,
    dueDate: "2026-12-31",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716",
    available: 1,
  },
  {
    propertyId: "PROP-002",
    name: "Abuja Crown Estate",
    description:
      "Luxury apartments in Maitama district with 15% ROI over 18 months. Fully serviced with 24/7 security, power backup, and recreational facilities.",
    location: "Maitama, Abuja",
    price: 1000000,
    roi: 15,
    dueDate: "2027-06-30",
    image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0",
    available: 1,
  },
  {
    propertyId: "PROP-003",
    name: "Port Harcourt Shoreline",
    description:
      "Waterfront commercial properties with strong rental yield of 20%. Ideal for hospitality and retail businesses in the oil and gas hub.",
    location: "GRA Phase 3, Port Harcourt",
    price: 750000,
    roi: 20,
    dueDate: "2026-09-30",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    available: 1,
  },
  {
    propertyId: "PROP-004",
    name: "Ibadan Smart City",
    description:
      "Affordable smart home units in the emerging Ibadan tech corridor. 22% ROI with guaranteed tenant placement within 3 months of completion.",
    location: "Ologuneru, Ibadan",
    price: 350000,
    roi: 22,
    dueDate: "2026-06-30",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    available: 1,
  },
  {
    propertyId: "PROP-005",
    name: "Lagos Business Park",
    description:
      "Grade-A office spaces in Victoria Island. 12% annual ROI with 5-year lease guarantees from blue-chip tenants.",
    location: "Victoria Island, Lagos",
    price: 1500000,
    roi: 12,
    dueDate: "2028-03-31",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    available: 1,
  },
];

const INVESTMENTS: {
  email: string;
  items: { propertyId: string; amount: number; status: string; days: number }[];
}[] = [
  {
    email: "demo@example.com",
    items: [
      { propertyId: "PROP-001", amount: 300000, status: "active", days: 40 },
      { propertyId: "PROP-002", amount: 500000, status: "active", days: 30 },
      { propertyId: "PROP-003", amount: 150000, status: "active", days: 14 },
    ],
  },
  {
    email: "jane@example.com",
    items: [
      { propertyId: "PROP-001", amount: 500000, status: "active", days: 55 },
      { propertyId: "PROP-002", amount: 1000000, status: "active", days: 40 },
      { propertyId: "PROP-003", amount: 375000, status: "active", days: 18 },
      { propertyId: "PROP-005", amount: 300000, status: "active", days: 3 },
    ],
  },
];

export const setupMonoWebDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS mono_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profileId TEXT NOT NULL UNIQUE,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phoneNumber TEXT NOT NULL,
      password TEXT NOT NULL,
      isVerified INTEGER NOT NULL DEFAULT 0,
      verificationToken TEXT,
      resetToken TEXT,
      twoFactorAuthStatus TEXT NOT NULL DEFAULT 'D',
      twoFactorOtp TEXT,
      profileImage TEXT,
      session TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mono_banks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      bankCode TEXT NOT NULL,
      bankName TEXT NOT NULL,
      accountNumber TEXT NOT NULL,
      accountName TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mono_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      transactionRef TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'successful',
      description TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mono_properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      propertyId TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      price REAL NOT NULL,
      roi REAL NOT NULL,
      dueDate TEXT NOT NULL,
      image TEXT NOT NULL,
      available INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS mono_user_investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      propertyId TEXT NOT NULL,
      amount REAL NOT NULL,
      transactionRef TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const userCount = sqlite
    .prepare("SELECT COUNT(*) as count FROM mono_users")
    .get() as { count: number };

  if (userCount.count > 0) return;

  const insertUser = sqlite.prepare(
    `INSERT INTO mono_users
      (profileId, firstName, lastName, email, phoneNumber, password, isVerified, twoFactorAuthStatus, profileImage)
     VALUES
      (@profileId, @firstName, @lastName, @email, @phoneNumber, @password, @isVerified, @twoFactorAuthStatus, @profileImage)`,
  );

  for (const u of USERS) insertUser.run(u);

  const insertTx = sqlite.prepare(
    `INSERT INTO mono_transactions (userId, transactionRef, type, amount, status, description, createdAt)
     VALUES (@userId, @transactionRef, @type, @amount, @status, @description, @createdAt)`,
  );

  let txCounter = 0;
  for (const group of TRANSACTIONS) {
    const user = sqlite
      .prepare("SELECT id FROM mono_users WHERE email = ?")
      .get(group.email) as { id: number };

    for (const tx of group.items) {
      txCounter++;
      const date = new Date();
      date.setDate(date.getDate() - tx.days);
      insertTx.run({
        userId: user.id,
        transactionRef: `TXN-DEMO-${String(txCounter).padStart(4, "0")}`,
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        description: tx.description,
        createdAt: date.toISOString(),
      });
    }
  }

  const insertProp = sqlite.prepare(
    `INSERT INTO mono_properties (propertyId, name, description, location, price, roi, dueDate, image, available)
     VALUES (@propertyId, @name, @description, @location, @price, @roi, @dueDate, @image, @available)`,
  );

  for (const p of PROPERTIES) insertProp.run(p);

  const insertInv = sqlite.prepare(
    `INSERT INTO mono_user_investments (userId, propertyId, amount, transactionRef, status, createdAt)
     VALUES (@userId, @propertyId, @amount, @transactionRef, @status, @createdAt)`,
  );

  let invCounter = 0;
  for (const group of INVESTMENTS) {
    const user = sqlite
      .prepare("SELECT id FROM mono_users WHERE email = ?")
      .get(group.email) as { id: number };

    for (const inv of group.items) {
      invCounter++;
      const date = new Date();
      date.setDate(date.getDate() - inv.days);
      insertInv.run({
        userId: user.id,
        propertyId: inv.propertyId,
        amount: inv.amount,
        transactionRef: `INV-DEMO-${String(invCounter).padStart(4, "0")}`,
        status: inv.status,
        createdAt: date.toISOString(),
      });
    }
  }

  const insertBank = sqlite.prepare(
    `INSERT INTO mono_banks (userId, bankCode, bankName, accountNumber, accountName)
     VALUES (@userId, @bankCode, @bankName, @accountNumber, @accountName)`,
  );

  const demoUser = sqlite
    .prepare("SELECT id FROM mono_users WHERE email = ?")
    .get("demo@example.com") as { id: number };

  insertBank.run({
    userId: demoUser.id,
    bankCode: "058",
    bankName: "GTBank",
    accountNumber: "0123456789",
    accountName: "Demo User",
  });

  const janeUser = sqlite
    .prepare("SELECT id FROM mono_users WHERE email = ?")
    .get("jane@example.com") as { id: number };

  insertBank.run({
    userId: janeUser.id,
    bankCode: "044",
    bankName: "Access Bank",
    accountNumber: "0987654321",
    accountName: "Jane Smith",
  });
};
