import { Request, Response } from "express";
import {
  dbGetAllUsers,
  dbGetUserById,
  dbFindUserByEmail,
  dbUpdateUser,
  dbDeleteUser,
  dbGetAllProperties,
  dbGetPropertyById,
  dbCreateProperty,
  dbUpdateProperty,
  dbDeleteProperty,
  dbGetAllDevelopments,
  dbGetDevelopmentById,
  dbCreateDevelopment,
  dbUpdateDevelopment,
  dbDeleteDevelopment,
  dbGetOngoingDevelopments,
  dbGetAllGrows,
  dbGetGrowById,
  dbCreateGrow,
  dbUpdateGrow,
  dbDeleteGrow,
  dbGetActiveGrows,
  dbGetAllInvestments,
  dbGetInvestmentById,
  dbCreateInvestment,
  dbGetAllTransactions,
  dbGetTransactionById,
  dbGetAllBlogPosts,
  dbGetBlogPostById,
  dbCreateBlogPost,
  dbUpdateBlogPost,
  dbDeleteBlogPost,
  dbGetAllContacts,
  dbDeleteContact,
  dbGetAllInvoices,
  dbGetInvoiceById,
  dbGetAllReviews,
  dbDeleteReview,
  dbGetSettings,
  dbUpdateSettings,
  dbGetDashboardStats,
} from "../database/index.js";

const respond = (res: Response, message: string, data?: unknown, statusCode = 200) => {
  return res.status(statusCode).json({ status: message, message, data });
};
const respondError = (res: Response, message: string, statusCode = 400) => {
  return res.status(statusCode).json({ status: "error", message });
};
const respondCatch = (res: Response, error: unknown) => {
  const msg = error instanceof Error ? error.message : "An error occurred";
  return res.status(500).json({ status: "error", message: msg });
};

const paginatedResponse = (resourceKey: string, items: any[], total: number, page: number, limit: number) => {
  const pageCount = Math.ceil(total / limit);
  return {
    [resourceKey]: {
      data: items,
      meta: {
        page,
        take: limit,
        itemCount: total,
        pageCount,
        hasPreviousPage: page > 1,
        hasNextPage: page < pageCount,
      },
    },
  };
};

const mapUser = (r: any) => {
  if (!r) return undefined;
  const nameParts = (r.name || "").split(" ");
  return {
    _id: r.id,
    first_name: nameParts[0] || r.name || "",
    last_name: nameParts.slice(1).join(" ") || "",
    email: r.email,
    phone_number: r.phone || "",
    created_at: r.createdAt,
  };
};

const mapDevelop = (r: any) => {
  if (!r) return undefined;
  const parts = (r.name || "").split(" ");
  return {
    _id: r.id,
    title: r.name,
    property_name: r.location || "",
    address: r.location || "",
    city: (r.location || "").split(",")[0]?.trim() || "",
    state: (r.location || "").split(",")[1]?.trim() || "",
    description: `Phase ${r.phase} development with ${r.units} units`,
    type: r.type === "mixed_use" ? "house" : "land",
    format: r.progress > 50 ? "prime" : "luxury",
    property_id: String(r.id),
    size: `${(r.budget || 0) / 10000000} hectares`,
    current_price: r.budget || 0,
    previous_price: r.budget ? r.budget * 1.2 : 0,
    discount: 0,
    neighborhood: [r.location || ""],
    estate_features: [r.phase || "", r.type || ""],
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600"],
    units: [],
  };
};

const mapGrow = (r: any) => {
  if (!r) return undefined;
  return {
    _id: r.id,
    title: r.name,
    property_name: r.type || "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    description: `${r.name} - ${r.type} with ${r.roi}% ROI over ${r.durationMonths} months`,
    mortgage_type: r.type === "flipping" ? "extra" : "beta",
    format: r.roi > 15 ? "prime" : "luxury",
    interest: r.roi || 0,
    equity: (r.targetAmount || 0) * 0.3,
    repayment_duration: `${r.durationMonths || 24} months`,
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600"],
    size: `₦${(r.targetAmount || 0).toLocaleString()}`,
    current_price: r.targetAmount || 0,
    previous_price: r.targetAmount ? r.targetAmount * 1.15 : 0,
    discount: 0,
    features: [`${r.investors || 0} investors`, `${r.roi || 0}% ROI`, `${r.durationMonths || 0} months`],
  };
};

