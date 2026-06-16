import { sqlite } from "../../../config/db.js";
import { EventMarketplaceUser, EventMarketplaceBrand, EventMarketplaceProduct, EventMarketplaceEvent } from "../types/index.js";

const UNSPLASH = {
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  avatar2: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
  avatar3: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  product1: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
  product2: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  event: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600",
  brand: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200",
};

const demoProducts: EventMarketplaceProduct[] = [
  { _id: "prod-1", name: "Premium Sneakers", shortDescription: "High-quality sneakers for everyday wear", images: [{ _id: "img-1", src: UNSPLASH.product1, alt: "Premium Sneakers" }], variants: [{ price: 25000, compareAtPrice: 30000 }] },
  { _id: "prod-2", name: "Designer Watch", shortDescription: "Elegant timepiece with leather strap", images: [{ _id: "img-2", src: UNSPLASH.product2, alt: "Designer Watch" }], variants: [{ price: 45000, compareAtPrice: 55000 }] },
];

const demoBrands: EventMarketplaceBrand[] = [
  { _id: "brand-1", name: "Demo Fashion House", profileImage: UNSPLASH.brand, address: { address1: "12 Fashion Avenue", countryLabel: "Nigeria", countryCode: "NG", city: "Lagos" }, phoneNumber: "+2348090001111", email: "info@example.com", rating: 4.5, additionalMedia: [UNSPLASH.product1], description: "A demo fashion brand for portfolio walkthrough", products: { total: demoProducts.length, data: demoProducts } },
  { _id: "brand-2", name: "Demo Luxury Goods", profileImage: UNSPLASH.brand, address: { address1: "8 Luxury Lane", countryLabel: "Nigeria", countryCode: "NG", city: "Abuja" }, phoneNumber: "+2348090002222", email: "contact@example.com", rating: 4.8, additionalMedia: [UNSPLASH.product2], description: "Premium luxury goods demo brand", products: { total: demoProducts.length, data: demoProducts } },
];

const getUserFromDb = (_id: string): EventMarketplaceUser | null => {
  const row = sqlite.prepare("SELECT * FROM event_marketplace_users WHERE _id = ?").get(_id) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    _id: row._id as string,
    typeOfAccount: row.typeOfAccount as string,
    username: row.username as string,
    email: row.email as string,
    isVerified: Boolean(row.isVerified),
    profileStatus: row.profileStatus as string,
    website: row.website as string,
    companyLegalName: row.companyLegalName as string,
    personalInformation: JSON.parse(row.personalInformation_json as string || "{}"),
    creditCardInformation: row.creditCardInformation_json ? JSON.parse(row.creditCardInformation_json as string) : undefined,
    CITI_APE_NAF: row.CITI_APE_NAF as string,
    followers: (row.followers as number) || 0,
    gender: row.gender as string,
    attendedEvents: (row.attendedEvents as number) || 0,
  };
};

const getAllUsersFromDb = (): EventMarketplaceUser[] => {
  const rows = sqlite.prepare("SELECT * FROM event_marketplace_users").all() as Record<string, unknown>[];
  return rows.map((row) => ({
    _id: row._id as string,
    typeOfAccount: row.typeOfAccount as string,
    username: row.username as string,
    email: row.email as string,
    isVerified: Boolean(row.isVerified),
    profileStatus: row.profileStatus as string,
    website: row.website as string,
    companyLegalName: row.companyLegalName as string,
    personalInformation: JSON.parse(row.personalInformation_json as string || "{}"),
    creditCardInformation: row.creditCardInformation_json ? JSON.parse(row.creditCardInformation_json as string) : undefined,
    CITI_APE_NAF: row.CITI_APE_NAF as string,
    followers: (row.followers as number) || 0,
    gender: row.gender as string,
    attendedEvents: (row.attendedEvents as number) || 0,
  }));
};

