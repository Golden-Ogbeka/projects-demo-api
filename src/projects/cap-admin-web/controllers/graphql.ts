import { Request, Response } from "express";
import { recordCapAdminWebOperation } from "../database/index.js";
import { GraphqlRequestBody } from "../types/index.js";
import {
    brands,
    catalogProducts,
    categories,
    createDemoJwt,
    customers,
    demoBackOrderItem,
    demoBanner,
    demoBundle,
    demoCoupon,
    demoDeliveryFee,
    demoDeliveryPlan,
    demoDistributor,
    demoIncident,
    demoInStoreTransaction,
    demoInventoryItem,
    demoInventoryMetrics,
    demoOrderPerformance,
    demoPermissions,
    demoProcessingFee,
    demoProcurement,
    demoPromotion,
    demoPurchaseOrder,
    demoPurchaseRequisition,
    demoRoute,
    demoSalesBySegment,
    demoSalesTrend,
    demoStockByCategory,
    demoStockForecastNodes,
    demoTerminal,
    demoTodo,
    demoTopProductsByCancellation,
    demoTopSellingProducts,
    demoTotalSales,
    demoTransfer,
    demoUom,
    demoUser,
    demoUsers,
    demoVehicleRequest,
    demoVisitation,
    genericLog,
    landmarks,
    lgas,
    manufacturers,
    okResponse,
    orders,
    paginated,
    products,
    sellers,
    states,
    subCategories,
    variantProducts,
    vehicles,
    vendors,
    verticals,
    warehouses,
    zeeblyAdminUser,
    zeeblyAdminUsers,
    zeeblyAuditLog,
    zeeblyCenters,
    zeeblyDashboardRecentTransactions,
    zeeblyDashboardStat,
    zeeblyInventoryCategories,
    zeeblyInventoryItems,
    zeeblyNotifications,
    zeeblyOkMutation,
    zeeblyOrders,
    zeeblyPaginated,
    zeeblyPartners,
    zeeblyPermissions,
    zeeblyRepRoles,
    zeeblyReps,
    zeeblyRoles,
} from "./fixtures.js";

const mutationPrefixes = [
  "add", "approve", "audit", "blackList", "cancel", "commit", "create",
  "decline", "delete", "disable", "dispatch", "modify", "notify", "payment",
  "pickup", "prepare", "resync", "retry", "return", "submit", "sync", "undo",
  "update", "upload", "verify", "whiteList", "reAssign", "unMap", "remove",
  "attach", "detach", "end", "start", "complete", "generate", "reset",
  "toggle", "assign", "unassign", "rt", "bulk", "validate", "unValidate", "accept",
];

const scalarFields = new Set([
  "getCountryUrl", "generateOTP", "isWarehousePrefixExist",
  "downloadProductPricing", "exportOrders", "generateInvoices",
  "generateTransferInvoice", "generatePoInvoice", "getSMSMessage",
  "requireWarehouseForRoles", "syncSap", "syncNewTerminals",
  "resyncFailedCustomerSap", "resyncFailedVariantSap",
]);

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

const okMutation = (field: string, variables: Record<string, unknown>) => {
  const base = {
    _id: `${field}-1`,
    id: `${field}-1`,
    success: true,
    status: "success",
    message: "Demo operation completed successfully",
    error: null,
    ...variables,
  };

  if (field === "createBundle") {
    return { ...base, bundle: demoBundle._id };
  }
  if (field === "createIncident") {
    return { ...base, _id: "incident-1" };
  }

  return base;
};

const isListField = (field: string) => (
  field.startsWith("get")
  || field.startsWith("fetch")
  || field.startsWith("search")
  || field.endsWith("List")
  || ["orders", "orderNotes", "customerNotes"].includes(field)
);

