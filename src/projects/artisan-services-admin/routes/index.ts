import { Router } from "express";
import { ArtisanServicesAdminController } from "../controllers/index.js";

const ArtisanServicesAdminRouter = Router();
const Controller = ArtisanServicesAdminController();

ArtisanServicesAdminRouter.get("/", (_req, res) => {
  res.json({ success: true, message: "artisan-services-admin dummy backend running" });
});

// Auth
ArtisanServicesAdminRouter.post("/auth/login", Controller.Login);
ArtisanServicesAdminRouter.get("/auth/logout", Controller.Logout);
ArtisanServicesAdminRouter.post("/auth/verify", Controller.VerifyAccount);
ArtisanServicesAdminRouter.get("/auth/send-verification", Controller.SendVerification);
ArtisanServicesAdminRouter.patch("/auth/reset-password", Controller.ResetPassword);
ArtisanServicesAdminRouter.post("/auth/forgot-password", Controller.ForgotPassword);
ArtisanServicesAdminRouter.patch("/auth/update-email", Controller.UpdateEmail);
ArtisanServicesAdminRouter.patch("/auth/update-password", Controller.UpdatePassword);
ArtisanServicesAdminRouter.post("/auth/register", Controller.RegisterAdmin);

// Dashboard
ArtisanServicesAdminRouter.get("/stats", Controller.Dashboard);

// Artisans
ArtisanServicesAdminRouter.post("/all/artisan", Controller.GetArtisans);
ArtisanServicesAdminRouter.get("/single/artisan/:id", Controller.GetArtisan);
ArtisanServicesAdminRouter.patch("/artisan/verify", Controller.VerifyArtisan);
ArtisanServicesAdminRouter.patch("/artisan/approve", Controller.ApproveArtisan);
ArtisanServicesAdminRouter.patch("/activestatus/artisan", Controller.ToggleArtisanActive);
ArtisanServicesAdminRouter.patch("/permissions/artisan", Controller.UpdateArtisanPermissions);
ArtisanServicesAdminRouter.get("/single/business-hours/:id", Controller.GetBusinessHours);
ArtisanServicesAdminRouter.get("/single/rating/:id", Controller.GetRating);
ArtisanServicesAdminRouter.post("/all/view", Controller.GetViews);

// Artisan Categories
ArtisanServicesAdminRouter.post("/all/artisan-category", Controller.GetArtisanCategories);
ArtisanServicesAdminRouter.get("/single/artisan-category/:id", Controller.GetArtisanCategory);
ArtisanServicesAdminRouter.post("/artisan/category", Controller.CreateOrUpdateArtisanCategory);
ArtisanServicesAdminRouter.delete("/delete/artisan-category/:id", Controller.DeleteArtisanCategory);

// Customers
ArtisanServicesAdminRouter.post("/all/user", Controller.GetCustomers);
ArtisanServicesAdminRouter.get("/single/user/:id", Controller.GetCustomer);
ArtisanServicesAdminRouter.patch("/activestatus/user", Controller.ToggleCustomerActive);
ArtisanServicesAdminRouter.patch("/permissions/user", Controller.UpdateCustomerPermissions);
ArtisanServicesAdminRouter.post("/all/active", Controller.GetActiveCustomers);
ArtisanServicesAdminRouter.post("/all/visit", Controller.GetVisits);

// Customer Feedback
ArtisanServicesAdminRouter.post("/all/feedback", Controller.GetFeedbacks);
ArtisanServicesAdminRouter.get("/single/feedback/:id", Controller.GetFeedback);

// Customer Ratings
ArtisanServicesAdminRouter.post("/all/user-rating", Controller.GetUserRatings);

// User (create both customers and artisans)
ArtisanServicesAdminRouter.post("/user", Controller.CreateUser);
ArtisanServicesAdminRouter.patch("/update-self", Controller.UpdateSelf);

// Admins
ArtisanServicesAdminRouter.post("/all/admin", Controller.GetAdmins);
ArtisanServicesAdminRouter.get("/single/admin/:id", Controller.GetAdmin);
ArtisanServicesAdminRouter.patch("/toggle-active-status/admin", Controller.ToggleAdminActive);
ArtisanServicesAdminRouter.patch("/permissions", Controller.UpdateAdminPermissions);
ArtisanServicesAdminRouter.patch("/super/create-superadmin", Controller.CreateSuperAdmin);

// Tickets
ArtisanServicesAdminRouter.post("/all/ticket", Controller.GetTickets);
ArtisanServicesAdminRouter.post("/tickets", Controller.CreateTicket);
ArtisanServicesAdminRouter.patch("/tickets/update", Controller.UpdateTicket);
ArtisanServicesAdminRouter.patch("/tickets/respond", Controller.RespondToTicket);
ArtisanServicesAdminRouter.post("/all/ticket-response", Controller.GetTicketResponses);

// Disputes
ArtisanServicesAdminRouter.post("/all/dispute", Controller.GetDisputes);
ArtisanServicesAdminRouter.patch("/dispute/join", Controller.JoinDispute);
ArtisanServicesAdminRouter.post("/dispute/respond", Controller.RespondToDispute);
ArtisanServicesAdminRouter.post("/all/dispute-response", Controller.GetDisputeResponses);

// Appointments
ArtisanServicesAdminRouter.post("/all/booking", Controller.GetAppointments);
ArtisanServicesAdminRouter.get("/single/booking/:id", Controller.GetAppointment);

// Notifications
ArtisanServicesAdminRouter.post("/all/notification", Controller.GetNotifications);
ArtisanServicesAdminRouter.patch("/notification/update/:id", Controller.MarkNotificationRead);
ArtisanServicesAdminRouter.patch("/notification/settings", Controller.UpdateNotificationSettings);

// Waiting List
ArtisanServicesAdminRouter.post("/all/waiting-list", Controller.GetWaitingList);
ArtisanServicesAdminRouter.delete("/delete/waiting-list/:id", Controller.DeleteWaitingListEntry);

// Profile
ArtisanServicesAdminRouter.patch("/profile-image", Controller.UpdateProfileImage);

export default ArtisanServicesAdminRouter;