const getEventFromDb = (_id: string): EventMarketplaceEvent | null => {
  const row = sqlite.prepare("SELECT * FROM event_marketplace_events WHERE _id = ?").get(_id) as Record<string, unknown> | undefined;
  if (!row) return null;
  const seller = row.affiliatedSellerId ? getUserFromDb(row.affiliatedSellerId as string) : undefined;
  const hostIds: string[] = JSON.parse(row.affiliatedHostIds_json as string || "[]");
  const hosts = hostIds.map((id) => getUserFromDb(id)).filter(Boolean) as EventMarketplaceUser[];
  const invitedIds: string[] = JSON.parse(row.invitedPeopleIds_json as string || "[]");
  const invited = invitedIds.map((id) => getUserFromDb(id)).filter(Boolean) as EventMarketplaceUser[];
  return {
    _id: row._id as string,
    name: row.name as string,
    description: row.description as string,
    typeOfEvent: row.typeOfEvent as string,
    statusOfEvent: row.statusOfEvent as string,
    startingEventDateTime: row.startingEventDateTime as string,
    eventMedia: JSON.parse(row.eventMedia_json as string || "[]"),
    isSellerApplicationOpen: Boolean(row.isSellerApplicationOpen),
    isHostessApplicationOpen: Boolean(row.isHostessApplicationOpen),
    affiliatedSeller: seller || undefined,
    affiliatedHosts: hosts,
    invitedPeople: invited,
    eventLocation: row.eventLocation_json ? JSON.parse(row.eventLocation_json as string) : undefined,
    liveShopping: Boolean(row.liveShopping),
    affiliatedBrands: demoBrands,
  };
};

