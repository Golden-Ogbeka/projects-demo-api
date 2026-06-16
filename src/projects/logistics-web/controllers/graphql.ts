import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { recordLogisticsWebOperation } from "../database/index.js";
import { GraphqlRequestBody } from "../types/index.js";

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

const extractRootFields = (query = "") => {
  const firstBrace = query.indexOf("{");
  if (firstBrace === -1) return [];
  const fields = new Set<string>();
  let depth = 0;
  let parenDepth = 0;
  let token = "";
  let readingAlias = false;
  const pushToken = () => {
    const value = token.trim();
    token = "";
    if (!value || readingAlias || value.startsWith("__")) return;
    fields.add(value);
  };
  for (let index = firstBrace + 1; index < query.length; index += 1) {
    const char = query[index];
    if (char === "(") { if (depth === 0) pushToken(); parenDepth += 1; continue; }
    if (char === ")") { parenDepth = Math.max(parenDepth - 1, 0); continue; }
    if (parenDepth > 0) continue;
    if (char === "{") { if (depth === 0) pushToken(); depth += 1; continue; }
    if (char === "}") { if (depth === 0) break; depth -= 1; continue; }
    if (depth !== 0) continue;
    if (char === ":") { readingAlias = true; token = ""; continue; }
    if (/[A-Za-z0-9_]/.test(char)) { token += char; readingAlias = false; continue; }
    pushToken();
    readingAlias = false;
  }
  return Array.from(fields);
};

const makeUserData = (overrides?: Record<string, unknown>) => {
  let dbUser: Record<string, unknown> | undefined;
  if (overrides?._id) {
    dbUser = sqlite.prepare("SELECT * FROM logistics_web_users WHERE _id = ?").get(overrides._id) as Record<string, unknown> | undefined;
  }
  if (!dbUser) {
    dbUser = sqlite.prepare("SELECT * FROM logistics_web_users LIMIT 1").get() as Record<string, unknown> | undefined;
  }
  return {
    _id: (overrides?._id as string) || (dbUser?._id as string) || "ship-user-1",
    name: (overrides?.name as string) || (overrides?.fullName as string) || (dbUser?.fullName as string) || "Demo User",
    firstName: (overrides?.firstName as string) || (dbUser?.firstName as string) || "Demo",
    lastName: (overrides?.lastName as string) || (dbUser?.lastName as string) || "User",
    otherName: (overrides?.otherName as string) || "",
    email: (overrides?.email as string) || (dbUser?.email as string) || "demo@example.com",
    userName: (overrides?.userName as string) || ((overrides?.name as string) || (dbUser?.fullName as string) || "Demo User").toLowerCase().replace(/\s/g, "."),
    phoneNumber: (overrides?.phoneNumber as string) || (dbUser?.phoneNumber as string) || "+2348012345678",
    role: (overrides?.role as string) || (dbUser?.role as string) || "CUSTOMER",
    accountType: (overrides?.accountType as string) || "PERSONAL",
    isEmailVerified: (overrides?.isEmailVerified as boolean) ?? true,
    isPhoneNumberVerified: (overrides?.isPhoneNumberVerified as boolean) ?? true,
    referralCode: (overrides?.referralCode as string) || "DEMO123",
    createdAt: (overrides?.createdAt as string) || (dbUser?.createdAt as string) || daysAgo(30),
  };
};

