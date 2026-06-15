import { Router } from "express";
import { ArtisanServicesWebController } from "../controllers/index.js";

const ArtisanServicesWebRouter = Router();
const Controller = ArtisanServicesWebController();

ArtisanServicesWebRouter.get("/", (_req, res) => {
  res.json({ success: true, message: "artisan-services-web dummy backend running" });
});

// Auth
ArtisanServicesWebRouter.post("/api/v1/register", Controller.Register);
ArtisanServicesWebRouter.post("/api/v1/login", Controller.Login);
ArtisanServicesWebRouter.post("/api/v1/code/get", Controller.SendCode);
ArtisanServicesWebRouter.post("/api/v1/code/verify", Controller.VerifyCode);
ArtisanServicesWebRouter.post("/api/v1/forgot-password", Controller.ForgotPassword);
ArtisanServicesWebRouter.patch("/api/v1/reset-password", Controller.ResetPassword);
ArtisanServicesWebRouter.post("/api/v1/logout", Controller.Logout);
ArtisanServicesWebRouter.get("/api/v1/deactivate", Controller.DeactivateAccount);

// User Profile
ArtisanServicesWebRouter.patch("/api/v1/update", Controller.UpdateUser);
ArtisanServicesWebRouter.patch("/api/v1/update-password", Controller.UpdatePassword);
ArtisanServicesWebRouter.patch("/api/v1/profile-image", Controller.UploadProfileImage);

// Artisan listing & profile
ArtisanServicesWebRouter.post("/api/v1/all/artisan", Controller.GetArtisans);
ArtisanServicesWebRouter.get("/api/v1/single/artisan/:id", Controller.GetArtisan);
ArtisanServicesWebRouter.patch("/api/v1/artisan", Controller.UpdateArtisan);
ArtisanServicesWebRouter.post("/api/v1/artisan/photo", Controller.UploadArtisanPhoto);
ArtisanServicesWebRouter.post("/api/v1/artisan/nin", Controller.SubmitNIN);
ArtisanServicesWebRouter.post("/api/v1/artisan/personal", Controller.SubmitPersonalDetails);
ArtisanServicesWebRouter.post("/api/v1/artisan/business", Controller.SubmitBusinessDetails);
ArtisanServicesWebRouter.patch("/api/v1/artisan/business-hours", Controller.UpdateBusinessHoursOrInfo);
ArtisanServicesWebRouter.patch("/api/v1/artisan/socials", Controller.UpdateSocials);
ArtisanServicesWebRouter.get("/api/v1/single/business-hours/:id", Controller.GetBusinessHours);

// Portfolio
ArtisanServicesWebRouter.post("/api/v1/all/portfolio", Controller.GetPortfolios);
ArtisanServicesWebRouter.post("/api/v1/artisan/portfolio", Controller.CreatePortfolio);
ArtisanServicesWebRouter.delete("/api/v1/artisan/portfolio/:id", Controller.DeletePortfolio);

// Booking
ArtisanServicesWebRouter.post("/api/v1/user/booking", Controller.CreateBooking);
ArtisanServicesWebRouter.post("/api/v1/all/booking", Controller.GetBookings);
ArtisanServicesWebRouter.get("/api/v1/single/booking/:id", Controller.GetBooking);
ArtisanServicesWebRouter.patch("/api/v1/user/booking/:id", Controller.UpdateBooking);

// Favourite
ArtisanServicesWebRouter.post("/api/v1/all/favourite", Controller.GetFavourites);
ArtisanServicesWebRouter.post("/api/v1/analytics/favourite", Controller.ToggleFavourite);

// Rating / Review
ArtisanServicesWebRouter.post("/api/v1/all/rating", Controller.GetRatings);
ArtisanServicesWebRouter.post("/api/v1/analytics/rating", Controller.SubmitRating);

// Dispute
ArtisanServicesWebRouter.post("/api/v1/all/dispute", Controller.GetDisputes);
ArtisanServicesWebRouter.post("/api/v1/dispute", Controller.CreateDispute);
ArtisanServicesWebRouter.post("/api/v1/all/dispute-response", Controller.GetDisputeResponses);
ArtisanServicesWebRouter.post("/api/v1/dispute-response", Controller.CreateDisputeResponse);

// Chat
ArtisanServicesWebRouter.post("/api/v1/all/chat", Controller.GetChats);
ArtisanServicesWebRouter.post("/api/v1/chat", Controller.SendChatMessage);
ArtisanServicesWebRouter.get("/api/v1/chat/highlights", Controller.GetChatHighlights);

// Notification
ArtisanServicesWebRouter.post("/api/v1/all/notification", Controller.GetNotifications);
ArtisanServicesWebRouter.patch("/api/v1/notification/update/:id", Controller.UpdateNotification);

// Categories (no auth)
ArtisanServicesWebRouter.get("/api/v1/no-auth/all/artisan-category", Controller.GetCategories);

// Contact (no auth)
ArtisanServicesWebRouter.post("/api/v1/no-auth/feedback", Controller.SubmitFeedback);

// Analytics
ArtisanServicesWebRouter.post("/api/v1/analytics/views", Controller.RecordView);


// Google Maps replacement
ArtisanServicesWebRouter.post("/api/v1/geocode", Controller.Geocode);

export default ArtisanServicesWebRouter;