export const resolveField = (field: string, variables: Record<string, unknown>): unknown => {
  if (field === "getUser") {
    const user = getUserFromDb("user-1");
    return { statusCode: 200, success: true, message: "User found", data: user };
  }
  if (field === "login") {
    const { email, password } = variables as { email?: string; password?: string };
    const row = sqlite.prepare("SELECT _id FROM event_marketplace_users WHERE email = ? AND password = ?").get(email, password) as { _id: string } | undefined;
    if (!row) return { statusCode: 401, success: false, message: "Invalid credentials" };
    const user = getUserFromDb(row._id);
    return { statusCode: 200, success: true, message: "Login successful", data: user };
  }
  if (field === "logout") {
    return { statusCode: 200, success: true, message: "Logged out successfully" };
  }
  if (field === "createUser") {
    return { statusCode: 200, success: true, message: "User created successfully", data: getUserFromDb("user-1") };
  }
  if (field === "createPasswordLink") {
    return { statusCode: 200, success: true, message: "Password reset link sent to email" };
  }
  if (field === "newPassword") {
    return { statusCode: 200, success: true, message: "Password updated successfully", data: getUserFromDb("user-1") };
  }
  if (field === "checkUsernameEmailAvailability") {
    return { statusCode: 200, success: true, message: "Available" };
  }
  if (["getAllUsers", "getAllSellers", "getAllHosts", "getAllConsumers"].includes(field)) {
    const users = getAllUsersFromDb();
    const filtered = field === "getAllSellers" ? users.filter((u) => u.typeOfAccount === "SELLER")
      : field === "getAllHosts" ? users.filter((u) => u.typeOfAccount === "HOST")
      : field === "getAllConsumers" ? users.filter((u) => u.typeOfAccount === "CONSUMER")
      : users;
    return { statusCode: 200, success: true, message: "Users found", data: { total: filtered.length, data: filtered } };
  }
  if (field === "getAllBrands") {
    return { statusCode: 200, success: true, message: "Brands found", data: { total: demoBrands.length, data: demoBrands } };
  }
  if (field === "getBrand") {
    const brand = demoBrands.find((b) => b._id === (variables._id as string)) || demoBrands[0];
    return { statusCode: 200, success: true, message: "Brand found", data: brand };
  }
  if (field === "getAllEvents") {
    const rows = sqlite.prepare("SELECT * FROM event_marketplace_events").all() as Record<string, unknown>[];
    const events = rows.map((row) => getEventFromDb(row._id as string)).filter(Boolean) as EventMarketplaceEvent[];
    return { statusCode: 200, success: true, message: "Events found", data: { total: events.length, data: events } };
  }
  if (field === "getEvent") {
    const event = getEventFromDb(variables._id as string);
    if (!event) return { statusCode: 404, success: false, message: "Event not found" };
    return { statusCode: 200, success: true, message: "Event found", data: event };
  }
  if (field === "createEvent" || field === "editEvent") {
    return { statusCode: 200, success: true, message: "Event saved", data: { _id: "event-new", name: (variables.args as Record<string, unknown>)?.name as string || "Demo Event", description: (variables.args as Record<string, unknown>)?.description as string || "", typeOfEvent: (variables.args as Record<string, unknown>)?.typeOfEvent as string || "PHYSICAL", startingEventDateTime: (variables.args as Record<string, unknown>)?.startingEventDateTime as string || new Date().toISOString() } };
  }
  if (field === "deleteEvent") {
    return { statusCode: 200, success: true, message: "Event deleted" };
  }
  if (field === "getOneConversationByUserId") {
    const row = sqlite.prepare("SELECT * FROM event_marketplace_conversations WHERE _id = ?").get("conv-1") as Record<string, unknown> | undefined;
    const messages = sqlite.prepare("SELECT * FROM event_marketplace_messages WHERE conversationId = ?").all("conv-1") as Record<string, unknown>[];
    return { statusCode: 200, data: { messages: messages.map((m) => ({ _id: m._id, sender: m.sender, recipients: JSON.parse(m.recipients_json as string), message: m.message, messageType: m.messageType, recipientsReadReceipt: JSON.parse(m.recipientsReadReceipt_json as string || "[]"), senderReadReceipt: JSON.parse(m.senderReadReceipt_json as string || "[]"), createdAt: m.createdAt })) } };
  }
  if (field === "getAllConversations") {
    const rows = sqlite.prepare("SELECT * FROM event_marketplace_conversations").all() as Record<string, unknown>[];
    return { statusCode: 200, message: "Conversations found", data: rows.map((r) => ({ id: r._id, participants: JSON.parse(r.participants_json as string) })) };
  }
  if (field === "getUsers") {
    const users = getAllUsersFromDb();
    return { statusCode: 200, message: "Users found", data: users.map((u) => ({ _id: u._id, username: u.username, email: u.email, personalInformation: { profileImageLink: u.personalInformation?.profileImageLink, firstName: u.personalInformation?.firstName, lastName: u.personalInformation?.lastName, address: { countryLabel: u.personalInformation?.address?.countryLabel } } })) };
  }
  if (field === "getUserById") {
    const user = getUserFromDb(variables._id as string);
    return { _id: user?._id, email: user?.email, typeOfAccount: user?.typeOfAccount, username: user?.username, website: user?.website, companyLegalName: user?.companyLegalName, personalInformation: { address: { city: user?.personalInformation?.address?.city, countryLabel: user?.personalInformation?.address?.countryLabel, zipCode: user?.personalInformation?.address?.zipCode }, profileImageLink: user?.personalInformation?.profileImageLink, firstName: user?.personalInformation?.firstName, lastName: user?.personalInformation?.lastName } };
  }
  if (field === "getMediaMessages") {
    const messages = sqlite.prepare("SELECT * FROM event_marketplace_messages WHERE conversationId = ?").all("conv-1") as Record<string, unknown>[];
    return { statusCode: 200, data: messages.map((m) => ({ message: m.message, messageType: m.messageType })) };
  }
  if (field === "createMessage") {
    return { statusCode: 200, message: "Message sent" };
  }
  if (field === "createLiveEventMessage") {
    return { statusCode: 200, message: "Live event message sent" };
  }
  if (field === "updateReadReceipt") {
    return { statusCode: 200, success: true, data: { acknowledged: true } };
  }
  if (field === "Follow") {
    return { statusCode: 200, success: true, message: "Followed successfully" };
  }
  if (field === "getMedia") {
    const row = sqlite.prepare("SELECT * FROM event_marketplace_media WHERE _id = ?").get(variables._id as string) as Record<string, unknown> | undefined;
    if (!row) return { statusCode: 404, success: false, message: "Media not found" };
    return { statusCode: 200, success: true, message: "Media found", data: { _id: row._id, src: row.src, alt: row.alt, name: row.name } };
  }
  if (field === "createMedia") {
    return { statusCode: 200, success: true, message: "Media uploaded", data: { _id: "media-new", name: "uploaded-file.jpg", alt: "Uploaded file", src: UNSPLASH.product1, type: "image" } };
  }
  if (field === "getAllNotifications") {
    const rows = sqlite.prepare("SELECT * FROM event_marketplace_notifications").all() as Record<string, unknown>[];
    return { statusCode: 200, success: true, message: "Notifications found", data: { total: rows.length, data: rows.map((r) => ({ _id: r._id, message: r.message, typeOfNotification: r.typeOfNotification, read: Boolean(r.read), parentId: r.parentId, dismissed: Boolean(r.dismissed), followerId: r.followerId, followedId: r.followedId })) } };
  }

  // Stripe/Payment operations
  if (field === "getStripeId") {
    return { statusCode: 200, success: true, message: "Stripe ID found", data: { id: "acct_demo_1" } };
  }
  if (field === "listCards") {
    const cards = sqlite.prepare("SELECT * FROM event_marketplace_stripe_cards WHERE userId = ?").all("user-1") as Record<string, unknown>[];
    return { statusCode: 200, success: true, message: "Cards found", data: { data: cards.map((c) => ({ cardId: c.cardId, name: c.name, number: c.number, brand: c.brand, address: c.address, exp_month: c.exp_month, exp_year: c.exp_year, default: Boolean(c.is_default) })) } };
  }
  if (field === "listBanks") {
    const banks = sqlite.prepare("SELECT * FROM event_marketplace_stripe_banks WHERE userId = ?").all("user-1") as Record<string, unknown>[];
    return { statusCode: 200, success: true, message: "Banks found", data: { data: banks.map((b) => ({ bankId: b.bankId, account_name: b.account_name, account_number: b.account_number, country: b.country, bank_name: b.bank_name, default: Boolean(b.is_default) })) } };
  }
  if (field === "createCustomer") {
    const args = (variables.args as Record<string, unknown>) || {};
    return { statusCode: 200, success: true, message: "Customer created", data: { name: (args.name as string) || "Demo Customer", email: (args.email as string) || "demo@example.com", invoice_prefix: "DEMO-INV" } };
  }
  if (field === "createCard") {
    return { statusCode: 200, success: true, message: "Card created", data: { id: "card_new", card: { brand: "Visa", last4: "4242" }, billing_details: { address: { city: "Ibadan", country: "NG", state: "Oyo", line1: "Demo Address" }, name: "Demo Card" } } };
  }
  if (field === "attachPaymentToCustomer") {
    return { statusCode: 200, success: true, message: "Payment attached", data: { id: "pm_demo", card: { brand: "Visa", last4: "4242" }, billing_details: { address: { city: "Ibadan", country: "NG", state: "Oyo", line1: "Demo Address" }, name: "Demo Customer" } } };
  }
  if (field === "deleteCard") {
    return { statusCode: 200, success: true, message: "Card deleted" };
  }
  if (field === "updateCard") {
    return { statusCode: 200, success: true, message: "Card updated" };
  }
  if (field === "createBank") {
    return { statusCode: 200, success: true, message: "Bank created", data: { account_holder_name: "Demo Seller", bank_name: "Demo Bank", country: "NG", last4: "6789" } };
  }
  if (field === "createBanktoken") {
    return { statusCode: 200, success: true, message: "Bank token created", data: { id: "bt_demo", used: false } };
  }
  if (field === "updateBank") {
    return { statusCode: 200, success: true, message: "Bank updated", data: { last4: "6789" } };
  }

  return { statusCode: 200, success: true, message: "Operation completed", data: {} };
};
