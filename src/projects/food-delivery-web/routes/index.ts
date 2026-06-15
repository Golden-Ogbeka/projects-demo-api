import { Router } from "express";
import { FoodDeliveryWebController } from "../controllers/index.js";

const FoodDeliveryWebRouter = Router();
const ctrl = FoodDeliveryWebController();

// ──── User API (/user/v1) ────
FoodDeliveryWebRouter.post("/user/v1/login", ctrl.UserLogin);
FoodDeliveryWebRouter.post("/user/v1/register", ctrl.UserRegister);
FoodDeliveryWebRouter.post("/user/v1/verify-otp", ctrl.VerifyOtp);
FoodDeliveryWebRouter.post("/user/v1/resend-otp", ctrl.ResendOtp);
FoodDeliveryWebRouter.post("/user/v1/forgot-password", ctrl.ForgotPassword);
FoodDeliveryWebRouter.post("/user/v1/reset-password", ctrl.ResetPassword);
FoodDeliveryWebRouter.get("/user/v1/profile", ctrl.GetProfile);
FoodDeliveryWebRouter.put("/user/v1/profile", ctrl.UpdateProfile);
FoodDeliveryWebRouter.put("/user/v1/change-password", ctrl.ChangePassword);
FoodDeliveryWebRouter.post("/user/v1/logout", ctrl.Logout);
FoodDeliveryWebRouter.get("/user/v1/addresses", ctrl.GetAddresses);
FoodDeliveryWebRouter.post("/user/v1/addresses", ctrl.CreateAddress);
FoodDeliveryWebRouter.put("/user/v1/addresses/:id", ctrl.UpdateAddress);
FoodDeliveryWebRouter.delete("/user/v1/addresses/:id", ctrl.DeleteAddress);

// New user API routes for frontend compatibility
FoodDeliveryWebRouter.get("/user/v1/code/send", ctrl.SendCode);
FoodDeliveryWebRouter.post("/user/v1/verify", ctrl.VerifyCode);
FoodDeliveryWebRouter.get("/user/v1/token/refresh", ctrl.RefreshToken);
FoodDeliveryWebRouter.patch("/user/v1/update", ctrl.UpdateUserProfile);
FoodDeliveryWebRouter.patch("/user/v1/update-password", ctrl.UpdateUserPassword);
FoodDeliveryWebRouter.patch("/user/v1/reset-password", ctrl.ResetPassword);

// Frontend-compatible aliases
FoodDeliveryWebRouter.post("/user/v1/resend-verification", ctrl.ResendOtp);
FoodDeliveryWebRouter.post("/user/v1/request-password-reset", ctrl.ForgotPassword);
FoodDeliveryWebRouter.post("/user/v1/update-forgotten-password", ctrl.ResetPassword);
FoodDeliveryWebRouter.patch("/user/v1/update-details", ctrl.UpdateUserProfile);

// ──── Main API (/api/v1) ────
FoodDeliveryWebRouter.get("/api/v1/restaurants", ctrl.GetRestaurants);
FoodDeliveryWebRouter.get("/api/v1/restaurants/:id", ctrl.GetRestaurant);
FoodDeliveryWebRouter.get("/api/v1/restaurants/:id/menu", ctrl.GetRestaurantMenu);
FoodDeliveryWebRouter.get("/api/v1/categories", ctrl.GetCategories);
FoodDeliveryWebRouter.get("/api/v1/foods", ctrl.GetFoods);
FoodDeliveryWebRouter.get("/api/v1/foods/:id", ctrl.GetFood);
FoodDeliveryWebRouter.get("/api/v1/search", ctrl.Search);
FoodDeliveryWebRouter.get("/api/v1/orders", ctrl.GetOrders);
FoodDeliveryWebRouter.post("/api/v1/orders", ctrl.CreateOrder);
FoodDeliveryWebRouter.get("/api/v1/orders/:id", ctrl.GetOrder);
FoodDeliveryWebRouter.post("/api/v1/cart", ctrl.AddToCart);
FoodDeliveryWebRouter.get("/api/v1/cart", ctrl.GetCart);
FoodDeliveryWebRouter.put("/api/v1/cart/:id", ctrl.UpdateCartItem);
FoodDeliveryWebRouter.delete("/api/v1/cart/:id", ctrl.DeleteCartItem);
FoodDeliveryWebRouter.post("/api/v1/checkout", ctrl.Checkout);
FoodDeliveryWebRouter.post("/api/v1/paystack/initialize", ctrl.PaystackInitialize);
FoodDeliveryWebRouter.get("/api/v1/paystack/verify", ctrl.PaystackVerify);
FoodDeliveryWebRouter.post("/api/v1/reviews", ctrl.CreateReview);
FoodDeliveryWebRouter.get("/api/v1/reviews", ctrl.GetReviews);
FoodDeliveryWebRouter.get("/api/v1/banners", ctrl.GetBanners);
FoodDeliveryWebRouter.get("/api/v1/promos", ctrl.GetPromos);

