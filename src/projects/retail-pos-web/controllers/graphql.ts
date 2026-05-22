import { Request, Response } from "express";
import { recordRetailPosWebOperation } from "../database/index.js";
import { GraphqlRequestBody } from "../types/index.js";
import {
    demoAccountDetail,
    demoAirtimeProviders,
    demoAlerzoProducts,
    demoAppConfig,
    demoBusiness,
    demoBusinessPlans,
    demoBusinessSectors,
    demoCableProviders,
    demoCategories,
    demoCustomers,
    demoDiscos,
    demoExpenses,
    demoImportedFiles,
    demoInvoices,
    demoNotifications,
    demoPaymentBanks,
    demoProducts,
    demoReferralSummary,
    demoRoles,
    demoSales,
    demoServices,
    demoStaff,
    demoStatesAndCities,
    demoTerminals,
    demoTransactions,
    demoUser,
    paginated
} from "./fixtures.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const extractRootFields = (query = ""): string[] => {
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

  for (let i = firstBrace + 1; i < query.length; i++) {
    const char = query[i];
    if (char === "(") { if (depth === 0) pushToken(); parenDepth++; continue; }
    if (char === ")") { parenDepth = Math.max(parenDepth - 1, 0); continue; }
    if (parenDepth > 0) continue;
    if (char === "{") { if (depth === 0) pushToken(); depth++; continue; }
    if (char === "}") { if (depth === 0) break; depth--; continue; }
    if (depth !== 0) continue;
    if (char === ":") { readingAlias = true; token = ""; continue; }
    if (/[A-Za-z0-9_]/.test(char)) { token += char; readingAlias = false; continue; }
    pushToken(); readingAlias = false;
  }
  return Array.from(fields);
};

// ─── Field resolver ───────────────────────────────────────────────────────────

