import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { generateOtp } from "../../../functions/otp.js";
import {
  FoodDeliveryAddress,
  FoodDeliveryCartItem,
  FoodDeliveryOrder,
  FoodDeliveryOrderItem,
  FoodDeliveryUser,
} from "../types/index.js";

const DEMO_TOKEN = "demo-food-delivery-web-token";
const DEMO_REFRESH_TOKEN = "demo-food-delivery-web-refresh-token";

const respond = (res: Response, message: string, data?: unknown, statusCode: number = 200) => {
  return res.status(statusCode).json({ status: "success", message, data });
};

const respondError = (res: Response, statusCode: number, message: string) => {
  return res.status(statusCode).json({ status: "error", message });
};

const respondCatch = (res: Response, error: unknown) => {
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return res.status(500).json({ status: "error", message });
};

type RestaurantRaw = typeof RESTAURANTS[0];

const toRestaurantShape = (r: RestaurantRaw) => ({
  _id: r.id,
  name: r.name,
  description: r.description,
  rating: r.rating,
  deliveryTime: r.deliveryTime,
  deliveryFee: r.deliveryFee,
  minOrder: r.minOrder,
  heroImage: r.image,
  logo: r.image,
  category: { name: r.categories.split(",")[0].trim() },
  address: "Lekki, Lagos",
  state: "Lagos",
  lga: "Lagos",
  isOpen: !!r.isOpen,
  location: { coordinates: [r.lng, r.lat] as [number, number] },
});

const toCategoryShape = (c: (typeof CATEGORIES)[number]) => ({
  _id: c.id,
  name: c.name,
  image: c.image,
});

type FoodRaw = (typeof FOODS)[number];

const toProductShape = (f: FoodRaw) => ({
  _id: f.id,
  restaurantId: f.restaurantId,
  name: f.name,
  description: f.description,
  price: f.price,
  image: f.image,
  foodCategory: { name: f.category },
  purchase_in_bulk: false,
  min_quantity: 1,
  max_quantity: 50,
  packCost: 0,
  usePack: false,
  isAvailable: !!f.isAvailable,
});

const getUserIdFromRequest = (req: Request): number | null => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.split(" ")[1];
  if (token !== DEMO_TOKEN) return null;
  return 1;
};