const resolveField = (field: string, variables: Record<string, unknown>): unknown => {
  if (scalarFields.has(field)) {
    if (field === "getCountryUrl") return "http://localhost:5050/cap-admin-web";
    if (field === "generateOTP") return { status: "success", msg: "OTP sent" };
    if (field === "isWarehousePrefixExist") return false;
    if (field === "getSMSMessage") return "Demo SMS notification message.";
    if (field === "requireWarehouseForRoles") return false;
    if (field === "syncSap") return true;
    if (field === "syncNewTerminals") return { success: true };
    if (field === "resyncFailedCustomerSap") return true;
    if (field === "resyncFailedVariantSap") return true;
    return "https://example.com/demo-download.csv";
  }
  if (field === "authenticateUser") {
    return { jwt: "demo-firebase-custom-token", userId: demoUser.userId, token: createDemoJwt() };
  }
  if (field === "getOrderPerformance") return demoOrderPerformance;
  if (field === "getSalesBySegment") return demoSalesBySegment;
  if (field === "getInventoryMetrics") return demoInventoryMetrics;
  if (field === "getStockByCategory") return demoStockByCategory;
  if (field === "getTotalSales") return demoTotalSales;
  if (field === "getTopSellingProducts") return demoTopSellingProducts;
  if (field === "getTopProductsByCancellation") return demoTopProductsByCancellation;
  if (field === "getSalesTrend") return demoSalesTrend;
  if (field === "retrieveForcastByWarehouseId") return paginated(demoStockForecastNodes);
  if (field === "getWarehouseDeliveryPlans") return paginated([demoDeliveryPlan]);
  if (field === "lastVehicleOperationDate") return "2026-05-20T09:00:00.000Z";
  if (field === "getUser") return demoUser;
  if (field === "getUsers") return paginated(demoUsers);
  if (field === "getRoles" || field === "getRolesForUser") return paginated(demoUser.Roles);
  if (field === "getPermissions") {
    return paginated(demoPermissions.map((permission, index) => ({
      _id: `permission-${index + 1}`, id: `permission-${index + 1}`,
      permissionId: `permission-${index + 1}`, permissionName: permission, Roles: [],
    })));
  }
  if (field === "getUserLogs" || field === "getWarehouseLog") return paginated([genericLog]);
  if (field === "userLocationHistory") return paginated([{ userId: "user-1", latitude: 7.3775, longitude: 3.947, timestamp: "2026-05-21T10:00:00.000Z" }]);
  if (field === "getLogConstraints") return { numOfMonths: 3, maximumVisits: 5, customerSegments: ["Active Customer"] };
  if (field === "getWarehouses" || field === "getWarehouseByCity" || field === "getwarehouseByState") return warehouses;
  if (field === "getWarehouse") return warehouses[0];
  if (field === "getWarehouseLogs") return paginated([genericLog]);
  if (field === "getInventoryByWarehouseId") return paginated([demoInventoryItem]);
  if (["getCommittedOrderByProductId", "getCommitttedOrderBySellerId", "getCommittedStockHistory"].includes(field)) {
    return paginated([{ _id: "co-1", orderId: "order-1", status: "committed", quantity: 10, createdAt: "2026-05-20T09:00:00.000Z", orderTotal: 32000 }]);
  }
  if (field === "getStateAndCities") return states;
  if (field === "getAllCities") return states.flatMap((s) => s.Cities);
  if (["getLandmarks", "getLandmarkByWarehouseId", "getLandmarksByWarehouseId"].includes(field)) return landmarks;
  if (field === "getLGAs") return lgas;
  if (field === "getCustomers") return paginated(customers);
  if (field === "getAllCustomers") return { success: true, taskCode: "task-1", message: "Export started" };
  if (field === "getCustomer") return customers[0];
  if (field === "getCustomerSurvey") {
    return { customerSurveyId: "survey-1", customerId: "customer-1",
      storeInformation: JSON.stringify({ sizeInM2: "24", yearStoreBeginOps: "2018" }),
      ownerInformation: JSON.stringify({ fullName: "Titi Ade", gender: "Female", maritalStatus: "Married" }),
      growthInformation: JSON.stringify({ yourBank: "Demo Bank", avgRevenue: "500000", topFiveMostPopularSKU: ["Noodles", "Oil", "Rice"] }) };
  }
  if (field === "getCustomerProductsWithRequestedProducts") return { customerProducts: products, requestedProducts: [] };
  if (field === "getStoreImages") return { images: ["https://images.unsplash.com/photo-1556745757-8d76bdb6984b"] };
  if (field === "ordersByCustomerId") return paginated(orders);
  if (field === "getCustomerRating") return paginated([{ custormerId: "customer-1", userId: "user-1", userDetails: demoUser, orderReferenceId: "ALZ-ORD-1001", orderId: "order-1", rating: 4.7, comments: "Great service", createdAt: "2026-05-20T09:00:00.000Z" }]);
  if (field === "checkCustomerPrequalification") return { eligible: true, amount: 250000 };
  if (field === "fetchCustomerAvailableRewardPoints") return { availablePoints: 120, totalRewardPoints: 500 };
  if (field === "fetchCustomerEarnedRewardPoint") return paginated([{ referenceId: "REW-001", category: "order", createdAt: "2026-05-20", reward: 50, status: "active", count: 1, maxCount: 10 }]);
  if (field === "fetchCustomerRedeemedReward") return paginated([{ referenceId: "RED-001", category: "redemption", createdAt: "2026-05-20", reward: 30, status: "redeemed", count: 1, maxCount: 5 }]);
  if (field === "getCreditLimit") return { availableCreditLimit: 185000, totalCreditLimit: 250000 };
  if (field === "getCustomerLogs") return paginated([genericLog]);
  if (field === "getFailedCustomerSync") return paginated(customers);
  if (field === "getCustomersWithCouponCount") return { customerCount: 42, lastCustomerCreatedDate: "2026-05-20T09:00:00.000Z" };
  if (field === "orders") return paginated(orders);
  if (field === "order") return orders[0];
  if (field === "getSubOrders") return paginated([{ ...orders[0], _id: "sub-order-1", subOrderId: "sub-order-1", mainOrderId: "order-1", mainOrderReferenceId: "ALZ-ORD-1001", subOrderItems: [] }]);
  if (field === "getSubOrder") return { ...orders[0], _id: "sub-order-1", subOrderId: "sub-order-1", mainOrderId: "order-1", mainOrderReferenceId: "ALZ-ORD-1001", subOrderItems: [] };
  if (field === "orderNotes") return [genericLog];
  if (field === "customerNotes") return [genericLog];
  if (field === "orderLogs") return paginated([genericLog]);
  if (field === "subOrdersInvoiceList") return paginated([{ _id: "order-1", mainOrderId: "order-1", referenceId: "ALZ-ORD-1001", orderInvoices: [] }]);
  if (field === "getTasks" || field === "getDownloables") return paginated([{ _id: "task-1", taskId: "task-1", taskName: "Customer CSV", taskType: "export", taskResult: { result: "https://example.com/demo-customers.csv" }, taskStatus: "completed", status: "completed", fileUrl: "https://example.com/demo-customers.csv", taskCode: "task-1", url: "https://example.com/demo-customers.csv", args: { business: "All", city: "Ibadan", state: "Oyo", startDate: "2026-05-01", endDate: "2026-05-21" }, createdAt: String(Date.now() - 3600000), updatedAt: String(Date.now() - 3600000) }]);
  if (field === "getReasons") return [{ _id: "reason-1", reason: "Customer unavailable", platform: "ADMIN_WEB", status: "active" }];
  if (field === "getHolidays") return [{ _id: "holiday-1", reason: "Demo Holiday", startDate: "2026-06-12", endDate: "2026-06-12" }];
  if (field === "getMinimumOrderAmounts") return [{ _id: "min-1", stateId: "state-1", cityId: "city-1", warehouseId: "warehouse-1", minimumAmount: 5000, city: "Ibadan", state: "Oyo", warehouse: "Ibadan Main Warehouse", platform: "ADMIN_WEB", vertical: "FMCG", verticalId: "vertical-1" }];
  if (field === "getOrderStatusMapping") return { mapping: JSON.stringify({ processing: "Processing", delivered: "Delivered" }) };
  if (field === "fetchVehicleForOrder" || field === "getVehicleInfoForOrder") return vehicles[0];
  if (field === "getFailedSapRequests") return paginated([{ _id: "sap-1", referenceId: "ALZ-ORD-1001", sapRequestLog: { id: "sap-1", referenceId: "ALZ-ORD-1001", orderId: "order-1", warehouseId: "warehouse-1", isSynced: false, createdAt: "2026-05-20T09:00:00.000Z", errorMessage: "Demo SAP error" } }]);
  if (field === "getSapRequestLogs") return paginated([{ id: "sap-1", referenceId: "ALZ-ORD-1001", updatedAt: "2026-05-20T09:00:00.000Z", createdAt: "2026-05-20T09:00:00.000Z", errorMessage: "Demo SAP error" }]);
  if (field === "getBackOrderItems") return paginated([demoBackOrderItem]);
  if (field === "getTotalValidatedPayments") return { totalValidatedPayments: 1250000, totalSales: 3500000 };
  if (field === "getAllProductsNew") return paginated(catalogProducts);
  if (["getAllProducts", "getProducts", "getProductVariants", "getVariantApprovals", "getSellerProducts", "getSellerProductOffer", "getAllVariants", "getVariantDrafts", "getProductDrafts"].includes(field)) {
    return paginated(variantProducts);
  }
  if (["getProduct", "product", "variant", "getAdminProductDetail", "getVariantDraftById"].includes(field)) {
    return variantProducts[0];
  }
  if (field === "getProductNew") return { _id: "product-1", productName: "Golden Penny Noodles", subCategory: "Noodles", category: "Food", brand: "Golden Penny", manufacturer: "Flour Mills Nigeria", manufacturerId: "mfr-1", categoryId: "cat-1", brandId: "brand-1", subCategoryId: "subcat-1", variants: products };
  if (field === "getProductDraftById" || field === "getProductDrafByProductId") return { _id: "product-1", productName: "Golden Penny Noodles", subCategory: "Noodles", category: "Food", brand: "Golden Penny", manufacturer: "Flour Mills Nigeria", manufacturerId: "mfr-1", categoryId: "cat-1", brandId: "brand-1", subCategoryId: "subcat-1", variants: products };
  if (field === "getVariantLogs" || field === "getProductLogs") return paginated([genericLog]);
  if (field === "getProductFilterData" || field === "getProductFiltersApp") return { categories: categories.map((c) => ({ key: (c as Record<string, unknown>)["categoryName"] as string, doc_count: 10 })), subCategories: subCategories.map((s) => ({ key: (s as Record<string, unknown>)["subCategoryName"] as string, doc_count: 5 })), brands: brands.map((b) => ({ key: (b as Record<string, unknown>)["brandName"] as string, doc_count: 8 })), tags: [], products: products.map((p) => ({ key: (p as Record<string, unknown>)["productName"] as string })) };
  if (field === "getFailedVariantSync") return paginated([{ materialID: "MAT-001", materialDescription: "Demo Material", isSynced: false, createdAt: "2026-05-20T09:00:00.000Z", updatedAt: "2026-05-20T09:00:00.000Z", errorMessage: "Demo sync error" }]);
  if (field === "getVariantPricingLog") return paginated([genericLog]);
  if (field === "verifyOTP") return { jwt: "demo-firebase-custom-token", email: "demo-uid" };
  if (field === "authenticateAdminUser") {
    return {
      data: [{
        _id: "demo-id",
        fullName: "Demo Admin",
        staffId: "STAFF-001",
        phoneNumber: "08012345678",
        email: "admin@zeebly.com",
        roleId: "role-1",
        roleName: "Super Admin",
        isFirstTimeLogin: false,
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }],
      status: true,
      statusCode: 200,
      message: "Success",
    };
  }
  if (field === "getUoms") return [demoUom];
  if (field === "getSimilarProducts") return paginated(products);
  if (field === "getProductPurchasePrice") return { purchasePrice: 2800 };
  if (["getAllCategories", "getCategoryById"].includes(field)) return paginated(categories);
  if (field === "getCategoryLog") return paginated([genericLog]);
  if (["getAllBrands"].includes(field)) return paginated(brands);
  if (["getAllManufacturers"].includes(field)) return paginated(manufacturers);
  if (["getAllSubcategories", "getSubcategoryByCategoryId", "getAllSubCategories"].includes(field)) {
    return paginated(subCategories);
  }
  if (["getSubCategoryAttributes", "fetchSubCategoryAttributes"].includes(field)) {
    return paginated([{ _id: "attr-1", attributeName: "Weight", attributeValue: "70g" }]);
  }
  if (["getVerticals", "getVerticalsAdmin", "fetchVerticals"].includes(field)) return paginated(verticals);
  if (field === "fetchBundles") return paginated([demoBundle]);
  if (field === "fetchBundleDetail") return demoBundle;
  if (field === "getBundleLog") return paginated([genericLog]);
  if (field === "fetchProductPromotionList") return paginated([demoPromotion]);
  if (field === "fetchProductPromotion") return demoPromotion;
  if (field === "getPromotionLog") return paginated([genericLog]);
  if (field === "getCouponStats") return { ordersPlacedCount: 42, lastOrderPlacedDate: "2026-05-20T09:00:00.000Z", ordersFulfilledCount: 38, lastOrderFulfilledDate: "2026-05-20T09:00:00.000Z" };
  if (field === "getCoupons" || field === "getCouponCode" || field === "getCouponCodes") {
    return paginated([demoCoupon]);
  }
  if (field === "getCouponLogs") return paginated([genericLog]);
  if (field === "fetchAllBanners" || field === "fetchBannerById") return paginated([demoBanner]);
  if (field === "vehicleList") return { data: vehicles, nodes: vehicles, total: vehicles.length, count: vehicles.length };
  if (field === "fetchVehicleTypes" || field === "getVehicleTypes") return [{ _id: "vehicle-type-1", name: "Van", capacity: 1000, personnelRequired: ["Driver"], fuelVolumeCap: 60 }];
  if (field === "vehicleDetail") return vehicles[0];
  if (field === "vehicleHistory") return paginated([genericLog]);
  if (field === "vehicleMetricsList") return paginated([{ vehicleId: "vehicle-1", metric: "fuel", value: 45 }]);
  if (field === "vehicleMetricDetails") return { vehicleId: "vehicle-1", metric: "fuel", value: 45 };
  if (field === "getVehicleRequests") return paginated([demoVehicleRequest]);
  if (field === "vehicleRequestDetail" || field === "getLastVehicleRequestDate") return demoVehicleRequest;
  if (field === "vehicleRequestLogs") return paginated([genericLog]);
  if (["getVehicleDocuments", "getVehicleDocTypes", "getVehicleAccs", "getVehicleAccTypes"].includes(field)) return paginated([{ _id: "doc-1", name: "Demo Document", type: "insurance", status: "valid", expiryDate: "2027-01-01" }]);
  if (field === "vehicleActivity") return paginated([genericLog]);
  if (field === "fetchVehicleUsers") return paginated([demoUser]);
  if (field === "checkIfLinked") return { error: null };
  if (field === "getFuelRates") return { diesel: 750, pms: 680 };
  if (["searchRoutesList", "fetchRoutesList", "warehouseRoutesList", "fetchRouteList"].includes(field)) return paginated([demoRoute]);
  if (field === "routeDetail" || field === "getRouteDetail") return demoRoute;
  if (field === "routeActivityList" || field === "routeActivity") return paginated([genericLog]);
  if (field === "routeOrders" || field === "warehouseOrders") return { unlinkedOrderIds: [], unlinkedOrders: orders, error: null };
  if (field === "vehicleTracker" || field === "vehicleTrackerMulti") return [{ ...demoRoute, coordinates: [{ lat: 7.3775, lng: 3.947 }] }];
  if (field === "getDeliveryPlans") return paginated([demoDeliveryPlan]);
  if (field === "fetchScheduledJobs") return paginated([{ _id: "job-1", name: "Demo Job", status: "scheduled", scheduledAt: "2026-05-22T08:00:00.000Z" }]);
  if (field === "getUnscheduledVisits") return paginated([demoVisitation]);
  if (field === "getSellers") return paginated(sellers);
  if (field === "getSellerDetail") return { ...sellers[0], sellerName: "Demo FMCG Seller", sellerAddress: "Demo Address", sellerType: "primary", warehouses: ["warehouse-1"], warehouseList: [warehouses[0]], contactName: "Demo Contact", paymentType: "credit", creditTerm: 30, contactPhone: "+2348090003333", contactEmail: "seller@example.com", logo: null, registrationPrefix: "DFS", registrationNumber: "RC-001", city: "Ibadan", cityId: "city-1", state: "Oyo", stateId: "state-1", categoryIds: ["cat-1"], categories: ["Food"], categoryList: categories, requestedCategoryIds: [], requestedCategories: [], pickupLocations: [], verticalId: "vertical-1", verticalName: "FMCG", status: "ACTIVE", createdAt: "2026-01-01T00:00:00.000Z" };
  if (field === "getSellerLogs") return [genericLog];
  if (field === "getSellerProductRequests" || field === "getSellerProductRequest") return paginated([{ _id: "spr-1", productName: "Demo Product Request", status: "pending", createdAt: "2026-05-20T09:00:00.000Z" }]);
  if (field === "getAllVendors") return paginated(vendors);
  if (field === "getVendorById") return { ...vendors[0], referenceId: "VND-001", image: null, vendorType: "primary", phoneNumber: "+2348090004444", state: "Oyo", city: "Ibadan", stateId: "state-1", cityId: "city-1", zone: "South West", address: "Demo Vendor Address", isActive: true, category: "Food", subCategory: "Noodles", totalAmountPaid: 5000000, creditBalance: 2000000, dateOfLastPurchase: "2026-05-15T00:00:00.000Z", inventoryLeadTime: 3, createdBy: "user-1", createdAt: "2026-01-01T00:00:00.000Z" };
  if (field === "getVendorCreditByVendorId") return paginated([{ _id: "vc-1", vendorId: "vendor-1", referenceId: "VC-001", description: "Demo credit", amount: 500000, creditType: "purchase", createdAt: "2026-05-20T09:00:00.000Z", createdBy: "user-1" }]);
  if (field === "getVendorProduct") {
    return paginated([{
      purchaseOrderId: "po-1",
      vendorId: "vendor-1",
      product_variantId: "product-1",
      product: {
        ...variantProducts[0],
        images: {
          imageUrl: (variantProducts[0] as { images?: { imageUrl?: string }; imageUrl?: string }).images?.imageUrl
            || (variantProducts[0] as { imageUrl?: string }).imageUrl,
        },
      },
      product_unitCost: 2800,
      product_quantity: 100,
      avg_unitcost: 2850,
    }]);
  }
  if (field === "getPurchaseOrders" || field === "getVendorPurchaseOrders") return paginated([demoPurchaseOrder]);
  if (field === "getPurchaseOrder") return demoPurchaseOrder;
  if (field === "purchaseOrderLogs") return paginated([genericLog]);
  if (field === "getPaymentProviders") return { providers: ["PAYSTACK", "FLUTTERWAVE", "CASH"], paymentMethods: ["CARD", "BANK_TRANSFER", "CASH"] };
  if (field === "getDeliveryFees") return paginated([demoDeliveryFee]);
  if (field === "deliveryFeeDetail") return demoDeliveryFee;
  if (field === "getDeliveryFeeLogs") return paginated([genericLog]);
  if (field === "getProcessingFees") return paginated([demoProcessingFee]);
  if (field === "processingFeeDetail") return demoProcessingFee;
  if (field === "getDistributor") return demoDistributor;
  if (field === "getDistributorLogs") return paginated([genericLog]);
  if (field === "getProcurementByWarehouseId") return paginated([demoProcurement]);
  if (field === "getProcurementByProcurementId") return demoProcurement;
  if (["getTransfers", "getIncomingTransfers", "getOutgoingTransfers"].includes(field)) return paginated([demoTransfer]);
  if (field === "getTransferDetails") return demoTransfer;
  if (field === "getTransferActivityByTransferId") return paginated([genericLog]);
  if (field === "getIncidentByWarehouseId" || field === "getAllIncident") return paginated([demoIncident]);
  if (field === "getIncidentByIncidentId") return demoIncident;
  if (field === "getPurchaseRequisitions") return paginated([demoPurchaseRequisition]);
  if (field === "getPurchaseRequisition") return demoPurchaseRequisition;
  if (field === "purchaseRequisitionLogs") return paginated([genericLog]);
  if (field === "getInStoreTransactions") return paginated([demoInStoreTransaction]);
  if (field === "getInStoreTransaction") return demoInStoreTransaction;
  if (field === "getInStoreTransactionLogs") return paginated([genericLog]);
  if (field === "getSubOrdersForPurchaseOrder") return paginated([{ ...orders[0], _id: "sub-order-1" }]);
  if (field === "getWHArrivedPR") return paginated([demoPurchaseRequisition]);
  if (field === "getAllToDo") return paginated([demoTodo]);
  if (field === "getTerminals") return paginated([demoTerminal]);
  if (field === "terminalDetail") return demoTerminal;
  if (field === "getTerminalLogs") return paginated([genericLog]);
  if (field === "terminalTransactions") return paginated([{ referenceId: "TXN-001", paidAmount: 5000, transactionId: "TXN-001", transactionDetail: "{}", externalUserRef: "user-1", paymentType: "CARD", mposTerminalId: "POS-001" }]);
  if (field === "pricingSurveyVisitations") return paginated([{ ...demoVisitation, nearestWarehouseId: "warehouse-1", nearestWarehouse: warehouses[0], distributorsPrice: 3000, distributorStoreType: "wholesale", userSurveyedType: "retailer", location: "Demo Location", marketName: "Demo Market", distributorName: "Demo Distributor", productId: "product-1", product: products[0] }]);
  if (field === "pricingSurveyVisitationDetail") return { ...demoVisitation, nearestWarehouseId: "warehouse-1", nearestWarehouse: warehouses[0], distributorsPrice: 3000, distributorStoreType: "wholesale", userSurveyedType: "retailer", location: "Demo Location", cityName: "Ibadan", scarcityLevel: "low", wholesalePrice: 3000, retailPrice: 3500, marketName: "Demo Market", distributorName: "Demo Distributor", productId: "product-1", product: products[0] };
  if (field === "publicRelationVisitations") return paginated([{ ...demoVisitation, campaignName: "Demo Campaign", testimonial: "Great product!", giftType: "sample", customerRemarks: "Satisfied" }]);
  if (field === "publicRelationVisitationDetail") return { ...demoVisitation, campaignName: "Demo Campaign", testimonial: "Great product!", giftType: "sample", customerRemarks: "Satisfied" };
  if (field === "bdeVisitations") return paginated([{ ...demoVisitation, currentLocation: JSON.stringify({ lat: 7.3775, lng: 3.947 }), typeOfVisit: "routine", complaint: "None", feedback: "Good", status: "pending" }]);
  if (field === "bdeVisitationDetail") return { ...demoVisitation, currentLocation: JSON.stringify({ lat: 7.3775, lng: 3.947 }), typeOfVisit: "routine", complaint: "None", feedback: "Good", status: "pending", distance: 2.5, storeImages: [] };
  if (field === "getCountryConfig") {
    return { countryName: "Nigeria", countryCode: "NG", countryPhoneCode: "+234", baseUrl: "http://localhost:5050/cap-admin-web", currencySymbol: "\u20A6", currency: "NGN", flagUrl: "https://flagcdn.com/ng.svg", phoneValidation: "^(0|\\+234)[789][01]\\d{8}$", samplePhone: "08012345678", orderConfig: "{}", storeTypes: ["retail", "wholesale"], segments: ["Active Customer", "Inactive Customer", "Dormant Customer", "Churned Customer"] };
  }

  // ─── Zeebly Admin (cap-admin-web) operations ─────────────────────────

  // Auth
  if (field === "changeAdminPassword") return okResponse({ _id: zeeblyAdminUser._id, phoneNumber: zeeblyAdminUser.phoneNumber, email: zeeblyAdminUser.email, roleId: zeeblyAdminUser.roleId, isFirstTimeLogin: false });
  if (field === "requestAdminPasswordReset") return okResponse({ _id: zeeblyAdminUser._id, phoneNumber: zeeblyAdminUser.phoneNumber, email: zeeblyAdminUser.email, roleId: zeeblyAdminUser.roleId, isFirstTimeLogin: false });
  if (field === "validateAdminPasswordResetRequest") return okResponse({ 0: "demo-reset-token" });
  if (field === "resetAdminPassword") return okResponse({ _id: zeeblyAdminUser._id, phoneNumber: zeeblyAdminUser.phoneNumber, email: zeeblyAdminUser.email, roleId: zeeblyAdminUser.roleId, isFirstTimeLogin: false });
  if (field === "refreshUserToken") return { newAccessToken: "demo-refreshed-access-token" };

  // Dashboard
  if (field === "recent_transaction") return okResponse(zeeblyDashboardRecentTransactions);
  if (field === "top_centres") return okResponse(zeeblyCenters.slice(0, 5).map((c) => ({ _id: { centre_id: c.centre_id, centre_name: c.centre_name }, total: 1250000, order_count: 45, count: 45 })));
  if (field === "top_selling_products") return okResponse(zeeblyInventoryItems.slice(0, 5).map((p) => ({ _id: { product_name: p.name, product_id: p.id }, total: p.amount_sold * p.amount, quantity_sold: p.amount_sold })));
  if (field === "top_selling_categories") return okResponse(zeeblyInventoryCategories.slice(0, 5).map((c) => ({ _id: { brand: c.name }, total: c.count * 150000, count: c.count * 12 })));
  if (field === "transaction_volume") return okResponse([
    { label: "Jan", data: [{ _id: "month-1", total: 450000, count: 28 }] },
    { label: "Feb", data: [{ _id: "month-2", total: 520000, count: 32 }] },
    { label: "Mar", data: [{ _id: "month-3", total: 610000, count: 38 }] },
    { label: "Apr", data: [{ _id: "month-4", total: 485000, count: 30 }] },
    { label: "May", data: [{ _id: "month-5", total: 720000, count: 45 }] },
    { label: "Jun", data: [{ _id: "month-6", total: 680000, count: 42 }] },
    { label: "Jul", data: [{ _id: "month-7", total: 750000, count: 47 }] },
    { label: "Aug", data: [{ _id: "month-8", total: 820000, count: 51 }] },
    { label: "Sep", data: [{ _id: "month-9", total: 690000, count: 43 }] },
    { label: "Oct", data: [{ _id: "month-10", total: 780000, count: 49 }] },
    { label: "Nov", data: [{ _id: "month-11", total: 850000, count: 53 }] },
    { label: "Dec", data: [{ _id: "month-12", total: 920000, count: 58 }] },
  ]);
  if (field === "transaction_status") return okResponse([
    { label: "Pending", data: [{ _id: "pending", total: 180000, count: 12 }] },
    { label: "Processing", data: [{ _id: "processing", total: 340000, count: 8 }] },
    { label: "Completed", data: [{ _id: "completed", total: 4200000, count: 248 }] },
    { label: "Cancelled", data: [{ _id: "cancelled", total: 96000, count: 16 }] },
  ]);
  if (field === "transaction_volume_per_centre") return okResponse(zeeblyCenters.map((c) => ({ centre_name: c.centre_name, total_transactions: 85, total_amount: 2800000, percentage_change: 10.2 })));
  if (field === "revenue_trend") return okResponse([
    { label: "Mon", data: [{ _id: "day-1", total: 850000, totalDiscount: 25000, count: 28 }] },
    { label: "Tue", data: [{ _id: "day-2", total: 895000, totalDiscount: 28000, count: 31 }] },
    { label: "Wed", data: [{ _id: "day-3", total: 940000, totalDiscount: 31000, count: 34 }] },
    { label: "Thu", data: [{ _id: "day-4", total: 985000, totalDiscount: 34000, count: 37 }] },
    { label: "Fri", data: [{ _id: "day-5", total: 1030000, totalDiscount: 37000, count: 40 }] },
    { label: "Sat", data: [{ _id: "day-6", total: 1075000, totalDiscount: 40000, count: 43 }] },
    { label: "Sun", data: [{ _id: "day-7", total: 1120000, totalDiscount: 43000, count: 46 }] },
  ]);
  if (field === "getTotalRepsPartner") return okResponse(zeeblyReps.length + zeeblyPartners.length);
  if (field === "transaction_status_per_center") return okResponse(zeeblyCenters.map((c) => ({ centre_name: c.centre_name, pending: 4, processing: 3, completed: 78, cancelled: 5 })));
  if (field === "getDiscountStat") return okResponse(zeeblyDashboardStat);
  if (field === "getReturnedOrderStat") return okResponse(zeeblyDashboardStat);
  if (field === "getOrderSaleTargetForAllCenters") return okResponse([
    { totalAmount: 4500000, orderCount: 120, target: 6000000, percentage: 75, previousPercentage: 68, previousAmount: 3800000, previousOrderCount: 95, previousTarget: 5500000, centreName: "All Centres" },
    { totalAmount: 2800000, orderCount: 85, target: 4000000, percentage: 70, previousPercentage: 65, previousAmount: 2400000, previousOrderCount: 72, previousTarget: 3500000, centreName: "Ibadan Main Centre" },
    { totalAmount: 1700000, orderCount: 35, target: 2000000, percentage: 85, previousPercentage: 80, previousAmount: 1400000, previousOrderCount: 23, previousTarget: 1500000, centreName: "Lagos Island Centre" },
  ]);

  // Inventory
  if (field === "getInventory") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const paginated = zeeblyPaginated(zeeblyInventoryItems, page, limit);
    return { ...paginated, data: { ...paginated.data, inventory: zeeblyInventoryItems } };
  }
  if (field === "getInventoryById") return okResponse(zeeblyInventoryItems[0]);
  if (field === "getAdminCatalogueEntity") return okResponse([{ id: "entity-1", entityType: "category", name: "Beverages" }]);
  if (field === "getSapCatelogueDetails") return okResponse({ sap_id: "SAP-BEV-001", product_name: "Demo Beverage Pack", product_price: 8500, price_unit: "NGN", quantity_unit: "Pack", product_per_item: 354, product_validity_from: "2026-01-01", product_validity_to: "2026-12-31" });
  if (field === "getCatelogueDetails") return okResponse({ brand: "Demo Brand", category: "Beverages", class_type: "Fast Moving", color: "Blue", product_line: "Beverages", rebate: { rebate_group: "Standard", description: "Standard rebate group" } });

  // Orders
  if (field === "getAllOrders") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const paginated = zeeblyPaginated(zeeblyOrders, page, limit);
    return { ...paginated, data: { ...paginated.data, orders: zeeblyOrders } };
  }
  if (field === "getOrderById") return okResponse(zeeblyOrders[0]);
  if (field === "getOrderStat") return okResponse({ partially_delivered_orders: { total_count: 8, total_amount: 450000, percent_change_count: -2.5, percent_change_amount: 3.1 }, all_orders: { total_count: 120, total_amount: 8450000, percent_change_count: 15.3, percent_change_amount: 12.8 }, cancelled_orders: { total_count: 16, total_amount: 680000, percent_change_count: -5.2, percent_change_amount: -3.8 }, pending_orders: { total_count: 12, total_amount: 425000, percent_change_count: 8.1, percent_change_amount: 6.4 }, completed_orders: { total_count: 84, total_amount: 6895000, percent_change_count: 18.2, percent_change_amount: 14.9 } });
  if (field === "getOrderInvoice") return okResponse({ invoice_number: "INV-001", order_id: zeeblyOrders[0].orderId, total_amount: zeeblyOrders[0].total_amount, items: zeeblyOrders[0].items, invoice_date: new Date().toISOString() });

  // Centers
  if (field === "getCentres") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const paginated = zeeblyPaginated(zeeblyCenters, page, limit);
    return { ...paginated, data: { ...paginated.data, centers: zeeblyCenters } };
  }
  if (field === "centre") return okResponse(zeeblyCenters[0]);
  if (field === "getCentreActiveReps") return okResponse({ centre_name: zeeblyCenters[0].centre_name, total_active_reps: 2 });
  if (field === "getCentreRepLists") return okResponse(zeeblyReps.map((r) => ({ id: r.id, first_name: r.first_name, last_name: r.last_name, email: r.email, phone_number: r.phone_number, center: [{ centre_id: r.center[0].centre_id, centre_name: r.center[0].centre_name }], representative_id: r.representative_id, created_at: r.created_at, status: r.status })));
  if (field === "getBusinessName") return okResponse({ businessName: "Ibadan Main Ventures", groupName: "Main Group", groupCode: "GRP-001" });
  if (field === "getCentreCustomerGroup") return okResponse({ name: "Premium Customers", code: "PREM-001" });
  if (field === "getCentreTarget") return okResponse({ currentMonthValue: 1500000, currentQuarterValue: 4200000, totalValue: 6000000 });

  // Partners
  if (field === "getPartners") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const paginated = zeeblyPaginated(zeeblyPartners, page, limit);
    return { ...paginated, data: { ...paginated.data, partners: zeeblyPartners } };
  }
  if (field === "getPartner") return okResponse(zeeblyPartners[0]);

  // Reps
  if (field === "getRepresentatives") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const paginated = zeeblyPaginated(zeeblyReps, page, limit);
    return { ...paginated, data: { ...paginated.data, reps: zeeblyReps } };
  }
  if (field === "representative") return okResponse(zeeblyReps[0]);
  if (field === "getRepRoles") return okResponse(zeeblyRepRoles);

  // Settings / Admin Users
  if (field === "getAdminUser") return okResponse(zeeblyAdminUser);
  if (field === "getAdminUsers") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const paginated = zeeblyPaginated(zeeblyAdminUsers, page, limit);
    return { ...paginated, data: { ...paginated.data, users: zeeblyAdminUsers } };
  }
  if (field === "getRoles") return okResponse(zeeblyRoles);
  if (field === "getAllPermissions") return okResponse(zeeblyPermissions);

  // Notifications
  if (field === "getAdminNotification") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const paginated = zeeblyPaginated(zeeblyNotifications, page, limit);
    return { ...paginated, data: { ...paginated.data, notifications: zeeblyNotifications }, error: null };
  }

  // Audit Trail
  if (field === "getAdminAuditLogs") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const items = Array.from({ length: 8 }, (_, i) => zeeblyAuditLog("admin", i));
    const paginated = zeeblyPaginated(items, page, limit);
    return { ...paginated, data: { ...paginated.data, admin_audits: items } };
  }
  if (field === "getPartnerAuditLogs") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const items = Array.from({ length: 6 }, (_, i) => zeeblyAuditLog("partner", i));
    const paginated = zeeblyPaginated(items, page, limit);
    return { ...paginated, data: { ...paginated.data, partner_audits: items } };
  }
  if (field === "getRepAuditLogs") {
    const page = (variables.page as number) || 1;
    const limit = (variables.limit as number) || 10;
    const items = Array.from({ length: 6 }, (_, i) => zeeblyAuditLog("rep", i));
    const paginated = zeeblyPaginated(items, page, limit);
    return { ...paginated, data: { ...paginated.data, rep_audits: items } };
  }
  if (field === "getAdminAuditLog") return okResponse(zeeblyAuditLog("admin", 0));
  if (field === "getPartnerAuditLog") return okResponse(zeeblyAuditLog("partner", 0));
  if (field === "getRepAuditLog") return okResponse(zeeblyAuditLog("rep", 0));

  // Zeebly mutations - handle before generic mutation prefix
  if (["createCentre", "updateCentre", "removeCentre"].includes(field)) return zeeblyOkMutation("centre-1");
  if (["createPartner", "updatePartner", "deactivatePartner", "activatePartner"].includes(field)) return zeeblyOkMutation("partner-1");
  if (["createRepresentativeByAdmin", "adminUpdateRepresentative", "deactivateRepresentative", "activateRepresentative", "removeRepresentative"].includes(field)) return zeeblyOkMutation("rep-1");
  if (["createCatalogue", "updateCatalogue", "deleteCatalogue", "toggleOutOfStock", "toggleLocked"].includes(field)) return zeeblyOkMutation("zbl-inv-1");
  if (["deleteOrder", "toggleLockedOrder"].includes(field)) return zeeblyOkMutation("zeebly-order-1");
  if (["createAdminUser", "updateAdminUser", "activateAdminUser", "deactivateAdminUser"].includes(field)) return zeeblyOkMutation("zeebly-admin-1");
  if (["updateRole", "createRole", "createPermission"].includes(field)) return zeeblyOkMutation("zeebly-role-1");
  if (field === "readNotification") return okResponse({ notification_id: "notif-1" });

  if (mutationPrefixes.some((prefix) => field.startsWith(prefix))) {
    return okMutation(field, variables);
  }
  if (isListField(field)) {
    return paginated([]);
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

    recordCapAdminWebOperation(operationName, rootFields, variables);

    const data = rootFields.reduce<Record<string, unknown>>((acc, field) => {
      acc[field] = resolveField(field, variables);
      return acc;
    }, {});

    res.setHeader("x-token", "demo-access-token");
    res.setHeader("x-refresh-token", "demo-refresh-token");
    res.setHeader("Access-Control-Expose-Headers", "x-token, x-refresh-token");

    return res.json({ data });
  };

  return { Handle };
};