// New main API routes for frontend compatibility
FoodDeliveryWebRouter.get("/api/v1/promotions", ctrl.GetPromotions);
FoodDeliveryWebRouter.get("/api/v1/settings/availabilities", ctrl.GetAvailabilities);
FoodDeliveryWebRouter.get("/api/v1/restaurant-categories", ctrl.GetRestaurantCategories);
FoodDeliveryWebRouter.get("/api/v1/misc/general-data", ctrl.GetGeneralData);
FoodDeliveryWebRouter.get("/api/v1/vendor/products", ctrl.GetVendorProducts);
FoodDeliveryWebRouter.get("/api/v1/vendor/products/:id", ctrl.GetVendorProductById);
FoodDeliveryWebRouter.get("/api/v1/user/address", ctrl.GetUserAddresses);
FoodDeliveryWebRouter.post("/api/v1/user/address", ctrl.CreateUserAddress);
FoodDeliveryWebRouter.delete("/api/v1/user/address/:id", ctrl.DeleteUserAddress);
FoodDeliveryWebRouter.post("/api/v1/user/orders", ctrl.CreateUserOrder);
FoodDeliveryWebRouter.get("/api/v1/user/orders", ctrl.GetUserOrders);
FoodDeliveryWebRouter.get("/api/v1/user/orders/:id", ctrl.GetUserOrder);
FoodDeliveryWebRouter.post("/api/v1/user/coupon/validate", ctrl.ValidateCoupon);
FoodDeliveryWebRouter.get("/api/v1/user/coupon/verify", ctrl.VerifyCoupon);
FoodDeliveryWebRouter.post("/api/v1/user/transaction/all/card", ctrl.GetSavedCards);
FoodDeliveryWebRouter.post("/api/v1/user/transaction/pay", ctrl.PayWithCard);
FoodDeliveryWebRouter.post("/api/v1/user/transaction/initialize", ctrl.InitializeTransaction);
FoodDeliveryWebRouter.get("/api/v1/user/transaction/verify", ctrl.VerifyTransaction);
FoodDeliveryWebRouter.post("/api/v1/user/analytics/views", ctrl.TrackAnalyticsView);
FoodDeliveryWebRouter.post("/api/v1/user/analytics/all/favourite", ctrl.GetFavourites);
FoodDeliveryWebRouter.post("/api/v1/user/analytics/favourite", ctrl.ToggleFavourite);
FoodDeliveryWebRouter.post("/api/v1/user/analytics/favourite/remove", ctrl.UntoggleFavourite);
FoodDeliveryWebRouter.post("/api/v1/user/analytics/rating", ctrl.RateRestaurant);

// Paystack aliases
FoodDeliveryWebRouter.post("/api/v1/user/paystack/initialize", ctrl.PaystackInitialize);
FoodDeliveryWebRouter.get("/api/v1/user/paystack/verify", ctrl.PaystackVerify);

// Notification/email route (hardcoded in some frontends)
FoodDeliveryWebRouter.post("/admin/v1/notify/email", ctrl.NotifyEmail);

// ──── Vendor API (/vendor/v1) ────
FoodDeliveryWebRouter.post("/vendor/v1/login", ctrl.VendorLogin);
FoodDeliveryWebRouter.get("/vendor/v1/dashboard", ctrl.VendorDashboard);
FoodDeliveryWebRouter.get("/vendor/v1/orders", ctrl.VendorOrders);
FoodDeliveryWebRouter.put("/vendor/v1/orders/:id", ctrl.VendorUpdateOrder);
FoodDeliveryWebRouter.get("/vendor/v1/products", ctrl.VendorProducts);
FoodDeliveryWebRouter.post("/vendor/v1/products", ctrl.VendorCreateProduct);
FoodDeliveryWebRouter.put("/vendor/v1/products/:id", ctrl.VendorUpdateProduct);

FoodDeliveryWebRouter.post("/vendor/v1/register", ctrl.VendorRegister);

// ──── Admin API (/admin/v1) ────
FoodDeliveryWebRouter.get("/admin/v1", ctrl.AdminHealth);
FoodDeliveryWebRouter.post("/admin/v1/feedback", ctrl.AdminFeedback);
FoodDeliveryWebRouter.post("/admin/v1/submit-vendor-info", ctrl.SubmitVendorInfo);
FoodDeliveryWebRouter.post("/admin/v1/submit-logistics-info", ctrl.SubmitLogisticsInfo);
FoodDeliveryWebRouter.post("/admin/v1/vendor-applications/:userId/upload-signed-agreement", ctrl.UploadSignedAgreement);
FoodDeliveryWebRouter.post("/admin/v1/logistics-applications/:userId/upload-signed-agreement", ctrl.UploadLogisticsAgreement);

export default FoodDeliveryWebRouter;