const resolveField = (field: string, _variables: Record<string, unknown>): unknown => {
  // ── Auth / User ──
  if (field === "getUserDetail") return demoUser;
  if (field === "getBusinessDetail") return demoBusiness;

  // ── Dashboard ──
  if (field === "getSaleStat") {
    return {
      totalSale: 285600,
      totalExpense: 25500,
      totalProfit: 48000,
      totalCost: 237600,
      totalGain: 55000,
      totalLoss: 7000,
      totalItemSold: 42,
      profitMargin: "16.8%",
      saleCount: 12,
      BANK: "120000",
      CASH: "145600",
      POS: "20000",
    };
  }
  if (field === "getExpenseStat") return { totalExpense: 25500 };
  if (field === "getBusinessInvoices") return paginated(demoInvoices);
  if (field === "getBusinessCustomers") return paginated(demoCustomers);
  if (field === "getSaleBreakdown") {
    return [
      { identifier: "Jan", type: "MONTHLY", totalSales: 180000, totalSalesCount: 8 },
      { identifier: "Feb", type: "MONTHLY", totalSales: 220000, totalSalesCount: 10 },
      { identifier: "Mar", type: "MONTHLY", totalSales: 195000, totalSalesCount: 9 },
      { identifier: "Apr", type: "MONTHLY", totalSales: 260000, totalSalesCount: 12 },
      { identifier: "May", type: "MONTHLY", totalSales: 285600, totalSalesCount: 12 },
    ];
  }
  if (field === "getHighestSpendingBusinessCustomers") return demoCustomers;
  if (field === "getTopSellingProducts") {
    return {
      count: 3,
      soldItemData: demoProducts.map((p, i) => ({
        _id: `sold-${p._id}`,
        businessId: "business-demo-1",
        customerProduct: { productName: p.productName, category: {} },
        customerService: null,
        customerProductName: p.productName,
        customerServiceName: null,
        productImage: p.productImage,
        sellingPrice: String(p.sellingPrice),
        quantitySold: String(20 - i * 5),
        quantity: 20 - i * 5,
      })),
    };
  }
  if (field === "getGainLossAndNetProfit") {
    return {
      gain: 55000,
      loss: 7000,
      netProfit: 48000,
      dataLog: demoSales.map((s) => ({
        _id: s._id,
        saleId: s._id,
        quantity: s.totalItems,
        customerProductName: s.clientName,
        total: s.totalSale,
      })),
    };
  }

  // ── Inventory ──
  if (field === "getCustomerProducts") return paginated(demoProducts);
  if (field === "getCustomerServices") return paginated(demoServices);
  if (field === "getCustomerCategories") return paginated(demoCategories);
  if (field === "getProductDetail" || field === "getCustomerProductDetail") return demoProducts[0];
  if (field === "getServiceDetails" || field === "getCustomerServiceDetail") return demoServices[0];
  if (field === "getProductSummary") return { totalProducts: demoProducts.length, totalStockValue: 3008000, lowStockCount: 0 };
  if (field === "getServiceSummary") return { totalServices: demoServices.length };
  if (field === "productHasInvoiceOrSales") return false;
  if (field === "getImportedFilesAndStats") return paginated(demoImportedFiles);
  if (field === "getAlerzoProducts") return paginated(demoAlerzoProducts);

  // ── Customers ──
  if (field === "getCustomerDetails") return demoCustomers[0];
  if (field === "getCustomerSummary") return { totalSales: 125000, totalInvoices: 3, totalDebt: 0 };
  if (field === "customerHasSalesOrInvoice") return true;
  if (field === "getBusinessCustomersTotalDebt") return 23000;
  if (field === "getTotalBusinessCustomersCount") return demoCustomers.length;

  // ── Sales & Expenses ──
  if (field === "getBusinessSales") return paginated(demoSales);
  if (field === "getSalesDetail") return demoSales[0];
  if (field === "getSalesSummary") return { totalSale: 285600, totalItems: 42, saleCount: 12 };
  if (field === "getBusinessExpenses") return paginated(demoExpenses);
  if (field === "getExpensesBreakdown") {
    return [
      { category: "Rent", total: 12000 },
      { category: "Utilities", total: 5500 },
      { category: "Salaries", total: 8000 },
    ];
  }
  if (field === "getSalesReceiptPdf") return { url: "https://example.com/demo-receipt.pdf" };

  // ── Invoices ──
  if (field === "getBusinessInvoiceDetail") return demoInvoices[0];
  if (field === "getBusinessPayment") return { _id: "bizpay-1", amount: 45000, paymentType: "CASH", createdAt: "2026-05-15T00:00:00.000Z" };
  if (field === "getInvoicesStat") {
    return [
      { _id: "PAID", value: 45000, count: 5 },
      { _id: "UNPAID", value: 32000, count: 2 },
      { _id: "PART_PAYMENT", value: 10000, count: 1 },
      { _id: "OVERDUE", value: 0, count: 0 },
    ];
  }
  if (field === "getInvoiceBreakdown") return { paid: 45000, pending: 32000, partial: 10000 };
  if (field === "getInvoicePdf") return { url: "https://example.com/demo-invoice.pdf" };
  if (field === "getProducts") return paginated(demoProducts);
  if (field === "getBanks") return demoPaymentBanks;

  // ── Staff ──
  if (field === "getBusinessStaffs") return paginated(demoStaff);
  if (field === "getBusinessStaffDetail") return demoStaff[0];
  if (field === "getBusinessStaffSummary") return { totalStaff: demoStaff.length, activeStaff: demoStaff.length };

  // ── Business / Manage ──
  if (field === "getRoleAndUserAssociated") return demoRoles;
  if (field === "getBusinessPlans") return demoBusinessPlans;
  if (field === "getBusinessSectors") return paginated(demoBusinessSectors);
  if (field === "getStateAndCities") return demoStatesAndCities;
  if (field === "getKycDetails" || field === "getKycDetail") {
    return {
      kycLevel: 2,
      kyc: {
        level: 2,
        bvn: { value: "12345678901", status: "VERIFIED" },
        selfie: { value: "https://example.com/selfie.jpg", status: "VERIFIED" },
        cac: { value: "RC-DEMO-001", status: "VERIFIED" },
      }
    };
  }

  // ── Account / Wallet ──
  if (field === "getAccountDetail") return demoAccountDetail;
  if (field === "getAppConfig") return demoAppConfig;
  if (field === "getCustomerTransaction") return demoTransactions;
  if (field === "getPaymentBanks") return demoPaymentBanks;
  if (field === "getBusinessBeneficiaries") return paginated([{ _id: "ben-1", accountName: "Demo Beneficiary", accountNumber: "0987654321", bankCode: "001", bankName: "Demo Bank" }]);

  // ── VAS (Value Added Services) ──
  if (field === "getAirtimeProviders") return demoAirtimeProviders;
  if (field === "getNetworkPlans") return [{ id: "mtn-1gb", name: "1GB - 30 days", price: 1000, network: "MTN" }];
  if (field === "getDiscos") return demoDiscos;
  if (field === "getDiscoCustomerName") return { name: "Demo Customer", address: "Demo Address" };
  if (field === "getCableProviders") return demoCableProviders;
  if (field === "getCablePackages") return [{ id: "dstv-compact", name: "DStv Compact", price: 9000, provider: "dstv" }];
  if (field === "getProviderAccountName") return { name: "Demo Subscriber", smartCardNumber: "1234567890" };

  // ── Notifications ──
  if (field === "getUserNotification") return demoNotifications;

  // ── POS / Terminals ──
  if (field === "getCustomerTerminals") return paginated(demoTerminals);
  if (field === "getCustomerTerminal") return demoTerminals[0];
  if (field === "getTerminalSpecs") return [{ _id: "spec-1", name: "Moniepoint POS", price: "25000", model: "MP35P" }];
  if (field === "getTerminalTransactions") return paginated(demoTransactions.map((t) => ({ ...t, terminalId: "terminal-1" })));

  // ── Referrals ──
  if (field === "getReferralSumary") return demoReferralSummary;
  if (field === "getDownlinesListByPartnerId") return paginated(demoCustomers.map((c) => ({ ...c, fullName: c.customerName, cityTown: "Ibadan", lastLoginTimestamp: new Date() })));
  if (field === "getReferralDetail") return { owner: { phoneNumber: "08012345678", gender: "Male", email: "demo@retailpos.com", lga: "Ibadan North", address: "12 Demo Road", createdAt: "2026-01-01T00:00:00.000Z", state: "Oyo", city: "Ibadan" }, terminals: demoTerminals };
  if (field === "getReferralSales") return paginated(demoSales);

  // ── Reports ──
  if (field === "getSalesByProduct") {
    return demoProducts.map((p) => ({
      customerProductId: p._id,
      totalSale: p.sellingPrice * 10,
      totalItemSold: 10,
      customerProduct: { _id: p._id, referenceId: p.referenceId, productName: p.productName },
    }));
  }
  if (field === "getNewAndReturningBusinessCustomers") return { newCustomers: 3, returningCustomers: 8 };
  if (field === "getProfitAndLoss") {
    return [
      { identifier: "Jan", totalLoss: 5000, totalSaleProfit: 35000 },
      { identifier: "Feb", totalLoss: 3000, totalSaleProfit: 42000 },
      { identifier: "Mar", totalLoss: 7000, totalSaleProfit: 38000 },
    ];
  }
  if (field === "getInventoryReport") return paginated(demoProducts.map((p) => ({ ...p, totalSold: 10, revenue: p.sellingPrice * 10 })));
  if (field === "getInvoiceReport") return paginated(demoInvoices);
  if (field === "getReportExpenseBreakdown") return paginated(demoExpenses);
  if (field === "getExpensesByCategory") {
    return [
      { category: "Rent", totalAmount: 12000 },
      { category: "Utilities", totalAmount: 5500 },
      { category: "Salaries", totalAmount: 8000 },
    ];
  }
  if (field === "getStaffSummaryCards") {
    return {
      staffActivities: [
        { identifier: "invoice_recorded", count: 10, value: 50000 },
        { identifier: "sale_recorded", count: 15, value: 80000 },
        { identifier: "inventory_recorded", count: 5, value: 20000 }
      ],
      performers: []
    };
  }
  if (field === "getSalesByStaff") {
    return demoStaff.map(s => ({
      ...s,
      user: s,
      totalSales: 85000,
      salesCount: 5
    }));
  }

  // ── Mutations ──
  if (field === "addBusiness") return { _id: "business-demo-1", businessName: "Demo Retail Store", businessEmail: "demo@retailpos.com", CACNumber: "RC-DEMO-001" };
  if (field === "setTransactionPin" || field === "validateTransactionPin") return { success: true, data: true };
  if (field === "changePasscode") return { success: true, data: true };
  if (field === "validateBankInfo") return { success: true, data: JSON.stringify({ accountName: "Demo Account", accountNumber: "0123456789" }) };
  if (field === "initiateBankTransfer") return { success: true, data: JSON.stringify({ reference: "TXN-REF-DEMO", status: "PENDING" }) };
  if (field === "generateUssdCode") return { success: true, data: "*737*000*12345#" };
  if (field === "setBvnTransactionPin") return { success: true, data: true };
  if (field === "addBusinessBeneficiary") return { success: true, data: true };
  if (field === "updateUserNotification") return { success: true };
  if (field === "requestTerminal") return { success: true, data: JSON.stringify({ requestId: "req-1", status: "PENDING" }) };
  if (field === "updateCustomerTerminal") return { ...demoTerminals[0], status: "ACTIVE" };
  if (field === "updateBusiness") return demoBusiness;
  if (field === "upgradeBusinessPlan") return { success: true, data: true };
  if (field === "updateUserPayment") return { success: true };
  if (field === "submitIndemnityForm") return { success: true };
  if (field === "completeBusinessLevelOne" || field === "completeBusinessLevelTwo" || field === "completeBusinessLevelThree") return { success: true, data: true };
  if (field === "importAlerzoProducts") return { success: true, imported: 2 };
  if (field === "importFileProduct") return { success: true, imported: 10 };
  if (field === "sendUserVerificationMail") return { success: true };
  if (field === "verifyUserEmail") return { success: true };
  if (field === "verifyBusinessEmail") return { success: true };
  if (field === "purchaseCable") return { success: true, data: JSON.stringify({ reference: "CABLE-REF-001", status: "SUCCESSFUL" }) };
  if (field === "purchaseElectricity") return { success: true, data: JSON.stringify({ token: "1234-5678-9012-3456", units: "50.0" }) };
  if (field === "buyData") return { success: true, data: JSON.stringify({ reference: "DATA-REF-001", status: "SUCCESSFUL" }) };

  // ── Generic fallback for any unhandled mutation/query ──
  return { success: true, data: null, nodes: [], pageInfo: { currentPage: 1, size: 10, totalCount: 0, hasNextPage: false } };
};

// ─── Controller ───────────────────────────────────────────────────────────────

export const RetailPosWebGraphqlController = () => {
  const HandleGraphql = async (
    req: Request & { body: GraphqlRequestBody },
    res: Response,
  ) => {
    const query = (req.body.query as string) || "";
    const operationName = (req.body.operationName as string) || "anonymous";
    const variables = (req.body.variables as Record<string, unknown>) || {};
    const rootFields = extractRootFields(query);

    recordRetailPosWebOperation(operationName, rootFields, variables);

    const data = rootFields.reduce<Record<string, unknown>>((acc, field) => {
      acc[field] = resolveField(field, variables);
      return acc;
    }, {});

    return res.json({ data });
  };

  return { HandleGraphql };
};