const makeShipment = (overrides?: Record<string, unknown>) => {
  let dbUser: Record<string, unknown> | undefined;
  if (overrides?._id) {
    dbUser = sqlite.prepare("SELECT * FROM logistics_web_users WHERE _id = ?").get("ship-user-1") as Record<string, unknown> | undefined;
  }
  if (!dbUser) {
    dbUser = sqlite.prepare("SELECT * FROM logistics_web_users LIMIT 1").get() as Record<string, unknown> | undefined;
  }
  const userName = (overrides?.senderFirstName as string) || (dbUser?.firstName as string) || "Demo";
  const userLastName = (overrides?.senderLastName as string) || (dbUser?.lastName as string) || "User";
  const userFullName = `${userName} ${userLastName}`;
  const userEmail = (overrides?.senderEmail as string) || (dbUser?.email as string) || "demo@example.com";
  const userPhone = (overrides?.senderPhone as string) || (dbUser?.phoneNumber as string) || "+2348012345678";

  return {
    _id: (overrides?._id as string) || "ship-1",
    user: makeUserData((overrides?.user as Record<string, unknown>) || undefined),
    parcelSender: {
      userAddress: (overrides?.senderAddress as string) || "12 Ikeja Way, Lagos",
      firstName: userName,
      lastName: userLastName,
      email: userEmail,
      phoneNumber: userPhone,
      city: (overrides?.senderCity as string) || "Lagos",
      state: (overrides?.senderState as string) || "Lagos",
      country: (overrides?.senderCountry as string) || "Nigeria",
      zipPostalCode: (overrides?.senderZip as string) || "100001",
      companyName: (overrides?.senderCompany as string) || "",
    },
    parcelReceiver: {
      userAddress: (overrides?.receiverAddress as string) || "15 Central Avenue",
      firstName: (overrides?.receiverFirstName as string) || "Abiola",
      lastName: (overrides?.receiverLastName as string) || "Receiver",
      email: (overrides?.receiverEmail as string) || "abiola@example.com",
      phoneNumber: (overrides?.receiverPhone as string) || "+2348091111111",
      city: (overrides?.receiverCity as string) || "Abuja",
      state: (overrides?.receiverState as string) || "FCT",
      country: (overrides?.receiverCountry as string) || "Nigeria",
      zipPostalCode: (overrides?.receiverZip as string) || "900001",
      companyName: (overrides?.receiverCompany as string) || "",
    },
    parcel: {
      parcelType: (overrides?.parcelType as string) || "DOCUMENT",
      franchisePartner: {
        address: "",
        partnerFullName: "",
        email: "",
        phoneNumber: "",
        state: "",
      },
      parcelContent: (overrides?.parcelContent as string) || "Business documents",
      itemCategory: (overrides?.itemCategory as string) || "DOCUMENTS",
      quantity: (overrides?.quantity as string) || "1",
      weight: (overrides?.weight as string) || "0.5",
      totalValue: (overrides?.totalValue as string) || "10000",
      packaging: (overrides?.packaging as string) || "ENVELOPE",
      picture: (overrides?.picture as string) || "",
      nin: (overrides?.nin as string) || "12345678901",
      proofOfPaymentAndOwnership: (overrides?.proofOfPayment as string) || "",
      insurance: (overrides?.insurance as string) || "NO",
    },
    courierPartner: (overrides?.courierPartner as string) || "DHL",
    shipmentType: (overrides?.shipmentType as string) || "INTERNATIONAL",
    shipmentStatus: (overrides?.shipmentStatus as string) || "PROCESSING",
    payment: {
      _id: (overrides?.paymentId as string) || "pay-1",
      shipment: {
        _id: (overrides?._id as string) || "ship-1",
        courierPartner: (overrides?.courierPartner as string) || "DHL",
        shipmentType: (overrides?.shipmentType as string) || "INTERNATIONAL",
        shipmentStatus: (overrides?.shipmentStatus as string) || "PROCESSING",
        createdAt: daysAgo(2),
      },
      paystackTransId: (overrides?.paystackRef as string) || "ps_abc123",
      amount: (overrides?.amount as number) || 45000,
      status: (overrides?.paymentStatus as string) || "AWAITING_PAYMENT",
      createdAt: daysAgo(2),
    },
    createdAt: (overrides?.createdAt as string) || daysAgo(2),
  };
};

const makeDemoQuoteResponse = (field: string, _variables: Record<string, unknown>) => ({
  statusCode: 200,
  success: true,
  message: `${field} successful`,
  data: {
    quoteId: `quote-${Date.now()}`,
    products: [
      {
        productName: "Express 12:00",
        productCode: "EXPRESS_1200",
        localProductCountryCode: "NG",
        totalPrice: { currencyType: "NGN", priceCurrency: "NGN", price: 45000 },
        totalPriceBreakdown: [{ typeCode: "FREIGHT", price: 40000 }, { typeCode: "FUEL", price: 5000 }],
        weight: { volumetric: 0.5, provided: 1.0, unitOfMeasurement: "KG" },
        networkTypeCode: "AL",
        deliveryInfo: {
          deliveryTypeCode: "DOOR_TO_DOOR",
          estimatedDeliveryDateAndTime: daysAgo(-3),
          destinationServiceAreaCode: "LOS",
          destinationFacilityAreaCode: "ABV",
          deliveryMessage: "Deliver by end of day",
        },
      },
      {
        productName: "Economy Select",
        productCode: "ECONOMY_SELECT",
        localProductCountryCode: "NG",
        totalPrice: { currencyType: "NGN", priceCurrency: "NGN", price: 25000 },
        totalPriceBreakdown: [{ typeCode: "FREIGHT", price: 22000 }, { typeCode: "FUEL", price: 3000 }],
        weight: { volumetric: 0.5, provided: 1.0, unitOfMeasurement: "KG" },
        networkTypeCode: "AL",
        deliveryInfo: {
          deliveryTypeCode: "DOOR_TO_DOOR",
          estimatedDeliveryDateAndTime: daysAgo(-5),
          destinationServiceAreaCode: "LOS",
          destinationFacilityAreaCode: "ABV",
          deliveryMessage: "Deliver within 5 business days",
        },
      },
    ],
  },
});

const paginated = (items: unknown[], page = 1, size = 50) => ({
  nodes: items,
  data: items,
  items,
  total: items.length,
  count: items.length,
  pageInfo: { totalItems: items.length, totalCount: items.length, currentPage: page, page: page, size, hasNextPage: false, hasPreviousPage: false },
});

