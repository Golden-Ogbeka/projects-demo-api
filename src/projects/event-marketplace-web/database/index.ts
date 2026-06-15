import { sqlite } from "../../../config/db.js";

export const setupEventMarketplaceDatabase = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS event_marketplace_users (
      _id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL DEFAULT 'password',
      typeOfAccount TEXT NOT NULL DEFAULT 'SELLER',
      username TEXT,
      isVerified INTEGER NOT NULL DEFAULT 1,
      profileStatus TEXT NOT NULL DEFAULT 'ACTIVE',
      website TEXT,
      companyLegalName TEXT,
      companyRegistrationNumber TEXT,
      businessAgreementTandC INTEGER DEFAULT 1,
      vat TEXT,
      signedDocuments TEXT,
      availability TEXT,
      description TEXT,
      gender TEXT,
      numericSignature TEXT,
      eventType TEXT,
      personalInformation_json TEXT,
      creditCardInformation_json TEXT,
      CITI_APE_NAF TEXT,
      followers INTEGER DEFAULT 0,
      attendedEvents INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_marketplace_events (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      typeOfEvent TEXT NOT NULL DEFAULT 'PHYSICAL',
      statusOfEvent TEXT NOT NULL DEFAULT 'DRAFT',
      startingEventDateTime TEXT,
      eventMedia_json TEXT,
      isSellerApplicationOpen INTEGER NOT NULL DEFAULT 1,
      isHostessApplicationOpen INTEGER NOT NULL DEFAULT 1,
      affiliatedSellerId TEXT,
      affiliatedBrandIds_json TEXT,
      affiliatedHostIds_json TEXT,
      invitedPeopleIds_json TEXT,
      eventLocation_json TEXT,
      liveShopping INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (affiliatedSellerId) REFERENCES event_marketplace_users(_id)
    );

    CREATE TABLE IF NOT EXISTS event_marketplace_messages (
      _id TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      recipients_json TEXT NOT NULL,
      message TEXT NOT NULL,
      messageType TEXT NOT NULL DEFAULT 'text',
      conversationId TEXT NOT NULL,
      recipientsReadReceipt_json TEXT,
      senderReadReceipt_json TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_marketplace_conversations (
      _id TEXT PRIMARY KEY,
      participants_json TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_marketplace_notifications (
      _id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      typeOfNotification TEXT NOT NULL DEFAULT 'general',
      read INTEGER NOT NULL DEFAULT 0,
      parentId TEXT,
      dismissed INTEGER NOT NULL DEFAULT 0,
      followerId TEXT,
      followedId TEXT,
      userId TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_marketplace_media (
      _id TEXT PRIMARY KEY,
      src TEXT NOT NULL,
      alt TEXT,
      name TEXT,
      type TEXT NOT NULL DEFAULT 'image',
      category TEXT NOT NULL DEFAULT 'USER',
      userId TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_marketplace_stripe_cards (
      _id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      cardId TEXT,
      name TEXT,
      number TEXT,
      brand TEXT,
      address TEXT,
      exp_month INTEGER,
      exp_year INTEGER,
      is_default INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_marketplace_stripe_banks (
      _id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bankId TEXT,
      account_name TEXT,
      account_number TEXT,
      country TEXT,
      bank_name TEXT,
      is_default INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_marketplace_stripe_customers (
      _id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      invoice_prefix TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS event_marketplace_graphql_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_name TEXT,
      root_fields TEXT,
      variables_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const userCount = sqlite.prepare("SELECT COUNT(*) as count FROM event_marketplace_users").get() as { count: number };
  if (userCount.count === 0) {
    const user1PI = JSON.stringify({ profileImageLink: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200", firstName: "Demo", lastName: "Seller", address: { address1: "12 Demo Street", city: "Ibadan", zipCode: "200001", countryCode: "NG", countryLabel: "Nigeria", region: "Oyo", civility: "Mr" }, phoneNumber: "+2348012345678", interestTags: ["fashion", "tech"], description: "Demo seller", favouriteCategories: ["electronics"] });
    const user1CC = JSON.stringify({ IBAN: "DEMOIBAN001", bankName: "Demo Bank", city: "Ibadan" });
    const user2PI = JSON.stringify({ profileImageLink: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200", firstName: "Demo", lastName: "Host", address: { address1: "34 Host Avenue", city: "Lagos", zipCode: "100001", countryCode: "NG", countryLabel: "Nigeria", region: "Lagos" }, phoneNumber: "+2348090001111", interestTags: ["events", "music"], description: "Demo host", favouriteCategories: [] });
    const user3PI = JSON.stringify({ profileImageLink: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", firstName: "Demo", lastName: "Consumer", address: { address1: "56 Consumer Road", city: "Abuja", zipCode: "900001", countryCode: "NG", countryLabel: "Nigeria" }, phoneNumber: "+2348090002222", interestTags: ["shopping"], description: "", favouriteCategories: ["food"] });
    const users = [
      { _id: "user-1", email: "demo@demo.com", password: "password", typeOfAccount: "SELLER", username: "demo_seller", isVerified: 1, profileStatus: "ACTIVE", website: "https://demo-store.com", companyLegalName: "Demo Seller Ltd", companyRegistrationNumber: "RC-DEMO-001", businessAgreementTandC: 1, vat: "VAT-DEMO-001", signedDocuments: "demo-agreement.pdf", availability: "available", description: "Demo seller account", gender: "MALE", numericSignature: "123456", eventType: "PHYSICAL", personalInformation_json: user1PI, creditCardInformation_json: user1CC, CITI_APE_NAF: "DEMO-CITI-001", followers: 42, attendedEvents: 5 },
      { _id: "user-2", email: "demo2@demo.com", password: "password", typeOfAccount: "HOST", username: "demo_host", isVerified: 1, profileStatus: "ACTIVE", website: "", companyLegalName: "", companyRegistrationNumber: "", businessAgreementTandC: 1, vat: "", signedDocuments: "", availability: "available", description: "Demo host account", gender: "FEMALE", numericSignature: "789012", eventType: "VIRTUAL", personalInformation_json: user2PI, creditCardInformation_json: JSON.stringify({}), CITI_APE_NAF: "", followers: 28, attendedEvents: 12 },
      { _id: "user-3", email: "consumer@demo.com", password: "password", typeOfAccount: "CONSUMER", username: "demo_consumer", isVerified: 1, profileStatus: "ACTIVE", website: "", companyLegalName: "", companyRegistrationNumber: "", businessAgreementTandC: 1, vat: "", signedDocuments: "", availability: "", description: "Demo consumer", gender: "MALE", numericSignature: "345678", eventType: "PHYSICAL", personalInformation_json: user3PI, creditCardInformation_json: JSON.stringify({}), CITI_APE_NAF: "", followers: 3, attendedEvents: 0 },
    ];
    const insert = sqlite.prepare(`
      INSERT INTO event_marketplace_users (_id, email, password, typeOfAccount, username, isVerified, profileStatus, website, companyLegalName, companyRegistrationNumber, businessAgreementTandC, vat, signedDocuments, availability, description, gender, numericSignature, eventType, personalInformation_json, creditCardInformation_json, CITI_APE_NAF, followers, attendedEvents)
      VALUES (@_id, @email, @password, @typeOfAccount, @username, @isVerified, @profileStatus, @website, @companyLegalName, @companyRegistrationNumber, @businessAgreementTandC, @vat, @signedDocuments, @availability, @description, @gender, @numericSignature, @eventType, @personalInformation_json, @creditCardInformation_json, @CITI_APE_NAF, @followers, @attendedEvents)
    `);
    users.forEach((u) => insert.run(u));
  }

  const eventCount = sqlite.prepare("SELECT COUNT(*) as count FROM event_marketplace_events").get() as { count: number };
  if (eventCount.count === 0) {
    const events = [
      { _id: "event-1", name: "Demo Fashion Show", description: "A demo fashion event", typeOfEvent: "PHYSICAL", statusOfEvent: "PUBLISHED", startingEventDateTime: "2026-07-15T14:00:00.000Z", eventMedia_json: JSON.stringify(["https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600"]), isSellerApplicationOpen: 1, isHostessApplicationOpen: 1, affiliatedSellerId: "user-1", affiliatedBrandIds_json: JSON.stringify([]), affiliatedHostIds_json: JSON.stringify(["user-2"]), invitedPeopleIds_json: JSON.stringify(["user-3"]), eventLocation_json: JSON.stringify({ address1: "Demo Convention Center", address2: "Suite 100", city: "Ibadan", zipCode: "200001", countryCode: "NG", countryLabel: "Nigeria" }), liveShopping: 0 },
    ];
    const insert = sqlite.prepare(`
      INSERT INTO event_marketplace_events (_id, name, description, typeOfEvent, statusOfEvent, startingEventDateTime, eventMedia_json, isSellerApplicationOpen, isHostessApplicationOpen, affiliatedSellerId, affiliatedBrandIds_json, affiliatedHostIds_json, invitedPeopleIds_json, eventLocation_json, liveShopping)
      VALUES (@_id, @name, @description, @typeOfEvent, @statusOfEvent, @startingEventDateTime, @eventMedia_json, @isSellerApplicationOpen, @isHostessApplicationOpen, @affiliatedSellerId, @affiliatedBrandIds_json, @affiliatedHostIds_json, @invitedPeopleIds_json, @eventLocation_json, @liveShopping)
    `);
    events.forEach((e) => insert.run(e));
  }

  const mediaCount = sqlite.prepare("SELECT COUNT(*) as count FROM event_marketplace_media").get() as { count: number };
  if (mediaCount.count === 0) {
    const media = [
      { _id: "media-1", src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600", alt: "Demo fashion event", name: "fashion-event.jpg", type: "image", category: "EVENT", userId: "user-1" },
      { _id: "media-2", src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600", alt: "Demo profile", name: "profile.jpg", type: "image", category: "USER", userId: "user-1" },
    ];
    const insert = sqlite.prepare(`INSERT INTO event_marketplace_media (_id, src, alt, name, type, category, userId) VALUES (@_id, @src, @alt, @name, @type, @category, @userId)`);
    media.forEach((m) => insert.run(m));
  }

  const conversationCount = sqlite.prepare("SELECT COUNT(*) as count FROM event_marketplace_conversations").get() as { count: number };
  if (conversationCount.count === 0) {
    const convParticipants = JSON.stringify([{ _id: "user-1", email: "demo@demo.com", username: "demo_seller", personalInformation: { profileImageLink: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200", firstName: "Demo", lastName: "Seller", address: { countryLabel: "Nigeria", city: "Ibadan" } } }, { _id: "user-3", email: "consumer@demo.com", username: "demo_consumer", personalInformation: { profileImageLink: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200", firstName: "Demo", lastName: "Consumer", address: { countryLabel: "Nigeria", city: "Abuja" } } }]);
    sqlite.prepare(`INSERT INTO event_marketplace_conversations (_id, participants_json) VALUES ('conv-1', @participants)`).run({ participants: convParticipants });
    const msgRecipients = JSON.stringify(["user-3"]);
    const msgReceipt = JSON.stringify([]);
    const msgSenderReceipt = JSON.stringify(["user-1"]);
    sqlite.prepare(`INSERT INTO event_marketplace_messages (_id, sender, recipients_json, message, messageType, conversationId, recipientsReadReceipt_json, senderReadReceipt_json) VALUES ('msg-1', 'user-1', @recipients, 'Hello!', 'text', 'conv-1', @receipt, @senderReceipt)`).run({ recipients: msgRecipients, receipt: msgReceipt, senderReceipt: msgSenderReceipt });
  }

  const notifCount = sqlite.prepare("SELECT COUNT(*) as count FROM event_marketplace_notifications").get() as { count: number };
  if (notifCount.count === 0) {
    sqlite.prepare(`INSERT INTO event_marketplace_notifications (_id, message, typeOfNotification, read, parentId, dismissed, followerId, followedId, userId) VALUES ('notif-1', 'Welcome to EventMarketplace!', 'general', 0, '', 0, '', '', 'user-1')`).run();
  }

  const stripeCustomerCount = sqlite.prepare("SELECT COUNT(*) as count FROM event_marketplace_stripe_customers").get() as { count: number };
  if (stripeCustomerCount.count === 0) {
    sqlite.prepare(`INSERT INTO event_marketplace_stripe_customers (_id, email, name, invoice_prefix) VALUES ('cus-1', 'demo@demo.com', 'Demo Seller', 'DEMO-INV')`).run();
    sqlite.prepare(`INSERT INTO event_marketplace_stripe_cards (_id, userId, cardId, name, number, brand, address, exp_month, exp_year, is_default) VALUES ('card-1', 'user-1', 'card_demo_1', 'Demo Card', '4242', 'Visa', 'Demo Address', 12, 2028, 1)`).run();
    sqlite.prepare(`INSERT INTO event_marketplace_stripe_banks (_id, userId, bankId, account_name, account_number, country, bank_name, is_default) VALUES ('bank-1', 'user-1', 'bank_demo_1', 'Demo Seller', '0123456789', 'NG', 'Demo Bank', 1)`).run();
  }
};
