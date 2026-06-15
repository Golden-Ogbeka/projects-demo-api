import { Router } from "express";
import multer from "multer";
import { RealEstateAdminController } from "../controllers/index.js";

const RealEstateAdminRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });
const Ctrl = RealEstateAdminController();

RealEstateAdminRouter.get("/", (_req, res) => {
  res.json({ status: "success", message: "real-estate-admin dummy backend" });
});

RealEstateAdminRouter.post("/api/auth/login", Ctrl.Login);
RealEstateAdminRouter.post("/api/auth/register", Ctrl.Register);
RealEstateAdminRouter.post("/api/auth/forgot-password", Ctrl.ForgotPassword);
RealEstateAdminRouter.post("/api/auth/reset-password", Ctrl.ResetPassword);
RealEstateAdminRouter.post("/api/auth/logout", Ctrl.Logout);

RealEstateAdminRouter.get("/api/develops", Ctrl.ListDevelopments);
RealEstateAdminRouter.post("/api/develops", Ctrl.CreateDevelopment);
RealEstateAdminRouter.get("/api/develops/:id", Ctrl.GetDevelopment);
RealEstateAdminRouter.patch("/api/develops/:id", Ctrl.UpdateDevelopment);
RealEstateAdminRouter.delete("/api/develops/:id", Ctrl.DeleteDevelopment);

RealEstateAdminRouter.get("/api/grows", Ctrl.ListGrows);
RealEstateAdminRouter.post("/api/grows", Ctrl.CreateGrow);
RealEstateAdminRouter.get("/api/grows/:id", Ctrl.GetGrow);
RealEstateAdminRouter.patch("/api/grows/:id", Ctrl.UpdateGrow);
RealEstateAdminRouter.delete("/api/grows/:id", Ctrl.DeleteGrow);

RealEstateAdminRouter.get("/api/investments", Ctrl.ListInvestments);
RealEstateAdminRouter.post("/api/investments", Ctrl.CreateInvestment);
RealEstateAdminRouter.get("/api/investments/:id", Ctrl.GetInvestment);

RealEstateAdminRouter.get("/api/properties", Ctrl.ListProperties);
RealEstateAdminRouter.post("/api/properties", Ctrl.CreateProperty);
RealEstateAdminRouter.get("/api/properties/:id", Ctrl.GetProperty);
RealEstateAdminRouter.put("/api/properties/:id", Ctrl.UpdateProperty);
RealEstateAdminRouter.delete("/api/properties/:id", Ctrl.DeleteProperty);

RealEstateAdminRouter.get("/api/transactions", Ctrl.ListTransactions);
RealEstateAdminRouter.get("/api/transactions/:id", Ctrl.GetTransaction);

RealEstateAdminRouter.get("/api/users", Ctrl.ListUsers);
RealEstateAdminRouter.get("/api/users/:id", Ctrl.GetUser);
RealEstateAdminRouter.put("/api/users/:id", Ctrl.UpdateUser);
RealEstateAdminRouter.delete("/api/users/:id", Ctrl.DeleteUser);

RealEstateAdminRouter.get("/api/contacts", Ctrl.ListContacts);
RealEstateAdminRouter.delete("/api/contacts/:id", Ctrl.DeleteContact);

RealEstateAdminRouter.get("/api/blog", Ctrl.ListBlog);
RealEstateAdminRouter.post("/api/blog", Ctrl.CreateBlog);
RealEstateAdminRouter.get("/api/blog/:id", Ctrl.GetBlog);
RealEstateAdminRouter.put("/api/blog/:id", Ctrl.UpdateBlog);
RealEstateAdminRouter.delete("/api/blog/:id", Ctrl.DeleteBlog);

RealEstateAdminRouter.get("/api/settings", Ctrl.GetSettings);
RealEstateAdminRouter.put("/api/settings", Ctrl.UpdateSettings);

RealEstateAdminRouter.get("/api/invoices", Ctrl.ListInvoices);
RealEstateAdminRouter.get("/api/invoices/:id", Ctrl.GetInvoice);

RealEstateAdminRouter.get("/api/reviews", Ctrl.ListReviews);
RealEstateAdminRouter.delete("/api/reviews/:id", Ctrl.DeleteReview);

RealEstateAdminRouter.get("/api/dashboard", Ctrl.GetDashboard);

// Extra endpoints matching frontend expectations
RealEstateAdminRouter.post("/api/upload/files", upload.array("files"), Ctrl.UploadFiles);
RealEstateAdminRouter.get("/api/develop/requests", Ctrl.ListDevelopRequests);
RealEstateAdminRouter.get("/api/grow/requests", Ctrl.ListGrowRequests);

export default RealEstateAdminRouter;