const mapDevelopRequest = (r: any) => {
  if (!r) return undefined;
  const nameParts = (r.name || "").split(" ");
  return {
    _id: r.id,
    name: nameParts[0] || r.name,
    email: "buyer@example.com",
    phone_number: "+2348000000000",
    inspection: "yes",
    quantity: 1,
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    develop: {
      images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600"],
      title: r.name,
      property_name: r.location || "",
      address: r.location || "",
      state: (r.location || "").split(",")[1]?.trim() || "",
    },
  };
};

const mapGrowRequest = (r: any) => {
  if (!r) return undefined;
  const nameParts = (r.name || "").split(" ");
  return {
    _id: r.id,
    first_name: nameParts[0] || "",
    last_name: nameParts.slice(1).join(" ") || "",
    email: "investor@example.com",
    phone_number: "+2348000000000",
    occupation: "Business Owner",
    local_government: "Eti-Osa",
    state_of_residence: "Lagos",
    created_at: r.startDate || new Date().toISOString(),
    grow: {
      images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600"],
      title: r.name,
      property_name: r.type || "",
      address: "",
      state: "",
    },
  };
};

export const RealEstateAdminController = () => {
  const Login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body || {};
      if (email === "demo@example.com" && password === "password") {
        return respond(res, "Login successful", {
          jwt: { token: "demo-token-1", expiresIn: "24h", token_type: "Bearer" },
          user: {
            _id: 1,
            first_name: "Demo",
            last_name: "Admin",
            email: "demo@example.com",
            phone_number: "+2349000000000",
            created_at: "2026-01-01T00:00:00.000Z",
          },
        });
      }
      const dbUser = dbFindUserByEmail(email);
      if (dbUser && dbUser.password === password) {
        return respond(res, "Login successful", {
          jwt: { token: `demo-token-${dbUser.id}`, expiresIn: "24h", token_type: "Bearer" },
          user: mapUser(dbUser),
        });
      }
      return respondError(res, "Invalid email or password", 401);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const Register = async (req: Request, res: Response) => {
    try {
      const { first_name, last_name, email, password, phone_number } = req.body || {};
      const name = `${first_name || ""} ${last_name || ""}`.trim();
      return respond(res, "Registration successful", {
        jwt: { token: "demo-token-new", expiresIn: "24h", token_type: "Bearer" },
        user: {
          _id: Date.now(),
          first_name: first_name || "New",
          last_name: last_name || "User",
          email: email || "new@example.com",
          phone_number: phone_number || "",
          created_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ForgotPassword = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Password reset link sent to your email", { emailSent: true });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ResetPassword = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Password reset successful");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const Logout = async (_req: Request, res: Response) => {
    try {
      return respond(res, "Logged out successfully");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListDevelopments = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.take)) || 20;
      const { items, total } = dbGetAllDevelopments(page, limit);
      return respond(res, "Developments retrieved", paginatedResponse("develops", items.map(mapDevelop), total, page, limit));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateDevelopment = async (req: Request, res: Response) => {
    try {
      const item = dbCreateDevelopment((req.body || {}) as any);
      return respond(res, "Development created", mapDevelop(item));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetDevelopment = async (req: Request, res: Response) => {
    try {
      const item = dbGetDevelopmentById(parseInt(String(req.params.id)));
      if (!item) return respondError(res, "Development not found", 404);
      return respond(res, "Development retrieved", mapDevelop(item));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateDevelopment = async (req: Request, res: Response) => {
    try {
      const existing = dbUpdateDevelopment(parseInt(String(req.params.id)), (req.body || {}) as any);
      if (!existing) return respondError(res, "Development not found", 404);
      return respond(res, "Development updated", mapDevelop(existing));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteDevelopment = async (req: Request, res: Response) => {
    try {
      dbDeleteDevelopment(parseInt(String(req.params.id)));
      return respond(res, "Development deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListGrows = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.take)) || 20;
      const { items, total } = dbGetAllGrows(page, limit);
      return respond(res, "Grows retrieved", paginatedResponse("grows", items.map(mapGrow), total, page, limit));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateGrow = async (req: Request, res: Response) => {
    try {
      const item = dbCreateGrow((req.body || {}) as any);
      return respond(res, "Grow created", mapGrow(item));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetGrow = async (req: Request, res: Response) => {
    try {
      const item = dbGetGrowById(parseInt(String(req.params.id)));
      if (!item) return respondError(res, "Grow not found", 404);
      return respond(res, "Grow retrieved", mapGrow(item));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateGrow = async (req: Request, res: Response) => {
    try {
      const existing = dbUpdateGrow(parseInt(String(req.params.id)), (req.body || {}) as any);
      if (!existing) return respondError(res, "Grow not found", 404);
      return respond(res, "Grow updated", mapGrow(existing));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteGrow = async (req: Request, res: Response) => {
    try {
      dbDeleteGrow(parseInt(String(req.params.id)));
      return respond(res, "Grow deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListInvestments = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const { items, total } = dbGetAllInvestments(page, limit);
      return respond(res, "Investments retrieved", { items, total, page });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateInvestment = async (req: Request, res: Response) => {
    try {
      const item = dbCreateInvestment((req.body || {}) as any);
      return respond(res, "Investment created", item);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetInvestment = async (req: Request, res: Response) => {
    try {
      const item = dbGetInvestmentById(parseInt(String(req.params.id)));
      if (!item) return respondError(res, "Investment not found", 404);
      return respond(res, "Investment retrieved", item);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListProperties = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const type = String(req.query.type || "");
      const { items, total } = dbGetAllProperties(page, limit, type || undefined);
      return respond(res, "Properties retrieved", { items, total, page });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateProperty = async (req: Request, res: Response) => {
    try {
      const item = dbCreateProperty((req.body || {}) as any);
      return respond(res, "Property created", item);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetProperty = async (req: Request, res: Response) => {
    try {
      const item = dbGetPropertyById(parseInt(String(req.params.id)));
      if (!item) return respondError(res, "Property not found", 404);
      return respond(res, "Property retrieved", item);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateProperty = async (req: Request, res: Response) => {
    try {
      const existing = dbUpdateProperty(parseInt(String(req.params.id)), (req.body || {}) as any);
      if (!existing) return respondError(res, "Property not found", 404);
      return respond(res, "Property updated", existing);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteProperty = async (req: Request, res: Response) => {
    try {
      dbDeleteProperty(parseInt(String(req.params.id)));
      return respond(res, "Property deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListTransactions = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const type = String(req.query.type || "");
      const { items, total } = dbGetAllTransactions(page, limit, type || undefined);
      return respond(res, "Transactions retrieved", { items, total, page });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetTransaction = async (req: Request, res: Response) => {
    try {
      const item = dbGetTransactionById(parseInt(String(req.params.id)));
      if (!item) return respondError(res, "Transaction not found", 404);
      return respond(res, "Transaction retrieved", item);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListUsers = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.take)) || 20;
      const { items, total } = dbGetAllUsers(page, limit);
      return respond(res, "Users retrieved", paginatedResponse("users", items.map(mapUser), total, page, limit));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetUser = async (req: Request, res: Response) => {
    try {
      const item = dbGetUserById(parseInt(String(req.params.id)));
      if (!item) return respondError(res, "User not found", 404);
      return respond(res, "User retrieved", mapUser(item));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateUser = async (req: Request, res: Response) => {
    try {
      const existing = dbUpdateUser(parseInt(String(req.params.id)), (req.body || {}) as any);
      if (!existing) return respondError(res, "User not found", 404);
      return respond(res, "User updated", mapUser(existing));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteUser = async (req: Request, res: Response) => {
    try {
      dbDeleteUser(parseInt(String(req.params.id)));
      return respond(res, "User deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListContacts = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const status = String(req.query.status || "");
      const { items, total } = dbGetAllContacts(page, limit, status || undefined);
      return respond(res, "Contacts retrieved", { items, total, page });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteContact = async (req: Request, res: Response) => {
    try {
      dbDeleteContact(parseInt(String(req.params.id)));
      return respond(res, "Contact deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListBlog = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const { items, total } = dbGetAllBlogPosts(page, limit);
      return respond(res, "Blog posts retrieved", { items, total, page });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateBlog = async (req: Request, res: Response) => {
    try {
      const item = dbCreateBlogPost((req.body || {}) as any);
      return respond(res, "Blog post created", item);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetBlog = async (req: Request, res: Response) => {
    try {
      const item = dbGetBlogPostById(parseInt(String(req.params.id)));
      if (!item) return respondError(res, "Blog post not found", 404);
      return respond(res, "Blog post retrieved", item);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateBlog = async (req: Request, res: Response) => {
    try {
      const existing = dbUpdateBlogPost(parseInt(String(req.params.id)), (req.body || {}) as any);
      if (!existing) return respondError(res, "Blog post not found", 404);
      return respond(res, "Blog post updated", existing);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteBlog = async (req: Request, res: Response) => {
    try {
      dbDeleteBlogPost(parseInt(String(req.params.id)));
      return respond(res, "Blog post deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetSettings = async (_req: Request, res: Response) => {
    try {
      const settings = dbGetSettings();
      return respond(res, "Settings retrieved", settings);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateSettings = async (req: Request, res: Response) => {
    try {
      const updated = dbUpdateSettings((req.body || {}) as any);
      return respond(res, "Settings updated", updated);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListInvoices = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const { items, total } = dbGetAllInvoices(page, limit);
      return respond(res, "Invoices retrieved", { items, total, page });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetInvoice = async (req: Request, res: Response) => {
    try {
      const item = dbGetInvoiceById(parseInt(String(req.params.id)));
      if (!item) return respondError(res, "Invoice not found", 404);
      return respond(res, "Invoice retrieved", item);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListReviews = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 20;
      const status = String(req.query.status || "");
      const { items, total } = dbGetAllReviews(page, limit, status || undefined);
      return respond(res, "Reviews retrieved", { items, total, page });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteReview = async (req: Request, res: Response) => {
    try {
      dbDeleteReview(parseInt(String(req.params.id)));
      return respond(res, "Review deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetDashboard = async (_req: Request, res: Response) => {
    try {
      const stats = dbGetDashboardStats();
      return respond(res, "Dashboard data retrieved", stats);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UploadFiles = async (req: Request, res: Response) => {
    try {
      return respond(res, "Files uploaded", {
        filePaths: [
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
        ],
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListDevelopRequests = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const take = parseInt(String(req.query.take)) || 20;
      const { items, total } = dbGetOngoingDevelopments(page, take);
      return respond(res, "Development requests retrieved", paginatedResponse("developRequests", items.map(mapDevelopRequest), total, page, take));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ListGrowRequests = async (req: Request, res: Response) => {
    try {
      const page = parseInt(String(req.query.page)) || 1;
      const take = parseInt(String(req.query.take)) || 20;
      const { items, total } = dbGetActiveGrows(page, take);
      return respond(res, "Grow requests retrieved", paginatedResponse("growRequests", items.map(mapGrowRequest), total, page, take));
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  return {
    Login,
    Register,
    ForgotPassword,
    ResetPassword,
    Logout,
    ListDevelopments,
    CreateDevelopment,
    GetDevelopment,
    UpdateDevelopment,
    DeleteDevelopment,
    ListGrows,
    CreateGrow,
    GetGrow,
    UpdateGrow,
    DeleteGrow,
    ListInvestments,
    CreateInvestment,
    GetInvestment,
    ListProperties,
    CreateProperty,
    GetProperty,
    UpdateProperty,
    DeleteProperty,
    ListTransactions,
    GetTransaction,
    ListUsers,
    GetUser,
    UpdateUser,
    DeleteUser,
    ListContacts,
    DeleteContact,
    ListBlog,
    CreateBlog,
    GetBlog,
    UpdateBlog,
    DeleteBlog,
    GetSettings,
    UpdateSettings,
    ListInvoices,
    GetInvoice,
    ListReviews,
    DeleteReview,
    GetDashboard,
    UploadFiles,
    ListDevelopRequests,
    ListGrowRequests,
  };
};