const resolveField = (field: string, variables: Record<string, unknown>): unknown => {

  // --- Auth ---

  if (field === "login") {
    const loginInput = (variables.loginInput as Record<string, unknown>) || {};
    const email = (loginInput.email as string) || (variables.email as string) || "";
    const password = (loginInput.password as string) || (variables.password as string) || "";
    const user = sqlite.prepare("SELECT * FROM logistics_web_users WHERE email = ? AND password = ?").get(email, password) as Record<string, unknown> | undefined;
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }
    return {
      success: true,
      data: makeUserData({
        _id: user._id as string,
        referralCode: "DEMO123",
      }),
    };
  }

  if (field === "logout") {
    return { statusCode: 200, success: true };
  }

  if (field === "forgotPassword") {
    return true;
  }

  if (field === "sendVerificationMail") {
    return true;
  }

  if (field === "updateResetPassword") {
    return true;
  }

  if (field === "verifyEmail") {
    return true;
  }

  // --- User ---

  if (field === "getUser") {
    const userId = (variables.userId as string) || (variables.id as string) || "";
    const user = userId
      ? sqlite.prepare("SELECT * FROM logistics_web_users WHERE _id = ? OR userId = ?").get(userId, userId) as Record<string, unknown> | undefined
      : sqlite.prepare("SELECT * FROM logistics_web_users LIMIT 1").get() as Record<string, unknown> | undefined;
    return { data: makeUserData(user ? { _id: user._id as string } : undefined) };
  }

  if (field === "getUsers") {
    const rows = sqlite.prepare("SELECT * FROM logistics_web_users").all() as Record<string, unknown>[];
    return {
      statusCode: 200,
      success: true,
      message: "Users fetched successfully",
      data: [
        makeUserData(rows[0] ? { _id: rows[0]._id as string } : undefined),
        makeUserData({
          _id: "ship-user-2", firstName: "Jane", lastName: "Admin",
          name: "Jane Smith", email: "jane@example.com", role: "ADMIN",
        }),
        makeUserData({
          _id: "ship-user-3", firstName: "Bob", lastName: "Staff",
          name: "Bob Johnson", email: "bob@example.com", role: "STAFF",
        }),
      ],
    };
  }

  if (field === "getUserById") {
    const id = (variables.id as string) || (variables.userId as string) || "";
    const user = id
      ? sqlite.prepare("SELECT * FROM logistics_web_users WHERE _id = ? OR userId = ?").get(id, id) as Record<string, unknown> | undefined
      : undefined;
    return {
      statusCode: 200,
      success: true,
      message: "User fetched successfully",
      data: makeUserData(user ? { _id: user._id as string } : undefined),
    };
  }

  if (field === "editUser") {
    return true;
  }

  if (field === "createNewUser") {
    return { success: true };
  }

  if (field === "sendPhoneVerificationOTP") {
    return true;
  }

  if (field === "verifyPhoneNumber") {
    return true;
  }

  if (field === "upgradePersonalAccountToBusiness") {
    return true;
  }

  // --- Shipments ---

  if (field === "getUserShipments") {
    const pageNumber = ((variables.input as Record<string, unknown>)?.pageNumber as number) || 1;
    const pageSize = ((variables.input as Record<string, unknown>)?.pageSize as number) || 50;
    const start = (pageNumber - 1) * pageSize;
    const rows = sqlite.prepare("SELECT * FROM logistics_web_shipments LIMIT ? OFFSET ?").all(pageSize, start) as Record<string, unknown>[];
    const total = (sqlite.prepare("SELECT COUNT(*) as count FROM logistics_web_shipments").get() as { count: number }).count;
    const items = rows.map((r) => {
      const data = r.data ? JSON.parse(r.data as string) : {};
      return makeShipment(data);
    });
    return {
      statusCode: 200,
      success: true,
      message: "User shipments fetched successfully",
      data: { count: total, shipments: items },
    };
  }

  if (field === "getShipments") {
    const pageNumber = ((variables.input as Record<string, unknown>)?.pageNumber as number) || 1;
    const pageSize = ((variables.input as Record<string, unknown>)?.pageSize as number) || 50;
    const start = (pageNumber - 1) * pageSize;
    const rows = sqlite.prepare("SELECT * FROM logistics_web_shipments LIMIT ? OFFSET ?").all(pageSize, start) as Record<string, unknown>[];
    const items = rows.map((r) => {
      const data = r.data ? JSON.parse(r.data as string) : {};
      return makeShipment(data);
    });
    return {
      statusCode: 200,
      success: true,
      message: "Shipments fetched successfully",
      data: items,
    };
  }

  if (field === "getShipment") {
    const shipmentId = ((variables.input as Record<string, unknown>)?._id as string) || (variables.id as string) || "";
    const row = shipmentId
      ? sqlite.prepare("SELECT * FROM logistics_web_shipments WHERE _id = ?").get(shipmentId) as Record<string, unknown> | undefined
      : sqlite.prepare("SELECT * FROM logistics_web_shipments LIMIT 1").get() as Record<string, unknown> | undefined;
    const data = row?.data ? JSON.parse(row.data as string) : {};
    return {
      statusCode: 200,
      success: true,
      message: "Shipment fetched successfully",
      data: makeShipment(data),
    };
  }

  if (field === "createShipment") {
    const shipment = makeShipment({ _id: `ship-${Date.now()}` });
    sqlite.prepare(
      `INSERT INTO logistics_web_shipments (_id, user_id, courierPartner, shipmentType, shipmentStatus, amount, paymentStatus, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(shipment._id, "ship-user-1", shipment.courierPartner, shipment.shipmentType, shipment.shipmentStatus, 0, "AWAITING_PAYMENT", JSON.stringify({ _id: shipment._id }));
    return {
      statusCode: 200,
      success: true,
      message: "Shipment created successfully",
      data: {
        shipment,
        authorizationUrl: "https://demo-paystack.com/authorize/demo-ref",
      },
    };
  }

  if (field === "createDhlShipment") {
    const _id = `ship-${Date.now()}`;
    const shipment = {
      _id,
      courierPartner: "DHL",
      shipmentType: "INTERNATIONAL",
      shipmentStatus: "PROCESSING",
      dhlShipmentTrackingNumber: `DHL-${1000 + Math.floor(Math.random() * 9000)}`,
      paymentType: "WALLET",
    };
    sqlite.prepare(
      `INSERT INTO logistics_web_shipments (_id, user_id, courierPartner, shipmentType, shipmentStatus, amount, paymentStatus, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(_id, "ship-user-1", "DHL", "INTERNATIONAL", "PROCESSING", 0, "AWAITING_PAYMENT", JSON.stringify({ _id, courierPartner: "DHL", shipmentType: "INTERNATIONAL", shipmentStatus: "PROCESSING" }));
    return {
      statusCode: 200,
      success: true,
      message: "DHL shipment created successfully",
      data: {
        shipment,
        authorizationUrl: "https://demo-paystack.com/authorize/demo-ref",
      },
    };
  }

  if (field === "createTopshipShipment") {
    const _id = `ship-${Date.now()}`;
    const shipment = {
      _id,
      courierPartner: "TOPSHIP",
      shipmentType: "INTERNATIONAL",
      shipmentStatus: "PROCESSING",
      thirdPartyCourierShipmentTrackingNumber: `TS-${1000 + Math.floor(Math.random() * 9000)}`,
      paymentType: "WALLET",
    };
    sqlite.prepare(
      `INSERT INTO logistics_web_shipments (_id, user_id, courierPartner, shipmentType, shipmentStatus, amount, paymentStatus, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(_id, "ship-user-1", "TOPSHIP", "INTERNATIONAL", "PROCESSING", 0, "AWAITING_PAYMENT", JSON.stringify({ _id, courierPartner: "TOPSHIP", shipmentType: "INTERNATIONAL", shipmentStatus: "PROCESSING" }));
    return {
      statusCode: 200,
      success: true,
      message: "Topship shipment created successfully",
      data: {
        shipment,
        authorizationUrl: "https://demo-paystack.com/authorize/demo-ref",
      },
    };
  }

  if (field === "createFedexShipment") {
    const _id = `ship-${Date.now()}`;
    const shipment = {
      _id,
      courierPartner: "FEDEX",
      shipmentType: "INTERNATIONAL",
      shipmentStatus: "PROCESSING",
      thirdPartyCourierShipmentTrackingNumber: `FX-${1000 + Math.floor(Math.random() * 9000)}`,
      paymentType: "WALLET",
    };
    sqlite.prepare(
      `INSERT INTO logistics_web_shipments (_id, user_id, courierPartner, shipmentType, shipmentStatus, amount, paymentStatus, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(_id, "ship-user-1", "FEDEX", "INTERNATIONAL", "PROCESSING", 0, "AWAITING_PAYMENT", JSON.stringify({ _id, courierPartner: "FEDEX", shipmentType: "INTERNATIONAL", shipmentStatus: "PROCESSING" }));
    return {
      statusCode: 200,
      success: true,
      message: "FedEx shipment created successfully",
      data: {
        shipment,
        authorizationUrl: "https://demo-paystack.com/authorize/demo-ref",
      },
    };
  }

  // --- Quoting ---

  if (field === "validateAddressAndGetQuote") {
    return makeDemoQuoteResponse("validateAddressAndGetQuote", variables);
  }

  if (field === "getTopShipQuote") {
    return makeDemoQuoteResponse("getTopShipQuote", variables);
  }

  if (field === "getFedexQuote") {
    return makeDemoQuoteResponse("getFedexQuote", variables);
  }

  // --- Alias: frontend has some components that read getUserTransactions instead of getWalletTransactions ---

  if (field === "getUserTransactions") {
    const pageNumber = ((variables.input as Record<string, unknown>)?.pageNumber as number) || 1;
    const pageSize = ((variables.input as Record<string, unknown>)?.pageSize as number) || 50;
    const start = (pageNumber - 1) * pageSize;
    const rows = sqlite.prepare("SELECT * FROM logistics_web_transactions ORDER BY createdAt DESC LIMIT ? OFFSET ?").all(pageSize, start) as Record<string, unknown>[];
    const total = (sqlite.prepare("SELECT COUNT(*) as count FROM logistics_web_transactions").get() as { count: number }).count;
    const items = rows.map((t) => ({
      _id: t._id,
      amount: t.amount,
      type: t.type === "payment" ? "DEBIT" : t.type === "funding" ? "FUNDING" : t.type === "refund" ? "INTRA_APPLICATION_INBOUND_TRANSFER" : "DEBIT",
      status: t.status === "completed" ? "COMPLETED" : t.status === "pending" ? "AWAITING_PAYMENT" : "FAILED",
      paystackRefId: t.reference,
      failureReason: "",
      createdAt: t.createdAt,
    }));
    return {
      statusCode: 200,
      success: true,
      message: "Transactions fetched successfully",
      data: { total, rows: items },
    };
  }

  // --- Wallet ---

  if (field === "getWalletBalance") {
    const wallet = sqlite.prepare("SELECT * FROM logistics_web_wallet LIMIT 1").get() as Record<string, unknown> | undefined;
    return {
      statusCode: 200,
      success: true,
      message: "Wallet balance fetched successfully",
      data: { balance: wallet?.balance || 0 },
    };
  }

  if (field === "getWalletTransactions") {
    const pageNumber = ((variables.input as Record<string, unknown>)?.pageNumber as number) || 1;
    const pageSize = ((variables.input as Record<string, unknown>)?.pageSize as number) || 50;
    const start = (pageNumber - 1) * pageSize;
    const rows = sqlite.prepare("SELECT * FROM logistics_web_transactions ORDER BY createdAt DESC LIMIT ? OFFSET ?").all(pageSize, start) as Record<string, unknown>[];
    const total = (sqlite.prepare("SELECT COUNT(*) as count FROM logistics_web_transactions").get() as { count: number }).count;
    const items = rows.map((t) => ({
      _id: t._id,
      amount: t.amount,
      type: t.type === "payment" ? "DEBIT" : t.type === "funding" ? "FUNDING" : t.type === "refund" ? "INTRA_APPLICATION_INBOUND_TRANSFER" : "DEBIT",
      status: t.status === "completed" ? "COMPLETED" : t.status === "pending" ? "AWAITING_PAYMENT" : "FAILED",
      paystackRefId: t.reference,
      failureReason: "",
      createdAt: t.createdAt,
    }));
    return {
      statusCode: 200,
      success: true,
      message: "Transactions fetched successfully",
      data: { total, rows: items },
    };
  }

  if (field === "fundWallet") {
    return {
      statusCode: 200,
      success: true,
      message: "Wallet funding initiated",
      data: { authorizationUrl: "https://demo-paystack.com/authorize/fund-demo-ref" },
    };
  }

  // --- Referral ---

  if (field === "getReferralCount") {
    return {
      statusCode: 200,
      success: true,
      message: "Referral count fetched",
      data: { totalReferrals: 5 },
    };
  }

  // --- Notifications ---

  if (field === "getUserNotifications") {
    const pageNumber = ((variables.input as Record<string, unknown>)?.pageNumber as number) || 1;
    const pageSize = ((variables.input as Record<string, unknown>)?.pageSize as number) || 50;
    const start = (pageNumber - 1) * pageSize;
    const rows = sqlite.prepare("SELECT * FROM logistics_web_notifications ORDER BY createdAt DESC LIMIT ? OFFSET ?").all(pageSize, start) as Record<string, unknown>[];
    const total = (sqlite.prepare("SELECT COUNT(*) as count FROM logistics_web_notifications").get() as { count: number }).count;
    const items = rows.map((n) => ({
      _id: n._id,
      user: { _id: n.userId },
      message: n.message,
      isAdminNotification: false,
    }));
    return {
      statusCode: 200,
      success: true,
      message: "Notifications fetched successfully",
      data: { count: total, data: items },
    };
  }

  // --- Ratings & Reviews ---

  if (field === "getAllShipmentRatings") {
    return {
      statusCode: 200,
      success: true,
      message: "Ratings fetched successfully",
      data: {
        count: 3,
        data: [
          { _id: "review-1", rating: 5, review: "Excellent service, fast delivery!" },
          { _id: "review-2", rating: 4, review: "Good service, package arrived in good condition." },
          { _id: "review-3", rating: 3, review: "Average experience, delivery was a bit late." },
        ],
      },
    };
  }

  if (field === "addRatingAndReview") {
    return {
      statusCode: 200,
      success: true,
      message: "Rating added successfully",
      data: {
        _id: `review-${Date.now()}`,
        rating: (variables.input as Record<string, unknown>)?.rating as number || 5,
        review: (variables.input as Record<string, unknown>)?.review as string || "Great!",
      },
    };
  }

  // --- Insurance ---

  if (field === "getInsurancePremiums") {
    return [
      { _id: "prem-1", class: "BASIC", minAssetValue: 1000, maxAssetValue: 50000, premium: 500 },
      { _id: "prem-2", class: "STANDARD", minAssetValue: 50001, maxAssetValue: 200000, premium: 2000 },
      { _id: "prem-3", class: "PREMIUM", minAssetValue: 200001, maxAssetValue: 1000000, premium: 10000 },
    ];
  }

  // --- Quotation ---

  if (field === "getQuotation") {
    return 4200;
  }

  // --- Existing legacy operations kept for backwards compat ---

  if (field === "createUser") {
    const user = sqlite.prepare("SELECT * FROM logistics_web_users LIMIT 1").get() as Record<string, unknown> | undefined;
    return {
      token: "demo-logistics-web-token",
      user: user || { _id: "ship-user-1", email: "demo@example.com" },
      expiresIn: 86400,
    };
  }

  if (field === "updateUser") {
    const user = sqlite.prepare("SELECT * FROM logistics_web_users LIMIT 1").get() as Record<string, unknown> | undefined;
    return { user: { ...(user || {}), ...variables } };
  }

  if (field === "upgradeToBusinessAccount") {
    const biz = sqlite.prepare("SELECT * FROM logistics_web_business_accounts LIMIT 1").get() as Record<string, unknown> | undefined;
    return { businessAccount: biz || { _id: "ship-business-1" }, success: true };
  }

  if (field === "sendMoneyRequest") {
    return {
      moneyRequest: {
        _id: "mr-1",
        amount: (variables.amount as number) || 0,
        from: "ship-user-1",
        to: (variables.to as string) || "recipient-1",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      success: true,
    };
  }

  if (field === "getShippingPrices") {
    const rows = sqlite.prepare("SELECT * FROM logistics_web_pricing").all() as Record<string, unknown>[];
    const grouped: Record<string, Record<string, unknown>[]> = { intraCity: [], interCity: [], international: [] };
    for (const r of rows) {
      const g = r.pricing_group as string;
      const obj = r.data ? JSON.parse(r.data as string) : { from: r.from_loc, to: r.to_loc, price: r.price, currency: r.currency, estimatedDays: r.estimatedDays };
      if (grouped[g]) {
        grouped[g].push(obj);
      }
    }
    return grouped;
  }

  if (field === "getShippingPrice") {
    const from = (variables.fromCity as string) || "Lagos";
    const to = (variables.toCity as string) || "Abuja";
    const row = sqlite.prepare("SELECT * FROM logistics_web_pricing WHERE from_loc = ? AND to_loc = ? LIMIT 1").get(from, to) as Record<string, unknown> | undefined;
    if (row) {
      return {
        price: row.price,
        currency: row.currency,
        estimatedDays: row.estimatedDays,
        from: row.from_loc,
        to: row.to_loc,
      };
    }
    return {
      price: 3500,
      currency: "NGN",
      estimatedDays: "2-3",
      from,
      to,
    };
  }

  if (field === "createParcel") {
    const _id = `parcel-${Date.now()}`;
    const parcel = {
      _id,
      id: _id,
      parcelId: `SA-${1000 + Math.floor(Math.random() * 9000)}`,
      trackingNumber: `SA-${1000 + Math.floor(Math.random() * 9000)}-NG-LA`,
      name: (variables.name as string) || "New Parcel",
      description: (variables.description as string) || "",
      weight: (variables.weight as number) || 1.0,
      weightUnit: "kg",
      dimensions: (variables.dimensions as Record<string, unknown>) || { length: 30, width: 20, height: 10, unit: "cm" },
      status: "pending",
      origin: (variables.origin as Record<string, unknown>) || { country: "Nigeria", city: "Lagos" },
      destination: (variables.destination as Record<string, unknown>) || { country: "Nigeria", city: "Abuja" },
      senderName: "Demo User",
      senderPhone: "+2348012345678",
      receiverName: (variables.receiverName as string) || "Receiver",
      receiverPhone: (variables.receiverPhone as string) || "+2348090000000",
      shippingPrice: (variables.shippingPrice as number) || 3500,
      currency: "NGN",
      estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sqlite.prepare(
      `INSERT INTO logistics_web_parcels (_id, parcelId, trackingNumber, name, description, weight, weightUnit, status, origin_city, origin_country, destination_city, destination_country, senderName, senderPhone, receiverName, receiverPhone, shippingPrice, currency, estimatedDelivery, createdAt, updatedAt, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      parcel._id, parcel.parcelId, parcel.trackingNumber, parcel.name, parcel.description,
      parcel.weight, parcel.weightUnit, parcel.status,
      (parcel.origin as Record<string, unknown>)?.city as string || "Lagos",
      (parcel.origin as Record<string, unknown>)?.country as string || "Nigeria",
      (parcel.destination as Record<string, unknown>)?.city as string || "Abuja",
      (parcel.destination as Record<string, unknown>)?.country as string || "Nigeria",
      parcel.senderName, parcel.senderPhone, parcel.receiverName, parcel.receiverPhone,
      parcel.shippingPrice, parcel.currency, parcel.estimatedDelivery, parcel.createdAt, parcel.updatedAt,
      JSON.stringify({ dimensions: parcel.dimensions, origin: parcel.origin, destination: parcel.destination })
    );
    return { parcel, success: true };
  }

  if (field === "updateParcel") {
    const parcelId = (variables.parcelId as string) || (variables.id as string);
    const parcel = sqlite.prepare("SELECT * FROM logistics_web_parcels WHERE _id = ? OR parcelId = ? LIMIT 1").get(parcelId, parcelId) as Record<string, unknown> | undefined;
    if (parcel) {
      const data = parcel.data ? JSON.parse(parcel.data as string) : {};
      const updated = {
        _id: parcel._id,
        id: parcel._id,
        parcelId: parcel.parcelId,
        trackingNumber: parcel.trackingNumber,
        name: (variables.name as string) || parcel.name,
        description: (variables.description as string) || parcel.description,
        weight: (variables.weight as number) || parcel.weight,
        weightUnit: "kg",
        dimensions: data.dimensions || { length: 30, width: 20, height: 10, unit: "cm" },
        status: (variables.status as string) || parcel.status,
        origin: data.origin || { country: parcel.origin_country, city: parcel.origin_city },
        destination: data.destination || { country: parcel.destination_country, city: parcel.destination_city },
        senderName: parcel.senderName,
        senderPhone: parcel.senderPhone,
        receiverName: (variables.receiverName as string) || parcel.receiverName,
        receiverPhone: (variables.receiverPhone as string) || parcel.receiverPhone,
        shippingPrice: (variables.shippingPrice as number) || parcel.shippingPrice,
        currency: "NGN",
        estimatedDelivery: parcel.estimatedDelivery,
        createdAt: parcel.createdAt,
        updatedAt: new Date().toISOString(),
      };
      sqlite.prepare("UPDATE logistics_web_parcels SET name = ?, description = ?, weight = ?, status = ?, receiverName = ?, receiverPhone = ?, shippingPrice = ?, updatedAt = ? WHERE _id = ?").run(
        updated.name, updated.description, updated.weight, updated.status, updated.receiverName, updated.receiverPhone,
        updated.shippingPrice, updated.updatedAt, parcel._id
      );
      return { parcel: updated, success: true };
    }
    return { parcel: { _id: "parcel-1", ...variables }, success: true };
  }

  if (field === "deleteParcel") {
    return { deleted: true, success: true };
  }

  if (field === "cancelParcel") {
    const parcelId = (variables.parcelId as string) || (variables.id as string);
    const parcel = parcelId
      ? sqlite.prepare("SELECT * FROM logistics_web_parcels WHERE _id = ? OR parcelId = ? LIMIT 1").get(parcelId, parcelId) as Record<string, unknown> | undefined
      : undefined;
    if (parcel) {
      sqlite.prepare("UPDATE logistics_web_parcels SET status = 'cancelled', updatedAt = ? WHERE _id = ?").run(new Date().toISOString(), parcel._id);
    }
    return { parcel: { ...(parcel || { _id: "parcel-1" }), status: "cancelled", cancelledAt: new Date().toISOString() }, success: true };
  }

  if (field === "getParcels") {
    const status = variables.status as string;
    let rows: Record<string, unknown>[];
    if (status) {
      rows = sqlite.prepare("SELECT * FROM logistics_web_parcels WHERE status = ?").all(status) as Record<string, unknown>[];
    } else {
      rows = sqlite.prepare("SELECT * FROM logistics_web_parcels").all() as Record<string, unknown>[];
    }
    const items = rows.map((r) => {
      const data = r.data ? JSON.parse(r.data as string) : {};
      return {
        _id: r._id,
        id: r._id,
        parcelId: r.parcelId,
        trackingNumber: r.trackingNumber,
        name: r.name,
        description: r.description,
        weight: r.weight,
        weightUnit: r.weightUnit || "kg",
        dimensions: data.dimensions || {},
        status: r.status,
        origin: data.origin || { country: r.origin_country, city: r.origin_city },
        destination: data.destination || { country: r.destination_country, city: r.destination_city },
        senderName: r.senderName,
        senderPhone: r.senderPhone,
        receiverName: r.receiverName,
        receiverPhone: r.receiverPhone,
        shippingPrice: r.shippingPrice,
        currency: r.currency || "NGN",
        estimatedDelivery: r.estimatedDelivery,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        ...(r.deliveredAt ? { deliveredAt: r.deliveredAt } : {}),
        ...(data.cancelledAt ? { cancelledAt: data.cancelledAt } : {}),
        ...(data.cancelReason ? { cancelReason: data.cancelReason } : {}),
      };
    });
    return paginated(items);
  }

  if (field === "getParcel") {
    const parcelId = (variables.parcelId as string) || (variables.id as string);
    const row = parcelId
      ? sqlite.prepare("SELECT * FROM logistics_web_parcels WHERE parcelId = ? OR _id = ? LIMIT 1").get(parcelId, parcelId) as Record<string, unknown> | undefined
      : sqlite.prepare("SELECT * FROM logistics_web_parcels LIMIT 1").get() as Record<string, unknown> | undefined;
    if (!row) return { _id: "parcel-1", name: "Unknown" };
    const data = row.data ? JSON.parse(row.data as string) : {};
    return {
      _id: row._id,
      id: row._id,
      parcelId: row.parcelId,
      trackingNumber: row.trackingNumber,
      name: row.name,
      description: row.description,
      weight: row.weight,
      weightUnit: row.weightUnit || "kg",
      dimensions: data.dimensions || {},
      status: row.status,
      origin: data.origin || { country: row.origin_country, city: row.origin_city },
      destination: data.destination || { country: row.destination_country, city: row.destination_city },
      senderName: row.senderName,
      senderPhone: row.senderPhone,
      receiverName: row.receiverName,
      receiverPhone: row.receiverPhone,
      shippingPrice: row.shippingPrice,
      currency: row.currency || "NGN",
      estimatedDelivery: row.estimatedDelivery,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(row.deliveredAt ? { deliveredAt: row.deliveredAt } : {}),
      ...(data.cancelledAt ? { cancelledAt: data.cancelledAt } : {}),
      ...(data.cancelReason ? { cancelReason: data.cancelReason } : {}),
    };
  }

  if (field === "trackParcel") {
    const trackingNumber = (variables.trackingNumber as string) || "";
    const row = trackingNumber
      ? sqlite.prepare("SELECT * FROM logistics_web_parcels WHERE trackingNumber = ? LIMIT 1").get(trackingNumber) as Record<string, unknown> | undefined
      : sqlite.prepare("SELECT * FROM logistics_web_parcels LIMIT 1").get() as Record<string, unknown> | undefined;
    if (!row) return { _id: "parcel-1", name: "Unknown" };
    const data = row.data ? JSON.parse(row.data as string) : {};
    return {
      _id: row._id,
      id: row._id,
      parcelId: row.parcelId,
      trackingNumber: row.trackingNumber,
      name: row.name,
      description: row.description,
      weight: row.weight,
      weightUnit: row.weightUnit || "kg",
      dimensions: data.dimensions || {},
      status: row.status,
      origin: data.origin || { country: row.origin_country, city: row.origin_city },
      destination: data.destination || { country: row.destination_country, city: row.destination_city },
      senderName: row.senderName,
      senderPhone: row.senderPhone,
      receiverName: row.receiverName,
      receiverPhone: row.receiverPhone,
      shippingPrice: row.shippingPrice,
      currency: row.currency || "NGN",
      estimatedDelivery: row.estimatedDelivery,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(row.deliveredAt ? { deliveredAt: row.deliveredAt } : {}),
      ...(data.cancelledAt ? { cancelledAt: data.cancelledAt } : {}),
      ...(data.cancelReason ? { cancelReason: data.cancelReason } : {}),
    };
  }

  if (field === "getCountries") {
    const rows = sqlite.prepare("SELECT * FROM logistics_web_countries").all() as Record<string, unknown>[];
    return rows.map((r) => ({
      _id: `country-${(r.isoCode as string).toLowerCase()}`,
      name: r.name,
      code: r.isoCode,
      flag: `https://flagcdn.com/${(r.isoCode as string).toLowerCase()}.svg`,
      currency: r.isoCode === "NG" ? "NGN" : r.isoCode === "GH" ? "GHS" : r.isoCode === "GB" ? "GBP" : r.isoCode === "US" ? "USD" : "CAD",
      currencySymbol: r.isoCode === "NG" ? "\u20A6" : r.isoCode === "GH" ? "GH\u20B5" : r.isoCode === "GB" ? "\u00A3" : r.isoCode === "US" ? "$" : "CA$",
      phoneCode: r.isoCode === "NG" ? "+234" : r.isoCode === "GH" ? "+233" : r.isoCode === "GB" ? "+44" : r.isoCode === "US" ? "+1" : "+1",
      isActive: true,
    }));
  }

  if (field === "getCities") {
    const countryCode = (variables.countryCode as string) || "NG";
    const rows = sqlite.prepare("SELECT * FROM logistics_web_cities WHERE countryCode = ?").all(countryCode) as Record<string, unknown>[];
    return rows.map((r) => ({
      id: `city-${(r.name as string).toLowerCase().replace(/\s/g, "-")}`,
      name: r.name,
    }));
  }

  if (field === "getNotifications") {
    const rows = sqlite.prepare("SELECT * FROM logistics_web_notifications").all() as Record<string, unknown>[];
    const items = rows.map((r) => ({
      _id: r._id,
      id: r._id,
      title: "",
      message: r.message,
      type: r.type,
      isRead: Boolean(r.isRead),
      userId: r.userId,
      createdAt: r.createdAt,
    }));
    return paginated(items);
  }

  if (field === "getUnreadNotificationCount") {
    const count = (sqlite.prepare("SELECT COUNT(*) as count FROM logistics_web_notifications WHERE isRead = 0").get() as { count: number }).count;
    return count;
  }

  if (field === "getWallet") {
    const wallet = sqlite.prepare("SELECT * FROM logistics_web_wallet LIMIT 1").get() as Record<string, unknown> | undefined;
    if (wallet?.data) {
      return JSON.parse(wallet.data as string);
    }
    return {
      _id: wallet?._id || "wallet-1",
      id: wallet?._id || "wallet-1",
      userId: wallet?.userId || "ship-user-1",
      balance: wallet?.balance || 0,
      currency: wallet?.currency || "NGN",
      ledgerBalance: wallet?.balance || 0,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(0),
    };
  }

  if (field === "getTransactions") {
    const rows = sqlite.prepare("SELECT * FROM logistics_web_transactions").all() as Record<string, unknown>[];
    const items = rows.map((r) => ({
      _id: r._id,
      id: r._id,
      reference: r.reference,
      type: r.type,
      description: r.description,
      amount: r.amount,
      status: r.status,
      currency: "NGN",
      userId: "ship-user-1",
      createdAt: r.createdAt,
    }));
    return paginated(items);
  }

  if (field === "getBusinessAccount") {
    const biz = sqlite.prepare("SELECT * FROM logistics_web_business_accounts LIMIT 1").get() as Record<string, unknown> | undefined;
    if (biz) {
      return {
        _id: biz._id,
        id: biz._id,
        businessId: biz._id,
        businessName: biz.businessName,
        businessEmail: biz.businessEmail,
        businessPhone: biz.businessPhone,
        businessAddress: biz.businessAddress,
        registrationNumber: biz.registrationNumber,
        businessType: biz.businessType,
        ownerId: biz.ownerId,
        isVerified: Boolean(biz.isVerified),
        createdAt: biz.createdAt,
      };
    }
    return { _id: "ship-business-1", businessName: "Demo Shipping Ltd" };
  }

  if (field === "resetPassword") {
    return { success: true, message: "Password reset successfully" };
  }

  if (field === "changePassword") {
    return { success: true, message: "Password changed successfully" };
  }

  if (field === "requestPickup") {
    return { pickup: { _id: "pickup-1", status: "scheduled", scheduledDate: new Date(Date.now() + 86400000).toISOString(), address: (variables.address as string) || "12 Ikeja Way, Lagos" }, success: true };
  }

  if (field === "getPickupRequests") {
    return paginated([{ _id: "pickup-1", status: "scheduled", scheduledDate: new Date(Date.now() + 86400000).toISOString(), address: "12 Ikeja Way, Lagos", createdAt: new Date().toISOString() }]);
  }

  if (field === "uploadDocument") {
    return { document: { _id: "doc-1", url: "https://example.com/demo-document.pdf", filename: (variables.filename as string) || "document.pdf", type: (variables.type as string) || "id_card" }, success: true };
  }

  if (field === "getDocuments") {
    return paginated([{ _id: "doc-1", url: "https://example.com/demo-document.pdf", filename: "id_card.pdf", type: "id_card", uploadedAt: daysAgo(5) }]);
  }

  return {};
};

export const GraphqlController = () => {
  const Handle = async (
    req: Request & { body: GraphqlRequestBody },
    res: Response,
  ) => {
    const query = (req.body.query as string) || "";
    const operationName = (req.body.operationName as string) || "anonymous";
    const variables = (req.body.variables as Record<string, unknown>) || {};
    const rootFields = extractRootFields(query);

    recordLogisticsWebOperation(operationName, rootFields, variables);

    const data = rootFields.reduce<Record<string, unknown>>((acc, field) => {
      acc[field] = resolveField(field, variables);
      return acc;
    }, {});

    return res.json({ data });
  };

  return { Handle };
};