const RESTAURANTS = [
  { id: 1, name: "Mama Cass Kitchen", description: "Authentic Nigerian home-cooked meals with a modern twist. Fresh ingredients, bold flavours.", rating: 4.7, deliveryTime: "25-35 min", deliveryFee: 500, minOrder: 2000, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400", categories: "African,Nigerian Special", isOpen: 1, lat: 6.4489, lng: 3.4697 },
  { id: 2, name: "The Place", description: "One of Lagos' favourite spots for Nigerian and continental dishes. Great for lunch and dinner.", rating: 4.5, deliveryTime: "20-30 min", deliveryFee: 400, minOrder: 2500, image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400", categories: "African,Fast Food", isOpen: 1, lat: 6.4529, lng: 3.4358 },
  { id: 3, name: "Chicken Capital", description: "The ultimate destination for chicken lovers. Fried, grilled, roasted — we do it all.", rating: 4.6, deliveryTime: "20-30 min", deliveryFee: 0, minOrder: 3000, image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400", categories: "Fast Food,Grill", isOpen: 1, lat: 6.4421, lng: 3.4532 },
  { id: 4, name: "Yellow Chilli", description: "Fine dining Nigerian cuisine with an elegant atmosphere. Celebrate every flavour.", rating: 4.8, deliveryTime: "30-45 min", deliveryFee: 800, minOrder: 5000, image: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=400", categories: "African,Fine Dining", isOpen: 1, lat: 6.4560, lng: 3.4620 },
  { id: 5, name: "Sweet Spot Desserts", description: "Artisan cakes, ice cream, smoothies, and every sweet indulgence you deserve.", rating: 4.4, deliveryTime: "15-25 min", deliveryFee: 300, minOrder: 1500, image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400", categories: "Desserts,Drinks", isOpen: 1, lat: 6.4380, lng: 3.4400 },
  { id: 6, name: "Shawarma Bistro", description: "Premium shawarma, burgers, wraps, and fast food classics made fresh daily.", rating: 4.3, deliveryTime: "15-20 min", deliveryFee: 300, minOrder: 2000, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", categories: "Fast Food", isOpen: 1, lat: 6.4490, lng: 3.4780 },
  { id: 7, name: "KFC", description: "Colonel Sanders' famous fried chicken, wings, and meals. Finger lickin' good.", rating: 4.2, deliveryTime: "20-30 min", deliveryFee: 400, minOrder: 2500, image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400", categories: "Fast Food,International", isOpen: 1, lat: 6.4410, lng: 3.4290 },
  { id: 8, name: "Domino's Pizza", description: "Hot, fresh pizza delivered to your door. Choose from classic and specialty pies.", rating: 4.1, deliveryTime: "20-30 min", deliveryFee: 0, minOrder: 3000, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400", categories: "Pizza,International", isOpen: 1, lat: 6.4470, lng: 3.4550 },
];

const CATEGORIES = [
  { id: 1, name: "African", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200" },
  { id: 2, name: "Fast Food", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200" },
  { id: 3, name: "Drinks", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200" },
  { id: 4, name: "Desserts", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=200" },
  { id: 5, name: "Grill", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200" },
  { id: 6, name: "Nigerian Special", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200" },
];

const FOODS = [
  { id: 1, restaurantId: 1, name: "Jollof Rice & Chicken", description: "Classic Nigerian jollof rice with fried plantain and grilled chicken", price: 3500, category: "African", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300", isAvailable: 1 },
  { id: 2, restaurantId: 1, name: "Moi Moi", description: "Steamed bean pudding with pepper sauce and fish", price: 1500, category: "African", image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300", isAvailable: 1 },
  { id: 3, restaurantId: 1, name: "Egusi Soup & Pounded Yam", description: "Rich melon seed soup with assorted meat and pounded yam", price: 4500, category: "Nigerian Special", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300", isAvailable: 1 },
  { id: 4, restaurantId: 2, name: "Fried Rice & Chicken", description: "Nigerian fried rice with grilled chicken and coleslaw", price: 3800, category: "African", image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300", isAvailable: 1 },
  { id: 5, restaurantId: 2, name: "Pepper Soup & Catfish", description: "Spicy pepper soup with fresh catfish", price: 4200, category: "African", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300", isAvailable: 1 },
  { id: 6, restaurantId: 2, name: "Beef Burger", description: "Quarter-pound beef burger with lettuce, tomato, and special sauce", price: 2800, category: "Fast Food", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", isAvailable: 1 },
  { id: 7, restaurantId: 3, name: "Fried Chicken (4pc)", description: "Crispy golden fried chicken — 4 pieces", price: 4500, category: "Fast Food", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300", isAvailable: 1 },
  { id: 8, restaurantId: 3, name: "Grilled Chicken (Half)", description: "Half chicken grilled to perfection with herbs", price: 5500, category: "Grill", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300", isAvailable: 1 },
  { id: 9, restaurantId: 3, name: "Chicken Wings (6pc)", description: "Spicy buffalo chicken wings with ranch dip", price: 3800, category: "Fast Food", image: "https://images.unsplash.com/photo-1527477396000-e27163b4be8c?w=300", isAvailable: 1 },
  { id: 10, restaurantId: 3, name: "Full Chicken Meal", description: "Whole fried chicken with fries, coleslaw, and drink", price: 6500, category: "Fast Food", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300", isAvailable: 1 },
  { id: 11, restaurantId: 3, name: "Chicken Chips", description: "Crispy chicken strips with seasoned fries", price: 3300, category: "Fast Food", image: "https://images.unsplash.com/photo-1526232761682-d26e03b1480e?w=300", isAvailable: 1 },
  { id: 12, restaurantId: 4, name: "Ofada Rice & Sauce", description: "Local ofada rice with ayamase sauce and assorted meat", price: 5500, category: "Nigerian Special", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300", isAvailable: 1 },
  { id: 13, restaurantId: 4, name: "Grilled Lobster", description: "Fresh lobster grilled with garlic butter and herbs", price: 12000, category: "Grill", image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=300", isAvailable: 1 },
  { id: 14, restaurantId: 4, name: "Suya Platter", description: "Assorted beef suya, chicken suya, and gizzard served with onions", price: 6500, category: "Grill", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300", isAvailable: 1 },
  { id: 15, restaurantId: 5, name: "Chocolate Cake (Slice)", description: "Rich moist chocolate cake with fudge icing", price: 2500, category: "Desserts", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300", isAvailable: 1 },
  { id: 16, restaurantId: 5, name: "Ice Cream Sundae", description: "Vanilla, strawberry, and chocolate ice cream with toppings", price: 2000, category: "Desserts", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300", isAvailable: 1 },
  { id: 17, restaurantId: 5, name: "Fruit Smoothie", description: "Fresh blended mango, strawberry, and banana smoothie", price: 1800, category: "Drinks", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300", isAvailable: 1 },
  { id: 18, restaurantId: 5, name: "Red Velvet Cake (Slice)", description: "Creamy red velvet cake with cream cheese frosting", price: 2800, category: "Desserts", image: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=300", isAvailable: 1 },
  { id: 19, restaurantId: 6, name: "Beef Shawarma", description: "Classic beef shawarma wrap with garlic sauce and veggies", price: 3200, category: "Fast Food", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300", isAvailable: 1 },
  { id: 20, restaurantId: 6, name: "Chicken Shawarma", description: "Grilled chicken shawarma wrap with tahini sauce", price: 3000, category: "Fast Food", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300", isAvailable: 1 },
  { id: 21, restaurantId: 6, name: "Double Cheeseburger", description: "Two beef patties with double cheese, bacon, and special sauce", price: 3800, category: "Fast Food", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", isAvailable: 1 },
  { id: 22, restaurantId: 7, name: "Zinger Burger", description: "Crispy chicken fillet burger with lettuce and mayo", price: 3500, category: "Fast Food", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300", isAvailable: 1 },
  { id: 23, restaurantId: 7, name: "Bucket Meal (8pc)", description: "8 pieces of fried chicken with large fries and coleslaw", price: 8500, category: "Fast Food", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300", isAvailable: 1 },
  { id: 24, restaurantId: 7, name: "Chicken Wrap", description: "Grilled chicken wrap with fresh vegetables", price: 2800, category: "Fast Food", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300", isAvailable: 1 },
  { id: 25, restaurantId: 8, name: "Pepperoni Pizza (Large)", description: "Large pepperoni pizza with mozzarella cheese", price: 7500, category: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300", isAvailable: 1 },
  { id: 26, restaurantId: 8, name: "Chicken BBQ Pizza (Large)", description: "BBQ chicken pizza with onions, peppers, and cheese", price: 8200, category: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300", isAvailable: 1 },
  { id: 27, restaurantId: 8, name: "Margherita Pizza (Medium)", description: "Classic cheese and tomato pizza", price: 5500, category: "Pizza", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300", isAvailable: 1 },
];

const BANNERS = [
  { id: 1, title: "Weekend Special", subtitle: "Get 20% off all orders above ₦5,000 this weekend!", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", link: "/promos/weekend" },
  { id: 2, title: "New on Food Delivery", subtitle: "Mama Cass Kitchen is now available. Order authentic Nigerian dishes!", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", link: "/restaurants/1" },
  { id: 3, title: "Free Delivery", subtitle: "Free delivery on your first 3 orders. No minimum required!", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800", link: "/promos/free-delivery" },
];

const PROMOS = [
  { id: 1, code: "WELCOME20", description: "20% off your first order", discount: 20, expiresAt: "2027-12-31T23:59:59Z" },
  { id: 2, code: "FREEDELIVERY", description: "Free delivery on orders above ₦3,000", discount: 0, expiresAt: "2027-12-31T23:59:59Z" },
  { id: 3, code: "WEEKEND15", description: "15% off all orders every weekend", discount: 15, expiresAt: "2027-12-31T23:59:59Z" },
];

const REVIEWS = [
  { id: 1, userId: 1, restaurantId: 1, rating: 5, comment: "Best jollof rice in Lagos! Always fresh and delicious.", userName: "Demo User", createdAt: "2026-05-20T12:00:00Z" },
  { id: 2, userId: 2, restaurantId: 1, rating: 4, comment: "The egusi soup is amazing. Fair pricing too.", userName: "Sarah J.", createdAt: "2026-05-18T14:30:00Z" },
  { id: 3, userId: 3, restaurantId: 3, rating: 5, comment: "Chicken Capital never disappoints. Crunchy, juicy, perfect.", userName: "Mike O.", createdAt: "2026-05-15T10:00:00Z" },
  { id: 4, userId: 4, restaurantId: 2, rating: 4, comment: "Good food, fast delivery. The fried rice is top notch.", userName: "Chioma E.", createdAt: "2026-05-12T16:45:00Z" },
  { id: 5, userId: 5, restaurantId: 4, rating: 5, comment: "Yellow Chilli is fine dining at its best. The ofada rice is heavenly.", userName: "Tunde A.", createdAt: "2026-05-10T19:20:00Z" },
  { id: 6, userId: 6, restaurantId: 6, rating: 4, comment: "Beef shawarma is huge and tasty. Value for money.", userName: "Amara K.", createdAt: "2026-05-08T13:10:00Z" },
];

const VENDOR = {
  id: 1,
  name: "Mama Cass Kitchen",
  email: "vendor@cravings.com",
  phone: "08091234567",
  password: "password",
  restaurantId: 1,
};

export const FoodDeliveryWebController = () => {
  // ──── User API ────

  const UserLogin = (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM food_delivery_web_users WHERE email = ? AND password = ?")
        .get(email, password) as FoodDeliveryUser | undefined;

      if (!user) {
        return respondError(res, 401, "Invalid email or password");
      }

      return respond(res, "Login successful", {
        _id: user.id,
        fullname: user.name,
        email: user.email,
        phone: user.phone.startsWith("+") ? user.phone : "+234" + user.phone,
        country: "Nigeria",
        createdAt: user.createdAt || new Date().toISOString(),
        isVerified: !!(user.isVerified),
        userPermissions: { login: true },
        referralCode: "DEMO123",
        totalReferral: 0,
        balance: 0,
        totalPaymentReceived: 0,
        accessToken: DEMO_TOKEN,
        refreshToken: DEMO_REFRESH_TOKEN,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UserRegister = (req: Request, res: Response) => {
    try {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !phone || !password) {
        return respondError(res, 400, "All fields are required");
      }

      const existing = sqlite
        .prepare("SELECT id FROM food_delivery_web_users WHERE email = ?")
        .get(email) as FoodDeliveryUser | undefined;

      if (existing) {
        return respondError(res, 409, "Email already registered");
      }

      const result = sqlite
        .prepare(
          "INSERT INTO food_delivery_web_users (name, email, phone, password, otp, otpExpiresAt) VALUES (?, ?, ?, ?, ?, ?)",
        )
        .run(name, email, phone, password, generateOtp(), new Date(Date.now() + 600000).toISOString());

      return respond(res, "Registration successful. Please verify your OTP.", {
        userId: result.lastInsertRowid,
        emailSent: true,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VerifyOtp = (req: Request, res: Response) => {
    try {
      const { email, otp } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM food_delivery_web_users WHERE email = ? AND otp = ?")
        .get(email, otp) as FoodDeliveryUser | undefined;

      if (!user) {
        return respondError(res, 400, "Invalid OTP");
      }

      if (user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
        return respondError(res, 400, "OTP has expired");
      }

      sqlite
        .prepare("UPDATE food_delivery_web_users SET otp = NULL, otpExpiresAt = NULL WHERE id = ?")
        .run(user.id);

      return respond(res, "OTP verified successfully", {
        accessToken: DEMO_TOKEN,
        refreshToken: DEMO_REFRESH_TOKEN,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ResendOtp = (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM food_delivery_web_users WHERE email = ?")
        .get(email) as FoodDeliveryUser | undefined;

      if (!user) {
        return respondError(res, 404, "Email not found");
      }

      const otp = generateOtp();
      sqlite
        .prepare("UPDATE food_delivery_web_users SET otp = ?, otpExpiresAt = ? WHERE id = ?")
        .run(otp, new Date(Date.now() + 600000).toISOString(), user.id);

      return respond(res, "OTP resent successfully", { emailSent: true });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ForgotPassword = (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM food_delivery_web_users WHERE email = ?")
        .get(email) as FoodDeliveryUser | undefined;

      if (!user) {
        return respondError(res, 404, "Email not found");
      }

      const token = generateOtp();
      sqlite
        .prepare("UPDATE food_delivery_web_users SET resetToken = ? WHERE id = ?")
        .run(token, user.id);

      return respond(res, "Password reset link sent to your email", { resetToken: token, emailSent: true });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ResetPassword = (req: Request, res: Response) => {
    try {
      const { email, code, password } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM food_delivery_web_users WHERE email = ? AND resetToken = ?")
        .get(email, code) as FoodDeliveryUser | undefined;

      if (!user) {
        return respondError(res, 400, "Invalid or expired reset code");
      }

      sqlite
        .prepare("UPDATE food_delivery_web_users SET password = ?, resetToken = NULL WHERE id = ?")
        .run(password, user.id);

      return respond(res, "Password reset successful");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetProfile = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const user = sqlite
        .prepare("SELECT id, name, email, phone, createdAt FROM food_delivery_web_users WHERE id = ?")
        .get(userId) as Partial<FoodDeliveryUser> | undefined;

      if (!user) return respondError(res, 404, "User not found");

      return respond(res, "Profile retrieved", { user });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateProfile = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { name, phone } = req.body;

      if (name) {
        sqlite.prepare("UPDATE food_delivery_web_users SET name = ? WHERE id = ?").run(name, userId);
      }
      if (phone) {
        sqlite.prepare("UPDATE food_delivery_web_users SET phone = ? WHERE id = ?").run(phone, userId);
      }

      const user = sqlite
        .prepare("SELECT id, name, email, phone, createdAt FROM food_delivery_web_users WHERE id = ?")
        .get(userId) as Partial<FoodDeliveryUser>;

      return respond(res, "Profile updated", { user });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ChangePassword = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { currentPassword, newPassword } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM food_delivery_web_users WHERE id = ? AND password = ?")
        .get(userId, currentPassword) as FoodDeliveryUser | undefined;

      if (!user) {
        return respondError(res, 400, "Current password is incorrect");
      }

      sqlite.prepare("UPDATE food_delivery_web_users SET password = ? WHERE id = ?").run(newPassword, userId);

      return respond(res, "Password changed successfully");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const Logout = (_req: Request, res: Response) => {
    return respond(res, "Logged out successfully");
  };

  const SendCode = (req: Request, res: Response) => {
    try {
      return respond(res, "Verification code sent", { emailSent: true, code: "123456" });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VerifyCode = (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;
      return respond(res, "Verification successful", {
        accessToken: DEMO_TOKEN,
        refreshToken: DEMO_REFRESH_TOKEN,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const RefreshToken = (_req: Request, res: Response) => {
    try {
      return res.status(200).json({
        accessToken: DEMO_TOKEN,
        refreshToken: DEMO_REFRESH_TOKEN,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateUserProfile = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");
      const { name: rawName, fullname, phone } = req.body;
      const name = rawName || fullname;
      if (name) sqlite.prepare("UPDATE food_delivery_web_users SET name = ? WHERE id = ?").run(name, userId);
      if (phone) sqlite.prepare("UPDATE food_delivery_web_users SET phone = ? WHERE id = ?").run(phone, userId);
      const user = sqlite
        .prepare("SELECT id, name, email, phone, createdAt FROM food_delivery_web_users WHERE id = ?")
        .get(userId) as Partial<FoodDeliveryUser>;
      return respond(res, "Profile updated", { _id: user.id, fullname: user.name, email: user.email, phone: user.phone, createdAt: user.createdAt });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateUserPassword = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");
      const { currentPassword, newPassword } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM food_delivery_web_users WHERE id = ? AND password = ?")
        .get(userId, currentPassword) as FoodDeliveryUser | undefined;
      if (!user) return respondError(res, 400, "Current password is incorrect");
      sqlite.prepare("UPDATE food_delivery_web_users SET password = ? WHERE id = ?").run(newPassword, userId);
      return respond(res, "Password updated successfully");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetAddresses = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const addresses = sqlite
        .prepare("SELECT * FROM food_delivery_web_addresses WHERE userId = ?")
        .all(userId) as FoodDeliveryAddress[];

      return respond(res, "Addresses retrieved", { addresses });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateAddress = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { label, address, lat, lng } = req.body;

      if (!label || !address) {
        return respondError(res, 400, "Label and address are required");
      }

      const result = sqlite
        .prepare(
          "INSERT INTO food_delivery_web_addresses (userId, label, address, lat, lng) VALUES (?, ?, ?, ?, ?)",
        )
        .run(userId, label, address, lat || 0, lng || 0);

      return respond(res, "Address created", { id: result.lastInsertRowid });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateAddress = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { id } = req.params;
      const { label, address, lat, lng, isDefault } = req.body;

      const existing = sqlite
        .prepare("SELECT * FROM food_delivery_web_addresses WHERE id = ? AND userId = ?")
        .get(id, userId) as FoodDeliveryAddress | undefined;

      if (!existing) return respondError(res, 404, "Address not found");

      sqlite
        .prepare(
          "UPDATE food_delivery_web_addresses SET label = COALESCE(?, label), address = COALESCE(?, address), lat = COALESCE(?, lat), lng = COALESCE(?, lng), isDefault = COALESCE(?, isDefault) WHERE id = ?",
        )
        .run(label || null, address || null, lat ?? null, lng ?? null, isDefault ?? null, id);

      return respond(res, "Address updated");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteAddress = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { id } = req.params;

      const existing = sqlite
        .prepare("SELECT * FROM food_delivery_web_addresses WHERE id = ? AND userId = ?")
        .get(id, userId) as FoodDeliveryAddress | undefined;

      if (!existing) return respondError(res, 404, "Address not found");

      sqlite.prepare("DELETE FROM food_delivery_web_addresses WHERE id = ?").run(id);

      return respond(res, "Address deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ──── Main API ────

  const GetRestaurants = (req: Request, res: Response) => {
    try {
      const { _id, category } = req.query;
      let results = [...RESTAURANTS];

      if (_id) {
        results = results.filter((r) => r.id === Number(_id));
      }

      if (category) {
        const cat = String(category).toLowerCase();
        results = results.filter((r) => r.categories.toLowerCase().includes(cat));
      }

      return respond(res, "Restaurants retrieved", {
        results: results.map(toRestaurantShape),
        count: results.length,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetRestaurant = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const restaurant = RESTAURANTS.find((r) => r.id === Number(id));

      if (!restaurant) return respondError(res, 404, "Restaurant not found");

      const restaurantReviews = REVIEWS.filter((r) => r.restaurantId === Number(id));

      return respond(res, "Restaurant retrieved", {
        results: [{ ...toRestaurantShape(restaurant), reviews: restaurantReviews, reviewCount: restaurantReviews.length }],
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetRestaurantMenu = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const restaurant = RESTAURANTS.find((r) => r.id === Number(id));

      if (!restaurant) return respondError(res, 404, "Restaurant not found");

      const menu = FOODS.filter((f) => f.restaurantId === Number(id) && f.isAvailable);

      return respond(res, "Menu retrieved", { results: menu });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetCategories = (_req: Request, res: Response) => {
    try {
      return respond(res, "Categories retrieved", { results: CATEGORIES.map(toCategoryShape) });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetFoods = (req: Request, res: Response) => {
    try {
      const { category, restaurantId } = req.query;
      let results = FOODS.filter((f) => f.isAvailable);

      if (category) {
        const cat = String(category).toLowerCase();
        results = results.filter((f) => f.category.toLowerCase() === cat);
      }
      if (restaurantId) {
        results = results.filter((f) => f.restaurantId === Number(restaurantId));
      }

      return respond(res, "Foods retrieved", { results, count: results.length });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetFood = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const food = FOODS.find((f) => f.id === Number(id));

      if (!food) return respondError(res, 404, "Food not found");

      const restaurant = RESTAURANTS.find((r) => r.id === food.restaurantId);

      return respond(res, "Food retrieved", {
        results: [{ ...toProductShape(food), restaurant }],
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const Search = (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q) return respondError(res, 400, "Search query is required");

      const query = String(q).toLowerCase();

      const matchedRestaurants = RESTAURANTS.filter(
        (r) => r.name.toLowerCase().includes(query) || r.description.toLowerCase().includes(query),
      ).map(toRestaurantShape);

      const matchedFoods = FOODS.filter(
        (f) => f.name.toLowerCase().includes(query) || f.description.toLowerCase().includes(query),
      ).map((f) => ({
        ...f,
        restaurantName: RESTAURANTS.find((r) => r.id === f.restaurantId)?.name,
      }));

      return respond(res, "Search results", {
        results: { restaurants: matchedRestaurants, foods: matchedFoods },
        count: matchedRestaurants.length + matchedFoods.length,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetOrders = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const orders = sqlite
        .prepare("SELECT * FROM food_delivery_web_orders WHERE userId = ? ORDER BY createdAt DESC")
        .all(userId) as FoodDeliveryOrder[];

      const ordersWithItems = orders.map((order) => {
        const items = sqlite
          .prepare("SELECT * FROM food_delivery_web_order_items WHERE orderId = ?")
          .all(order.id) as FoodDeliveryOrderItem[];
        return { ...order, items };
      });

      return respond(res, "Orders retrieved", { results: ordersWithItems, count: ordersWithItems.length });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateOrder = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

      if (!restaurantId || !items || !items.length) {
        return respondError(res, 400, "Restaurant and items are required");
      }

      const restaurant = RESTAURANTS.find((r) => r.id === Number(restaurantId));
      if (!restaurant) return respondError(res, 404, "Restaurant not found");

      const total = items.reduce(
        (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
        0,
      );

      const result = sqlite
        .prepare(
          "INSERT INTO food_delivery_web_orders (userId, restaurantId, restaurantName, status, total, deliveryAddress, paymentMethod) VALUES (?, ?, ?, 'pending', ?, ?, ?)",
        )
        .run(userId, restaurantId, restaurant.name, total, deliveryAddress || "N/A", paymentMethod || "paystack");

      const orderId = result.lastInsertRowid;

      const insertItem = sqlite.prepare(
        "INSERT INTO food_delivery_web_order_items (orderId, foodId, name, price, quantity) VALUES (?, ?, ?, ?, ?)",
      );

      for (const item of items) {
        insertItem.run(orderId, item.foodId, item.name, item.price, item.quantity);
      }

      sqlite.prepare(
        "INSERT INTO food_delivery_web_events (type, description) VALUES (?, ?)",
      ).run("order_created", `Order #${orderId} created for ${restaurant.name}`);

      return respond(res, "Order created", { orderId });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetOrder = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { id } = req.params;
      const order = sqlite
        .prepare("SELECT * FROM food_delivery_web_orders WHERE id = ? AND userId = ?")
        .get(id, userId) as FoodDeliveryOrder | undefined;

      if (!order) return respondError(res, 404, "Order not found");

      const items = sqlite
        .prepare("SELECT * FROM food_delivery_web_order_items WHERE orderId = ?")
        .all(order.id) as FoodDeliveryOrderItem[];

      return respond(res, "Order retrieved", { results: [{ ...order, items }] });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const AddToCart = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { foodId, quantity } = req.body;

      const food = FOODS.find((f) => f.id === Number(foodId));
      if (!food) return respondError(res, 404, "Food not found");

      const restaurant = RESTAURANTS.find((r) => r.id === food.restaurantId);

      const existing = sqlite
        .prepare("SELECT * FROM food_delivery_web_cart_items WHERE userId = ? AND foodId = ?")
        .get(userId, foodId) as FoodDeliveryCartItem | undefined;

      if (existing) {
        sqlite
          .prepare("UPDATE food_delivery_web_cart_items SET quantity = ? WHERE id = ?")
          .run((existing.quantity || 1) + (quantity || 1), existing.id);
      } else {
        sqlite
          .prepare(
            "INSERT INTO food_delivery_web_cart_items (userId, foodId, name, price, quantity, restaurantId, restaurantName, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          )
          .run(userId, foodId, food.name, food.price, quantity || 1, food.restaurantId, restaurant?.name || "", food.image || "");
      }

      return respond(res, "Item added to cart");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetCart = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const items = sqlite
        .prepare("SELECT * FROM food_delivery_web_cart_items WHERE userId = ?")
        .all(userId) as FoodDeliveryCartItem[];

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      return respond(res, "Cart retrieved", { results: items, total, count: items.length });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UpdateCartItem = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { id } = req.params;
      const { quantity } = req.body;

      const existing = sqlite
        .prepare("SELECT * FROM food_delivery_web_cart_items WHERE id = ? AND userId = ?")
        .get(id, userId) as FoodDeliveryCartItem | undefined;

      if (!existing) return respondError(res, 404, "Cart item not found");

      sqlite.prepare("UPDATE food_delivery_web_cart_items SET quantity = ? WHERE id = ?").run(quantity, id);

      return respond(res, "Cart item updated");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteCartItem = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { id } = req.params;

      const existing = sqlite
        .prepare("SELECT * FROM food_delivery_web_cart_items WHERE id = ? AND userId = ?")
        .get(id, userId) as FoodDeliveryCartItem | undefined;

      if (!existing) return respondError(res, 404, "Cart item not found");

      sqlite.prepare("DELETE FROM food_delivery_web_cart_items WHERE id = ?").run(id);

      return respond(res, "Cart item removed");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const Checkout = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const items = sqlite
        .prepare("SELECT * FROM food_delivery_web_cart_items WHERE userId = ?")
        .all(userId) as FoodDeliveryCartItem[];

      if (!items.length) return respondError(res, 400, "Cart is empty");

      const { deliveryAddress, paymentMethod } = req.body;

      const restaurantId = items[0].restaurantId;
      const restaurantName = items[0].restaurantName;
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const result = sqlite
        .prepare(
          "INSERT INTO food_delivery_web_orders (userId, restaurantId, restaurantName, status, total, deliveryAddress, paymentMethod) VALUES (?, ?, ?, 'pending', ?, ?, ?)",
        )
        .run(userId, restaurantId, restaurantName, total, deliveryAddress || "N/A", paymentMethod || "paystack");

      const orderId = result.lastInsertRowid;

      const insertItem = sqlite.prepare(
        "INSERT INTO food_delivery_web_order_items (orderId, foodId, name, price, quantity) VALUES (?, ?, ?, ?, ?)",
      );

      for (const item of items) {
        insertItem.run(orderId, item.foodId, item.name, item.price, item.quantity);
      }

      sqlite.prepare("DELETE FROM food_delivery_web_cart_items WHERE userId = ?").run(userId);

      sqlite.prepare(
        "INSERT INTO food_delivery_web_events (type, description) VALUES (?, ?)",
      ).run("checkout", `Order #${orderId} checked out — ₦${total}`);

      return respond(res, "Checkout successful", { orderId, total });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const PaystackInitialize = (req: Request, res: Response) => {
    try {
      const { email, amount } = req.body;
      const reference = `demo-ref-${Date.now()}`;

      return respond(res, "Payment initialized", {
        authorization_url: `https://paystack.com/demo/ref_${reference}`,
        reference,
        access_code: `demo-access-${Date.now()}`,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const PaystackVerify = (req: Request, res: Response) => {
    try {
      const { reference } = req.query;

      return respond(res, "Payment verified", {
        reference: reference || "demo-ref-unknown",
        status: "success",
        amount: 500000,
        currency: "NGN",
        paidAt: new Date().toISOString(),
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateReview = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");

      const { restaurantId, rating, comment } = req.body;

      if (!restaurantId || !rating || !comment) {
        return respondError(res, 400, "Restaurant, rating, and comment are required");
      }

      const restaurant = RESTAURANTS.find((r) => r.id === Number(restaurantId));
      if (!restaurant) return respondError(res, 404, "Restaurant not found");

      const user = sqlite
        .prepare("SELECT name FROM food_delivery_web_users WHERE id = ?")
        .get(userId) as { name: string } | undefined;

      sqlite.prepare(
        "INSERT INTO food_delivery_web_events (type, description) VALUES (?, ?)",
      ).run("review_created", `Review left for ${restaurant.name}: ${rating}/5`);

      return respond(res, "Review created", {
        id: REVIEWS.length + 1,
        userId,
        restaurantId: Number(restaurantId),
        rating: Number(rating),
        comment,
        userName: user?.name || "Anonymous",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetReviews = (req: Request, res: Response) => {
    try {
      const { restaurantId } = req.query;
      let results = [...REVIEWS];

      if (restaurantId) {
        results = results.filter((r) => r.restaurantId === Number(restaurantId));
      }

      return respond(res, "Reviews retrieved", { results, count: results.length });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetBanners = (_req: Request, res: Response) => {
    try {
      return respond(res, "Banners retrieved", { banners: BANNERS });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetPromos = (_req: Request, res: Response) => {
    try {
      return respond(res, "Promos retrieved", { promos: PROMOS });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ──── New Main API routes ────

  const GetRestaurantCategories = (_req: Request, res: Response) => {
    try {
      return respond(res, "Categories retrieved", { results: CATEGORIES.map(toCategoryShape) });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetGeneralData = (_req: Request, res: Response) => {
    try {
      return respond(res, "General data retrieved", {
        restaurants: RESTAURANTS.map(toRestaurantShape),
        categories: CATEGORIES.map(toCategoryShape),
        banners: BANNERS,
        promos: PROMOS,
        deliveryFee: 500,
        business_hours: [
          { day: "Monday", open_time: "08:00", close_time: "22:00" },
          { day: "Tuesday", open_time: "08:00", close_time: "22:00" },
          { day: "Wednesday", open_time: "08:00", close_time: "22:00" },
          { day: "Thursday", open_time: "08:00", close_time: "22:00" },
          { day: "Friday", open_time: "08:00", close_time: "23:00" },
          { day: "Saturday", open_time: "09:00", close_time: "23:00" },
          { day: "Sunday", open_time: "10:00", close_time: "21:00" },
        ],
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetVendorProducts = (req: Request, res: Response) => {
    try {
      const { restaurant, vendorId, page, limit } = req.query;
      let products = FOODS.filter((f) => f.isAvailable);
      const resId = Number(restaurant || vendorId);
      if (resId) {
        products = products.filter((f) => f.restaurantId === resId);
      }
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      const paged = products.slice(offset, offset + limitNum);
      return respond(res, "Products retrieved", {
        results: paged.map(toProductShape),
        count: products.length,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetVendorProductById = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = FOODS.find((f) => f.id === Number(id));
      if (!product) return respondError(res, 404, "Product not found");
      return res.status(200).json({
        status: "success",
        message: "Product retrieved",
        data: toProductShape(product),
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetUserAddresses = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");
      const rows = sqlite
        .prepare("SELECT * FROM food_delivery_web_addresses WHERE userId = ?")
        .all(userId) as FoodDeliveryAddress[];
      const addresses = rows.map((a) => ({
        _id: a.id,
        id: a.id,
        userId: a.userId,
        tag: a.label,
        address: a.address,
        location: { coordinates: [a.lng, a.lat], type: "Point" },
        isDefault: !!a.isDefault,
      }));
      return respond(res, "Addresses retrieved", addresses);
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateUserAddress = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");
      const { location, address, tag } = req.body;
      let lat = 0, lng = 0;
      if (location && typeof location === "string") {
        const parts = location.split(",");
        lng = parseFloat(parts[0]) || 0;
        lat = parseFloat(parts[1]) || 0;
      }
      const label = tag || "Home";
      if (!address) return respondError(res, 400, "Address is required");
      const result = sqlite
        .prepare("INSERT INTO food_delivery_web_addresses (userId, label, address, lat, lng) VALUES (?, ?, ?, ?, ?)")
        .run(userId, label, address, lat, lng);
      return respond(res, "Address created", {
        _id: result.lastInsertRowid,
        id: result.lastInsertRowid,
        userId,
        tag: label,
        address,
        location: { coordinates: [lng, lat], type: "Point" },
        isDefault: false,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const DeleteUserAddress = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");
      const { id } = req.params;
      const existing = sqlite
        .prepare("SELECT * FROM food_delivery_web_addresses WHERE id = ? AND userId = ?")
        .get(id, userId) as FoodDeliveryAddress | undefined;
      if (!existing) return respondError(res, 404, "Address not found");
      sqlite.prepare("DELETE FROM food_delivery_web_addresses WHERE id = ?").run(id);
      return respond(res, "Address deleted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const CreateUserOrder = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");
      const { deliveryAddress, deliveryAddressLatitude, deliveryAddressLongitude, paymentMethod, products, immediateDelivery } = req.body;
      if (!products || !products.length) return respondError(res, 400, "Products are required");
      const firstProduct = FOODS.find((f) => f.id === Number(products[0].product));
      const restaurantId = firstProduct?.restaurantId || 1;
      const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);
      const items = products.map((p: { product: number; quantity: number }) => {
        const food = FOODS.find((f) => f.id === Number(p.product));
        return { foodId: Number(p.product), name: food?.name || "Unknown Item", price: food?.price || 0, quantity: p.quantity || 1 };
      });
      const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
      const result = sqlite
        .prepare("INSERT INTO food_delivery_web_orders (userId, restaurantId, restaurantName, status, total, deliveryAddress, paymentMethod) VALUES (?, ?, ?, 'pending', ?, ?, ?)")
        .run(userId, restaurantId, restaurant?.name || "Restaurant", total, deliveryAddress || "N/A", paymentMethod || "paystack");
      const orderId = result.lastInsertRowid;
      const insertItem = sqlite.prepare("INSERT INTO food_delivery_web_order_items (orderId, foodId, name, price, quantity) VALUES (?, ?, ?, ?, ?)");
      for (const item of items) {
        insertItem.run(orderId, item.foodId, item.name, item.price, item.quantity);
      }
      return respond(res, "Order created", { _id: orderId, orderId });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetUserOrders = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");
      const { page, limit } = req.query;
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      const orders = sqlite
        .prepare("SELECT * FROM food_delivery_web_orders WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?")
        .all(userId, limitNum, offset) as FoodDeliveryOrder[];
      const total = sqlite
        .prepare("SELECT COUNT(*) as count FROM food_delivery_web_orders WHERE userId = ?")
        .get(userId) as { count: number };
      const ordersWithItems = orders.map((order) => {
        const items = sqlite
          .prepare("SELECT * FROM food_delivery_web_order_items WHERE orderId = ?")
          .all(order.id) as FoodDeliveryOrderItem[];
        return { _id: order.id, ...order, items, id: order.id };
      });
      return respond(res, "Orders retrieved", {
        results: ordersWithItems,
        count: total.count,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetUserOrder = (req: Request, res: Response) => {
    try {
      const userId = getUserIdFromRequest(req);
      if (!userId) return respondError(res, 401, "Unauthorized");
      const { id } = req.params;
      const order = sqlite
        .prepare("SELECT * FROM food_delivery_web_orders WHERE id = ? AND userId = ?")
        .get(id, userId) as FoodDeliveryOrder | undefined;
      if (!order) return respondError(res, 404, "Order not found");
      const items = sqlite
        .prepare("SELECT * FROM food_delivery_web_order_items WHERE orderId = ?")
        .all(order.id) as FoodDeliveryOrderItem[];
      return respond(res, "Order retrieved", { order: { ...order, items } });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ValidateCoupon = (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const promo = PROMOS.find((p) => p.code === code);
      if (!promo) return respondError(res, 400, "Invalid coupon code");
      return respond(res, "Coupon is valid", { valid: true, promo });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetPromotions = (_req: Request, res: Response) => {
    try {
      return respond(res, "Promotions retrieved", { results: PROMOS });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetAvailabilities = (_req: Request, res: Response) => {
    try {
      return respond(res, "Availabilities retrieved", {
        business_hours: [
          { day: "Monday", open_time: "08:00", close_time: "22:00" },
          { day: "Tuesday", open_time: "08:00", close_time: "22:00" },
          { day: "Wednesday", open_time: "08:00", close_time: "22:00" },
          { day: "Thursday", open_time: "08:00", close_time: "22:00" },
          { day: "Friday", open_time: "08:00", close_time: "23:00" },
          { day: "Saturday", open_time: "09:00", close_time: "23:00" },
          { day: "Sunday", open_time: "10:00", close_time: "21:00" },
        ],
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetSavedCards = (_req: Request, res: Response) => {
    try {
      return respond(res, "Saved cards retrieved", { cards: [] });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const PayWithCard = (req: Request, res: Response) => {
    try {
      const reference = "demo-pay-ref-" + Date.now();
      return respond(res, "Payment successful", {
        reference,
        status: "success",
        amount: req.body.amount || 0,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const InitializeTransaction = (req: Request, res: Response) => {
    try {
      const reference = "demo-trx-ref-" + Date.now();
      return respond(res, "Transaction initialized", {
        reference,
        authorization_url: "https://paystack.com/demo/init_" + reference,
        access_code: "demo-access-" + Date.now(),
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VerifyTransaction = (req: Request, res: Response) => {
    try {
      const { reference } = req.query;
      return respond(res, "Transaction verified", {
        reference: reference || "demo-ref-unknown",
        status: "success",
        amount: 500000,
        currency: "NGN",
        paidAt: new Date().toISOString(),
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const TrackAnalyticsView = (_req: Request, res: Response) => {
    try {
      return respond(res, "View tracked");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const GetFavourites = (_req: Request, res: Response) => {
    try {
      return respond(res, "Favourites retrieved", { favourites: [] });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const ToggleFavourite = (req: Request, res: Response) => {
    try {
      return respond(res, "Favourite toggled", { isFavourite: true });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const RateRestaurant = (req: Request, res: Response) => {
    try {
      return respond(res, "Rating submitted", { rating: req.body.rating || 5 });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VerifyCoupon = (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      const promo = PROMOS.find((p) => p.code === code);
      if (!promo) return respondError(res, 400, "Invalid coupon code");
      return respond(res, "Coupon is valid", { valid: true, promo });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UntoggleFavourite = (_req: Request, res: Response) => {
    try {
      return respond(res, "Favourite removed", { isFavourite: false });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const NotifyEmail = (_req: Request, res: Response) => {
    try {
      return respond(res, "Email sent", { emailSent: true });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ──── Vendor API ────

  const VendorLogin = (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (email === VENDOR.email && password === VENDOR.password) {
        return respond(res, "Vendor login successful", {
          accessToken: DEMO_TOKEN,
          refreshToken: DEMO_REFRESH_TOKEN,
          vendor: {
            id: VENDOR.id,
            name: VENDOR.name,
            email: VENDOR.email,
            phone: VENDOR.phone,
            restaurantId: VENDOR.restaurantId,
          },
        });
      }

      return respondError(res, 401, "Invalid vendor credentials");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VendorDashboard = (req: Request, res: Response) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) return respondError(res, 401, "Unauthorized");

      const restaurant = RESTAURANTS.find((r) => r.id === VENDOR.restaurantId);

      const totalOrders = sqlite
        .prepare("SELECT COUNT(*) as count FROM food_delivery_web_orders WHERE restaurantId = ?")
        .get(VENDOR.restaurantId) as { count: number };

      const pendingOrders = sqlite
        .prepare("SELECT COUNT(*) as count FROM food_delivery_web_orders WHERE restaurantId = ? AND status = 'pending'")
        .get(VENDOR.restaurantId) as { count: number };

      const revenue = sqlite
        .prepare("SELECT COALESCE(SUM(total), 0) as total FROM food_delivery_web_orders WHERE restaurantId = ? AND status IN ('delivered','preparing')")
        .get(VENDOR.restaurantId) as { total: number };

      return respond(res, "Dashboard data", {
        restaurant,
        stats: {
          totalOrders: totalOrders.count,
          pendingOrders: pendingOrders.count,
          revenue: revenue.total,
          rating: restaurant?.rating || 0,
        },
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VendorOrders = (req: Request, res: Response) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) return respondError(res, 401, "Unauthorized");

      const { status } = req.query;
      let query = "SELECT * FROM food_delivery_web_orders WHERE restaurantId = ?";
      const params: (string | number)[] = [VENDOR.restaurantId];

      if (status) {
        query += " AND status = ?";
        params.push(String(status));
      }

      query += " ORDER BY createdAt DESC";

      const orders = sqlite.prepare(query).all(...params) as FoodDeliveryOrder[];

      const ordersWithItems = orders.map((order) => {
        const items = sqlite
          .prepare("SELECT * FROM food_delivery_web_order_items WHERE orderId = ?")
          .all(order.id) as FoodDeliveryOrderItem[];
        return { ...order, items };
      });

      return respond(res, "Vendor orders retrieved", { orders: ordersWithItems });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VendorUpdateOrder = (req: Request, res: Response) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) return respondError(res, 401, "Unauthorized");

      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return respondError(res, 400, "Invalid status");
      }

      const order = sqlite
        .prepare("SELECT * FROM food_delivery_web_orders WHERE id = ? AND restaurantId = ?")
        .get(id, VENDOR.restaurantId) as FoodDeliveryOrder | undefined;

      if (!order) return respondError(res, 404, "Order not found");

      sqlite.prepare("UPDATE food_delivery_web_orders SET status = ? WHERE id = ?").run(status, id);

      sqlite.prepare(
        "INSERT INTO food_delivery_web_events (type, description) VALUES (?, ?)",
      ).run("order_status_changed", `Order #${id} status changed to ${status}`);

      return respond(res, "Order status updated");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VendorProducts = (_req: Request, res: Response) => {
    try {
      const products = FOODS.filter((f) => f.restaurantId === VENDOR.restaurantId);

      return respond(res, "Products retrieved", { products });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VendorCreateProduct = (req: Request, res: Response) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) return respondError(res, 401, "Unauthorized");

      const { name, description, price, category, image } = req.body;

      if (!name || !price) {
        return respondError(res, 400, "Name and price are required");
      }

      const newId = FOODS.length + 1;
      FOODS.push({
        id: newId,
        restaurantId: VENDOR.restaurantId,
        name,
        description: description || "",
        price: Number(price),
        category: category || "General",
        image: image || "",
        isAvailable: 1,
      });

      sqlite.prepare(
        "INSERT INTO food_delivery_web_events (type, description) VALUES (?, ?)",
      ).run("product_created", `Product "${name}" added to menu`);

      return respond(res, "Product created", { id: newId });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VendorUpdateProduct = (req: Request, res: Response) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) return respondError(res, 401, "Unauthorized");

      const { id } = req.params;
      const foodIndex = FOODS.findIndex((f) => f.id === Number(id) && f.restaurantId === VENDOR.restaurantId);

      if (foodIndex === -1) return respondError(res, 404, "Product not found");

      const { name, description, price, category, image, isAvailable } = req.body;

      if (name !== undefined) FOODS[foodIndex].name = name;
      if (description !== undefined) FOODS[foodIndex].description = description;
      if (price !== undefined) FOODS[foodIndex].price = Number(price);
      if (category !== undefined) FOODS[foodIndex].category = category;
      if (image !== undefined) FOODS[foodIndex].image = image;
      if (isAvailable !== undefined) FOODS[foodIndex].isAvailable = Number(isAvailable);

      return respond(res, "Product updated", { product: FOODS[foodIndex] });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const VendorRegister = (req: Request, res: Response) => {
    try {
      const { name, email, phone, password } = req.body;
      if (!name || !email || !phone || !password) {
        return respondError(res, 400, "All fields are required");
      }
      sqlite.prepare(
        "INSERT INTO food_delivery_web_events (type, description) VALUES (?, ?)"
      ).run("vendor_registered", "Vendor registered: " + name);
      return respond(res, "Vendor registration successful", {
        id: 2,
        name,
        email,
        phone,
        accessToken: DEMO_TOKEN,
        refreshToken: DEMO_REFRESH_TOKEN,
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  // ──── Admin API ────

  const AdminHealth = (_req: Request, res: Response) => {
    try {
      return respond(res, "Food Delivery Web Admin API is running", {
        version: "1.0.0",
        environment: "demo",
        note: "Admin functionality is handled by the separate cravings-admin module",
      });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const AdminFeedback = (_req: Request, res: Response) => {
    try {
      return respond(res, "Feedback submitted");
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SubmitVendorInfo = (_req: Request, res: Response) => {
    try {
      return respond(res, "Vendor info submitted", { id: Date.now() });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const SubmitLogisticsInfo = (_req: Request, res: Response) => {
    try {
      return respond(res, "Logistics info submitted", { id: Date.now() });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UploadSignedAgreement = (_req: Request, res: Response) => {
    try {
      return respond(res, "Signed agreement uploaded", { url: "/uploads/agreement-demo.pdf" });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  const UploadLogisticsAgreement = (_req: Request, res: Response) => {
    try {
      return respond(res, "Logistics agreement uploaded", { url: "/uploads/logistics-agreement-demo.pdf" });
    } catch (error) {
      return respondCatch(res, error);
    }
  };

  return {
    UserLogin,
    UserRegister,
    VerifyOtp,
    ResendOtp,
    ForgotPassword,
    ResetPassword,
    GetProfile,
    UpdateProfile,
    ChangePassword,
    Logout,
    SendCode,
    VerifyCode,
    RefreshToken,
    UpdateUserProfile,
    UpdateUserPassword,
    GetAddresses,
    CreateAddress,
    UpdateAddress,
    DeleteAddress,
    GetRestaurants,
    GetRestaurant,
    GetRestaurantMenu,
    GetCategories,
    GetFoods,
    GetFood,
    Search,
    GetOrders,
    CreateOrder,
    GetOrder,
    AddToCart,
    GetCart,
    UpdateCartItem,
    DeleteCartItem,
    Checkout,
    PaystackInitialize,
    PaystackVerify,
    CreateReview,
    GetReviews,
    GetBanners,
    GetPromos,
    GetRestaurantCategories,
    GetGeneralData,
    GetVendorProducts,
    GetVendorProductById,
    GetUserAddresses,
    CreateUserAddress,
    DeleteUserAddress,
    CreateUserOrder,
    GetUserOrders,
    GetUserOrder,
    ValidateCoupon,
    GetPromotions,
    GetAvailabilities,
    GetSavedCards,
    PayWithCard,
    InitializeTransaction,
    VerifyTransaction,
    TrackAnalyticsView,
    GetFavourites,
    ToggleFavourite,
    RateRestaurant,
    VerifyCoupon,
    UntoggleFavourite,
    NotifyEmail,
    VendorLogin,
    VendorDashboard,
    VendorOrders,
    VendorUpdateOrder,
    VendorProducts,
    VendorCreateProduct,
    VendorUpdateProduct,
    VendorRegister,
    AdminHealth,
    AdminFeedback,
    SubmitVendorInfo,
    SubmitLogisticsInfo,
    UploadSignedAgreement,
    UploadLogisticsAgreement,
  };
};
