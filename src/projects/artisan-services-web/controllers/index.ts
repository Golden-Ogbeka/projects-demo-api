import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendListFeedback,
  sendSuccessFeedback,
} from "../../../functions/feedback.js";
import { generateOtp } from "../../../functions/otp.js";
import { ArtisanServicesWebUser } from "../types/index.js";

// ---------------------------------------------------------------------------
// Helper: token ? user id
// ---------------------------------------------------------------------------
const getTokenUserId = (req: Request): string | null => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.split(" ")[1];
  if (token === "demo-artisan-services-web-token") return "1";
  if (token.startsWith("demo-artisan-services-web-token-")) {
    const id = token.replace("demo-artisan-services-web-token-", "");
    if (id) return id;
  }
  return null;
};

// ---------------------------------------------------------------------------
// Fixture data helpers
// ---------------------------------------------------------------------------
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const daysLater = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const names = {
  first: [
    "John", "Jane", "Bob", "Alice", "Charlie", "Diana",
    "Frank", "Grace", "Henry", "Ivy", "Jack", "Karen",
    "Leo", "Maria", "Nathan", "Olivia", "Paul", "Quinn",
    "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy",
    "Xander", "Yara", "Zane", "Ava", "Ben", "Chloe",
  ],
  last: [
    "Doe", "Smith", "Johnson", "Williams", "Brown", "Jones",
    "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson",
    "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez",
    "Clark", "Ramirez",
  ],
};

const categories = [
  { _id: "cat-1", name: "Plumbing", description: "Pipe repairs, installations, water heater services", image: "https://picsum.photos/seed/plumbing/400/300", services: ["Pipe repair", "Water heater", "Drain cleaning"] },
  { _id: "cat-2", name: "Electrical", description: "Wiring, repairs, installations, solar systems", image: "https://picsum.photos/seed/electrical/400/300", services: ["Wiring", "Repairs", "Solar installation"] },
  { _id: "cat-3", name: "Carpentry", description: "Furniture, cabinets, woodwork, installations", image: "https://picsum.photos/seed/carpentry/400/300", services: ["Furniture", "Cabinets", "Woodwork"] },
  { _id: "cat-4", name: "Cleaning", description: "Home, office, deep cleaning, fumigation", image: "https://picsum.photos/seed/cleaning/400/300", services: ["Home cleaning", "Office cleaning", "Fumigation"] },
  { _id: "cat-5", name: "Painting", description: "Interior and exterior painting, decorations", image: "https://picsum.photos/seed/painting/400/300", services: ["Interior painting", "Exterior painting", "Decor"] },
  { _id: "cat-6", name: "AC & Refrigeration", description: "AC installation, repairs, fridge maintenance", image: "https://picsum.photos/seed/ac/400/300", services: ["AC installation", "AC repair", "Fridge maintenance"] },
  { _id: "cat-7", name: "Tiling & Flooring", description: "Floor and wall tiling, marble installation", image: "https://picsum.photos/seed/tiling/400/300", services: ["Floor tiling", "Wall tiling", "Marble installation"] },
  { _id: "cat-8", name: "POP & Ceiling", description: "POP ceiling design, installation, repairs", image: "https://picsum.photos/seed/ceiling/400/300", services: ["POP design", "Ceiling installation", "Ceiling repair"] },
  { _id: "cat-9", name: "Mechanical", description: "Generator repairs, mechanical installations", image: "https://picsum.photos/seed/mechanical/400/300", services: ["Generator repair", "Mechanical installation"] },
  { _id: "cat-10", name: "Landscaping", description: "Garden design, lawn maintenance, hedge trimming", image: "https://picsum.photos/seed/landscaping/400/300", services: ["Garden design", "Lawn maintenance", "Hedge trimming"] },
];

const locations = [
  "Ikeja, Lagos", "Victoria Island, Lagos", "Lekki Phase 1, Lagos",
  "Surulere, Lagos", "GRA, Port Harcourt", "Maitama, Abuja",
  "Wuse 2, Abuja", "Garki, Abuja", "Bodija, Ibadan",
  "Enugu, Enugu State", "Asaba, Delta State", "Calabar, Cross River",
];

const streets = [
  "15 Adeola Odeku", "22 Awolowo Road", "7 Bishop Aboyade Cole",
  "31 Toyin Street", "4 Idejo Street", "12 Admiralty Way",
  "8 Ahmadu Bello Way", "19 Constitution Avenue",
];
// ---------------------------------------------------------------------------
// Generate fixture artisans
// ---------------------------------------------------------------------------
const generateArtisans = () => {
  const artisans: any[] = [];
  for (let i = 1; i <= 36; i++) {
    const cat = categories[Math.floor((i - 1) / 3.6) % categories.length];
    const fn = pick(names.first);
    const ln = pick(names.last);
    artisans.push({
      _id: `artisan-${i}`,
      firstname: fn,
      lastname: ln,
      fullname: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`,
      phone: `080${String(10000000 + i).slice(0, 8)}`,
      companyName: `${fn}'s ${cat.name} Services`,
      companyAddress: `${pick(streets)}, ${pick(locations)}`,
      photoUrl: `https://i.pravatar.cc/150?u=artisan${i}`,
      heroImage: [`https://picsum.photos/seed/hero${i}/800/600`],
      category: { _id: cat._id, name: cat.name, services: cat.services, image: cat.image, createdAt: "2023-01-01T00:00:00.000Z", createdBy: "admin" },
      services: cat.services,
      rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      jobsCompleted: Math.floor(10 + Math.random() * 200),
      jobsCancelled: Math.floor(Math.random() * 10),
      yearsOfExperience: Math.floor(1 + Math.random() * 15),
      about: `Professional ${cat.name.toLowerCase()} specialist.`,
      available: Math.random() > 0.2,
      ratePerHr: Math.floor(2000 + Math.random() * 15000),
      rateCurrency: "NGN",
      verified: Math.random() > 0.3,
      isActive: true,
      isVerified: true,
      deactivated: false,
      favourited: Math.floor(Math.random() * 50),
      views: Math.floor(100 + Math.random() * 1000),
      gender: Math.random() > 0.5 ? "male" : "female",
      homeAddress: `${pick(streets)}, ${pick(locations)}`,
      city: pick(locations).split(",")[0],
      state: pick(locations).split(", ")[1] || "Lagos",
      country: "Nigeria",
      location: { type: "Point", coordinates: [3.4 + Math.random() * 0.2, 6.4 + Math.random() * 0.2] },
      isApproved: true,
      minNoticeHrs: 2,
      ntfToken: "demo-ntf-token",
      lastActiveAt: daysAgo(Math.floor(Math.random() * 7)),
      lastVisitedAt: daysAgo(Math.floor(Math.random() * 7)),
      description: `Professional ${cat.name.toLowerCase()} specialist with years of experience in ${cat.description.toLowerCase()}.`,
      optionalPhone: `080${String(20000000 + i).slice(0, 8)}`,
      role: "artisan",
      userPermissions: { login: true },
    });
  }
  return artisans;
};

const artisans = generateArtisans();

// ---------------------------------------------------------------------------
// Generate fixture bookings
// ---------------------------------------------------------------------------
const bookingStatuses: Array<"pending" | "accepted" | "started" | "completed" | "cancelled"> = [
  "pending", "accepted", "started", "completed", "cancelled",
];
const bookingTypes: Array<"instant" | "scheduled"> = ["instant", "scheduled"];

const generateBookings = () => {
  const bookings: any[] = [];
  for (let i = 1; i <= 20; i++) {
    const artisan = pick(artisans);
    const fn = pick(names.first);
    const ln = pick(names.last);
    const status = bookingStatuses[i % 5];
    bookings.push({
      _id: `booking-${i}`,
      userId: { _id: "user-1", firstname: "Demo", photoUrl: "https://i.pravatar.cc/150?u=demouser" },
      artisan: { _id: artisan._id, companyName: artisan.companyName, firstname: artisan.firstname, email: artisan.email, phone: artisan.phone, photoUrl: artisan.photoUrl },
      status,
      type: pick(bookingTypes),
      title: `${artisan.companyName} Service`,
      notes: i % 3 === 0 ? "Please bring your tools" : undefined,
      address: artisan.companyAddress,
      date: daysLater(i * 2),
      duration: Math.ceil(Math.random() * 4),
      createdAt: daysAgo(30 - i),
      updatedAt: daysAgo(30 - i),
      location: { type: "Point", coordinates: [3.4 + Math.random() * 0.2, 6.4 + Math.random() * 0.2] },
      artisanViewed: status !== "pending",
      artisanCompleted: status === "completed",
      userCompleted: status === "completed",
      artisanCancelled: status === "cancelled",
      userCancelled: false,
      isInDispute: status === "cancelled" && i % 4 === 0,
      rescheduled: 0,
      userRescheduleCount: 0,
      artisanRescheduleCount: 0,
      userCompletedAt: status === "completed" ? daysAgo(5) : undefined,
    });
  }
  return bookings;
};

const bookings = generateBookings();

// ---------------------------------------------------------------------------
// Generate fixture portfolios
// ---------------------------------------------------------------------------
const generatePortfolios = () => {
  const portfolios: any[] = [];
  let idx = 1;
  for (const a of artisans.slice(0, 10)) {
    for (let j = 0; j < Math.ceil(Math.random() * 4); j++) {
      portfolios.push({
        _id: `portfolio-${idx}`,
        artisan: a._id,
        title: `Project ${j + 1}`,
        description: `Sample work by ${a.companyName}`,
        images: [
          `https://picsum.photos/seed/port${idx}a/400/300`,
          `https://picsum.photos/seed/port${idx}b/400/300`,
        ],
        isActive: true,
        createdAt: daysAgo(Math.floor(Math.random() * 90)),
      });
      idx++;
    }
  }
  return portfolios;
};

const portfolios = generatePortfolios();

// ---------------------------------------------------------------------------
// Generate fixture disputes
// ---------------------------------------------------------------------------
const generateDisputes = () => {
  const disputes: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const b = bookings[i % bookings.length];
    disputes.push({
      _id: `dispute-${i}`,
      status: i % 2 === 0 ? "open" : "closed",
      user: { _id: "user-1", email: "demo@example.com", firstname: "Demo" },
      artisan: { _id: b.artisan._id, email: b.artisan.email, firstname: b.artisan.firstname, companyName: b.artisan.companyName },
      createdBy: "user-1",
      booking: { _id: b._id, status: b.status, title: b.title, date: b.date },
      role: "user",
      model: "Booking",
      firstname: "Demo",
      createdAt: daysAgo(Math.floor(Math.random() * 20)),
      attendingStaff: undefined,
    });
  }
  return disputes;
};

const disputes = generateDisputes();

// ---------------------------------------------------------------------------
// Generate fixture ratings
// ---------------------------------------------------------------------------
const generateRatings = () => {
  const ratings: any[] = [];
  for (let i = 1; i <= 30; i++) {
    const artisan = pick(artisans);
    const fn = pick(names.first);
    ratings.push({
      _id: `rating-${i}`,
      artisan: artisan._id,
      userId: { _id: `user-${(i % 3) + 1}`, firstname: fn },
      rating: Math.floor(3 + Math.random() * 3),
      review: pick([
        "Excellent work! Very professional.",
        "Did a great job, highly recommend.",
        "Good service, arrived on time.",
        "Very skilled and affordable.",
        "Decent work, communication could improve.",
        "Outstanding quality, exceeded expectations!",
        "Quick and efficient. Solved my problem.",
      ]),
      createdAt: daysAgo(Math.floor(Math.random() * 90)),
      updatedAt: daysAgo(Math.floor(Math.random() * 90)),
    });
  }
  return ratings;
};

const ratings = generateRatings();

// ---------------------------------------------------------------------------
// Generate fixture favourites
// ---------------------------------------------------------------------------
const generateFavourites = () => {
  const favs: any[] = [];
  for (let i = 0; i < 5; i++) {
    const a = artisans[i];
    favs.push({
      _id: `fav-${i + 1}`,
      artisan: {
        _id: a._id,
        companyName: a.companyName,
        companyAddress: a.companyAddress,
        heroImage: a.heroImage,
        photoUrl: a.photoUrl,
        rating: a.rating,
        email: a.email,
        fullname: a.fullname,
        firstname: a.firstname,
        lastname: a.lastname,
        phone: a.phone,
        role: "artisan",
        isActive: true,
        isVerified: true,
        deactivated: false,
        verified: a.verified,
        category: a.category.name,
        city: a.city,
        state: a.state,
        description: a.description,
        optionalPhone: a.optionalPhone,
        ratePerHr: a.ratePerHr,
        rateCurrency: "NGN",
        services: a.services,
        location: a.location,
        ntfToken: a.ntfToken,
        createdAt: a.lastActiveAt,
        updatedAt: a.lastActiveAt,
        businessHours: null,
        userPermissions: { login: true },
        country: "Nigeria",
      },
      userId: "user-1",
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
      updatedAt: daysAgo(Math.floor(Math.random() * 30)),
    });
  }
  return favs;
};

const favourites = generateFavourites();

// ---------------------------------------------------------------------------
// Generate fixture chats
// ---------------------------------------------------------------------------
const generateChats = () => {
  const chats: any[] = [];
  let idx = 1;
  for (const a of artisans.slice(0, 5)) {
    const msgCount = Math.ceil(Math.random() * 5);
    for (let j = 0; j < msgCount; j++) {
      chats.push({
        _id: `chat-${idx}`,
        user: "user-1",
        artisan: a._id,
        message: pick(["Hello, are you available?", "Yes, I am.", "What time?", "Morning works.", "Great, see you then!"]),
        createdBy: { _id: j % 2 === 0 ? "user-1" : a._id, firstname: j % 2 === 0 ? "Demo" : a.firstname, photoUrl: j % 2 === 0 ? "https://i.pravatar.cc/150?u=demouser" : a.photoUrl },
        files: j % 5 === 0 ? ["https://picsum.photos/seed/chatfile/400/300"] : [],
        createdAt: daysAgo(Math.floor(Math.random() * 14)),
        model: "Chat",
      });
      idx++;
    }
  }
  return chats;
};

const chats = generateChats();

// ---------------------------------------------------------------------------
// Generate fixture business hours
// ---------------------------------------------------------------------------
const generateBusinessHours = () => {
  const hours: any = {};
  for (const a of artisans) {
    hours[a._id] = {
      _id: `bizhrs-${a._id}`,
      artisan: a._id,
      monday: { openTime: "08:00", closeTime: "17:00" },
      tuesday: { openTime: "08:00", closeTime: "17:00" },
      wednesday: { openTime: "08:00", closeTime: "17:00" },
      thursday: { openTime: "08:00", closeTime: "17:00" },
      friday: { openTime: "08:00", closeTime: "17:00" },
      saturday: { openTime: "09:00", closeTime: "14:00" },
      createdAt: "2023-01-01T00:00:00.000Z",
    };
  }
  return hours;
};

const businessHours = generateBusinessHours();

// ---------------------------------------------------------------------------
// In-memory OTP store (for code-based auth)
// ---------------------------------------------------------------------------
const otpStore: Record<string, { code: string; session: string }> = {};

let sessionCounter = 0;

// ---------------------------------------------------------------------------
// Log helper
// ---------------------------------------------------------------------------
const logEvent = (event: string, details?: string) => {
  try {
    sqlite
      .prepare(
        `INSERT INTO artisan_services_web_events (event, details) VALUES (@event, @details)`,
      )
      .run({ event, details: details || null });
  } catch {
    // table might not exist yet
  }
};

// ===========================================================================
// CONTROLLER FACTORY
// ===========================================================================
export const ArtisanServicesWebController = () => {

  // -----------------------------------------------------------------------
  // POST /api/v1/register  (user registration, no artisan flow here)
  // -----------------------------------------------------------------------
  const Register = (req: Request, res: Response) => {
    try {
      const { fullname, email, phone, password, role } = req.body;
      if (!fullname || !password)
        return sendErrorFeedback(res, 400, "Fullname and password are required");

      const existing = sqlite
        .prepare("SELECT id FROM artisan_services_web_users WHERE email = ?")
        .get(email || "");
      if (existing)
        return sendErrorFeedback(res, 409, "Email already registered");

      sqlite
        .prepare(
          `INSERT INTO artisan_services_web_users (name, email, phone, password, isVerified)
           VALUES (@name, @email, @phone, @password, @isVerified)`,
        )
        .run({
          name: fullname,
          email: email || "",
          phone: phone || "",
          password,
          isVerified: 1,
        });

      logEvent("user-register", email || phone);
      return sendSuccessFeedback(res, "Registration successful", {});
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/login
  // -----------------------------------------------------------------------
  const Login = (req: Request, res: Response) => {
    try {
      const { email, phone, password, role } = req.body;
      const identifier = email || phone;

      let user: any;
      if (email) {
        user = sqlite
          .prepare("SELECT * FROM artisan_services_web_users WHERE email = ? AND password = ?")
          .get(email, password);
      } else if (phone) {
        user = sqlite
          .prepare("SELECT * FROM artisan_services_web_users WHERE phone = ? AND password = ?")
          .get(phone, password);
      }

      if (!user) {
        // Allow demo login with any password for demo@example.com
        if (identifier === "demo@example.com" || identifier === "08012345678") {
          user = sqlite
            .prepare("SELECT * FROM artisan_services_web_users WHERE email = 'demo@example.com'")
            .get();
        }
      }

      if (!user)
        return sendErrorFeedback(res, 401, "Invalid email/phone or password");

      const isArtisan = role === "artisan";

      logEvent("user-login", identifier);
      return sendSuccessFeedback(res, "Login successful", {
        accessToken: `demo-artisan-services-web-token-${user.id}`,
        refreshToken: `demo-artisan-services-web-refresh-${user.id}`,
        _id: `${user.id}`,
        email: user.email,
        fullname: user.name,
        phone: user.phone,
        firstname: user.name.split(" ")[0] || user.name,
        lastname: user.name.split(" ").slice(1).join(" ") || "",
        photoUrl: user.avatar || `https://i.pravatar.cc/150?u=user${user.id}`,
        role: isArtisan ? "artisan" : "user",
        userMode: isArtisan ? "artisan" : "user",
        // Artisan fields (only relevant when role is artisan)
        ...(isArtisan && {
          companyName: `${user.name}'s Services`,
          companyAddress: "15 Adeola Odeku, Victoria Island, Lagos",
          rating: 4.5,
          jobsCompleted: 42,
          homeAddress: "15 Adeola Odeku, Victoria Island, Lagos",
          nin: "12345678901",
          gender: "male",
          category: "cat-1",
          location: { type: "Point", coordinates: [3.42, 6.45] },
          heroImage: [],
          services: null,
          rateCurrency: "NGN",
          verified: true,
          deactivated: false,
          minNoticeHrs: 2,
          favourited: 10,
          views: 200,
          isApproved: true,
          socials: { facebook: "https://facebook.com/demo", instagram: "https://instagram.com/demo", twitter: "https://twitter.com/demo" },
          lastVisitedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/code/get
  // -----------------------------------------------------------------------
  const SendCode = (req: Request, res: Response) => {
    try {
      const { email, phone, role } = req.body;
      const sessionKey = `session-${++sessionCounter}-${Date.now()}`;
      const code = generateOtp();
      otpStore[sessionKey] = { code, session: sessionKey };
      logEvent("code-sent", email || phone);
      return sendSuccessFeedback(res, "Verification code sent", { session: sessionKey });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/code/verify
  // -----------------------------------------------------------------------
  const VerifyCode = (req: Request, res: Response) => {
    try {
      const { session, email, phone, emailCode, phoneCode, role } = req.body;
      const code = emailCode || phoneCode;
      const entry = otpStore[session];

      if (!entry || entry.code !== code)
        return sendErrorFeedback(res, 400, "Invalid or expired code");

      delete otpStore[session];
      logEvent("code-verified", email || phone);
      return sendSuccessFeedback(res, "Verification successful", { verified: true });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/forgot-password
  // -----------------------------------------------------------------------
  const ForgotPassword = (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM artisan_services_web_users WHERE email = ?")
        .get(email) as ArtisanServicesWebUser | undefined;

      if (!user) return sendErrorFeedback(res, 404, "Email not found");

      const token = generateOtp();
      sqlite
        .prepare("UPDATE artisan_services_web_users SET resetToken = ? WHERE id = ?")
        .run(token, user.id);

      logEvent("user-forgot-password", email);
      return sendSuccessFeedback(res, "Password reset link sent to your email", { resetToken: token });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /api/v1/reset-password
  // -----------------------------------------------------------------------
  const ResetPassword = (req: Request, res: Response) => {
    try {
      const { code, password } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM artisan_services_web_users WHERE resetToken = ?")
        .get(code) as ArtisanServicesWebUser | undefined;

      if (!user) return sendErrorFeedback(res, 400, "Invalid or expired reset token");

      sqlite
        .prepare("UPDATE artisan_services_web_users SET password = ?, resetToken = NULL WHERE id = ?")
        .run(password, user.id);

      logEvent("user-reset-password", `user:${user.id}`);
      return sendSuccessFeedback(res, "Password reset successfully");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/logout
  // -----------------------------------------------------------------------
  const Logout = (_req: Request, res: Response) => {
    return sendSuccessFeedback(res, "Logged out successfully");
  };

  // -----------------------------------------------------------------------
  // GET /api/v1/deactivate
  // -----------------------------------------------------------------------
  const DeactivateAccount = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");
      return sendSuccessFeedback(res, "Account deactivated");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /api/v1/update  (user email/phone update)
  // -----------------------------------------------------------------------
  const UpdateUser = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const { email, phone } = req.body;
      sqlite
        .prepare("UPDATE artisan_services_web_users SET email = COALESCE(@email, email), phone = COALESCE(@phone, phone) WHERE id = @id")
        .run({ email: email || null, phone: phone || null, id: userId });

      logEvent("user-update", `user:${userId}`);
      return sendSuccessFeedback(res, "Details updated. Login to continue");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /api/v1/update-password
  // -----------------------------------------------------------------------
  const UpdatePassword = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const { oldPassword, newPassword } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM artisan_services_web_users WHERE id = ?")
        .get(userId) as ArtisanServicesWebUser | undefined;

      if (!user || user.password !== oldPassword)
        return sendErrorFeedback(res, 400, "Current password is incorrect");

      sqlite
        .prepare("UPDATE artisan_services_web_users SET password = ? WHERE id = ?")
        .run(newPassword, userId);

      logEvent("user-update-password", `user:${userId}`);
      return sendSuccessFeedback(res, "Password updated. Login to continue");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /api/v1/profile-image
  // -----------------------------------------------------------------------
  const UploadProfileImage = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const photoUrl = `https://i.pravatar.cc/150?u=user${userId}_${Date.now()}`;
      sqlite
        .prepare("UPDATE artisan_services_web_users SET avatar = ? WHERE id = ?")
        .run(photoUrl, userId);

      return sendSuccessFeedback(res, "Profile image updated", { photoUrl });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/all/artisan
  // -----------------------------------------------------------------------
  const GetArtisans = (req: Request, res: Response) => {
    try {
      let filtered = [...artisans];
      const { page = 1, category, sort, location, distance, jobsCompleted, rating, verified } = req.body;

      if (category) filtered = filtered.filter((a) => a.category._id === category);
      if (rating) filtered = filtered.filter((a) => a.rating >= Number(rating));
      if (verified === true || verified === "true") filtered = filtered.filter((a) => a.verified);
      if (sort === "-rating") filtered.sort((a, b) => b.rating - a.rating);

      const pg = Number(page) || 1;
      const limit = 12;
      const totalPages = Math.ceil(filtered.length / limit);
      const start = (pg - 1) * limit;
      const items = filtered.slice(start, start + limit);

      return sendListFeedback(res, "Artisans retrieved", items, filtered.length, { page: pg, totalPages });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // GET /api/v1/single/artisan/:id
  // -----------------------------------------------------------------------
  const GetArtisan = (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const artisan = artisans.find((a) => a._id === id);
      if (!artisan) return sendErrorFeedback(res, 404, "Artisan not found");

      const artisanRatings = ratings.filter((r) => r.artisan === id);
      const avgRating = artisanRatings.length > 0
        ? Math.round((artisanRatings.reduce((s, r) => s + r.rating, 0) / artisanRatings.length) * 10) / 10
        : 0;

      return sendSuccessFeedback(res, "Artisan retrieved", {
        ...artisan,
        rating: avgRating || artisan.rating,
        reviewCount: artisanRatings.length,
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /api/v1/artisan  (update artisan profile - FormData)
  // -----------------------------------------------------------------------
  const UpdateArtisan = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const email = req.body.email || "";
      const phone = req.body.phone || "";
      const homeAddress = req.body.homeAddress || "";

      if (email || phone) {
        sqlite
          .prepare("UPDATE artisan_services_web_users SET email = COALESCE(@email, email), phone = COALESCE(@phone, phone) WHERE id = @id")
          .run({ email: email || null, phone: phone || null, id: userId });
      }

      logEvent("artisan-update-profile", `user:${userId}`);
      return sendSuccessFeedback(res, "Profile updated successfully");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/artisan/photo
  // -----------------------------------------------------------------------
  const UploadArtisanPhoto = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Photo uploaded successfully", {
        photoUrl: `https://i.pravatar.cc/150?u=artisan_${Date.now()}`,
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/artisan/nin
  // -----------------------------------------------------------------------
  const SubmitNIN = (req: Request, res: Response) => {
    try {
      const { nin } = req.body;
      if (!nin) return sendErrorFeedback(res, 400, "NIN is required");
      return sendSuccessFeedback(res, "NIN submitted successfully");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/artisan/personal
  // -----------------------------------------------------------------------
  const SubmitPersonalDetails = (req: Request, res: Response) => {
    try {
      const { fullname, email, phone, password, gender, homeAddress, session } = req.body;
      if (!fullname || !password)
        return sendErrorFeedback(res, 400, "Fullname and password are required");

      const existing = sqlite
        .prepare("SELECT id FROM artisan_services_web_users WHERE email = ?")
        .get(email || "");
      if (!existing) {
        sqlite
          .prepare(
            `INSERT INTO artisan_services_web_users (name, email, phone, password, isVerified)
             VALUES (@name, @email, @phone, @password, @isVerified)`,
          )
          .run({ name: fullname, email: email || "", phone: phone || "", password, isVerified: 1 });
      }

      return sendSuccessFeedback(res, "Personal details saved");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/artisan/business
  // -----------------------------------------------------------------------
  const SubmitBusinessDetails = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Business details saved");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /api/v1/artisan/business-hours
  // -----------------------------------------------------------------------
  const UpdateBusinessHoursOrInfo = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const body = req.body;
      if (body.businessInfo) {
        return sendSuccessFeedback(res, "Business info updated");
      }
      return sendSuccessFeedback(res, "Business hours updated");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /api/v1/artisan/socials
  // -----------------------------------------------------------------------
  const UpdateSocials = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");
      return sendSuccessFeedback(res, "Social links updated");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // GET /api/v1/single/business-hours/:id
  // -----------------------------------------------------------------------
  const GetBusinessHours = (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const hours = businessHours[id] || {
        _id: `bizhrs-${id}`,
        artisan: id,
        monday: { openTime: "08:00", closeTime: "17:00" },
        tuesday: { openTime: "08:00", closeTime: "17:00" },
        wednesday: { openTime: "08:00", closeTime: "17:00" },
        thursday: { openTime: "08:00", closeTime: "17:00" },
        friday: { openTime: "08:00", closeTime: "17:00" },
        createdAt: "2023-01-01T00:00:00.000Z",
      };
      return sendSuccessFeedback(res, "Business hours retrieved", hours);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/all/portfolio
  // -----------------------------------------------------------------------
  const GetPortfolios = (req: Request, res: Response) => {
    try {
      const { artisan } = req.body;
      let result = portfolios;
      if (artisan) result = result.filter((p) => p.artisan === artisan);
      return sendListFeedback(res, "Portfolios retrieved", result);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/artisan/portfolio
  // -----------------------------------------------------------------------
  const CreatePortfolio = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");
      return sendSuccessFeedback(res, "Portfolio created", {
        _id: `portfolio-new-${Date.now()}`,
        images: ["https://picsum.photos/seed/newport/400/300"],
        title: req.body.title || "",
        description: req.body.description || "",
        artisan: userId,
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // DELETE /api/v1/artisan/portfolio/:id
  // -----------------------------------------------------------------------
  const DeletePortfolio = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");
      return sendSuccessFeedback(res, "Portfolio deleted");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/user/booking
  // -----------------------------------------------------------------------
  const CreateBooking = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const { artisan: artisanId, address, notes, title, date } = req.body;
      const artisan = artisans.find((a) => a._id === artisanId);
      if (!artisan) return sendErrorFeedback(res, 404, "Artisan not found");

      logEvent("booking-create", `user:${userId} artisan:${artisanId}`);
      return sendSuccessFeedback(res, "Booking created successfully", {
        _id: `booking-new-${Date.now()}`,
        userId: { _id: userId, firstname: "Demo", photoUrl: "https://i.pravatar.cc/150?u=demouser" },
        artisan: { _id: artisan._id, companyName: artisan.companyName, firstname: artisan.firstname, email: artisan.email, phone: artisan.phone, photoUrl: artisan.photoUrl },
        status: "pending",
        type: date ? "scheduled" : "instant",
        title: title || `${artisan.companyName} Service`,
        notes,
        address: address || artisan.companyAddress,
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/all/booking
  // -----------------------------------------------------------------------
  const GetBookings = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const { page = 1 } = req.body;
      const pg = Number(page) || 1;
      const limit = 10;
      const start = (pg - 1) * limit;
      const items = bookings.slice(start, start + limit);

      return sendListFeedback(res, "Bookings retrieved", items);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // GET /api/v1/single/booking/:id
  // -----------------------------------------------------------------------
  const GetBooking = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const id = req.params.id as string;
      const booking = bookings.find((b) => b._id === id);
      if (!booking) return sendErrorFeedback(res, 404, "Booking not found");

      return sendSuccessFeedback(res, "Booking retrieved", booking);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /api/v1/user/booking/:id
  // -----------------------------------------------------------------------
  const UpdateBooking = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const id = req.params.id as string;
      const { type, date, artisan: artisanId } = req.body;

      let newStatus: string | undefined;
      let msg = "Booking updated";

      switch (type) {
        case "cancel":
          newStatus = "cancelled";
          msg = "Booking cancelled";
          break;
        case "complete":
          newStatus = "completed";
          msg = "Job completed";
          break;
        case "reschedule":
          newStatus = "pending";
          msg = "Booking rescheduled";
          break;
        case "accept":
          newStatus = "accepted";
          msg = "Booking accepted";
          break;
        case "start":
          newStatus = "started";
          msg = "Job started";
          break;
      }

      logEvent("booking-update", `booking:${id} type:${type}`);
      return sendSuccessFeedback(res, msg, { status: newStatus });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/all/favourite
  // -----------------------------------------------------------------------
  const GetFavourites = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const { page = 1 } = req.body;
      const pg = Number(page) || 1;
      const limit = 10;
      const start = (pg - 1) * limit;
      const items = favourites.slice(start, start + limit);

      return sendListFeedback(res, "Favourites retrieved", items);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/analytics/favourite  (toggle)
  // -----------------------------------------------------------------------
  const ToggleFavourite = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");
      return sendSuccessFeedback(res, "Favourite toggled");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/all/rating
  // -----------------------------------------------------------------------
  const GetRatings = (req: Request, res: Response) => {
    try {
      const { artisan } = req.body;
      let result = ratings;
      if (artisan) result = result.filter((r) => r.artisan === artisan);
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return sendListFeedback(res, "Ratings retrieved", result);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/analytics/rating
  // -----------------------------------------------------------------------
  const SubmitRating = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");
      return sendSuccessFeedback(res, "Rating submitted");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/all/dispute
  // -----------------------------------------------------------------------
  const GetDisputes = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const { page = 1 } = req.body;
      const pg = Number(page) || 1;
      const limit = 10;
      const start = (pg - 1) * limit;
      const items = disputes.slice(start, start + limit);

      return sendListFeedback(res, "Disputes retrieved", items);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/dispute  (create)
  // -----------------------------------------------------------------------
  const CreateDispute = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const { booking } = req.body;
      const foundBooking = bookings.find((b) => b._id === booking);

      const newDispute = {
        _id: `dispute-new-${Date.now()}`,
        status: "open",
        user: { _id: userId, email: "demo@example.com", firstname: "Demo" },
        artisan: foundBooking ? { _id: foundBooking.artisan._id, email: foundBooking.artisan.email, firstname: foundBooking.artisan.firstname, companyName: foundBooking.artisan.companyName } : { _id: "artisan-1", email: "artisan@example.com", firstname: "Artisan", companyName: "Artisan Services" },
        createdBy: userId,
        booking: foundBooking ? { _id: foundBooking._id, status: foundBooking.status, title: foundBooking.title, date: foundBooking.date } : { _id: booking, status: "pending", title: "Service", date: new Date().toISOString() },
        role: "user",
        model: "Booking",
        firstname: "Demo",
        createdAt: new Date().toISOString(),
        attendingStaff: undefined,
      };

      logEvent("dispute-create", `booking:${booking}`);
      return sendSuccessFeedback(res, "Dispute created", newDispute);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/all/dispute-response
  // -----------------------------------------------------------------------
  const GetDisputeResponses = (req: Request, res: Response) => {
    try {
      return sendListFeedback(res, "Responses retrieved", []);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/dispute-response
  // -----------------------------------------------------------------------
  const CreateDisputeResponse = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Response sent");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/all/chat
  // -----------------------------------------------------------------------
  const GetChats = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const { artisan } = req.body;
      let result = chats;
      if (artisan) result = result.filter((c) => c.artisan === artisan);
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return sendListFeedback(res, "Chats retrieved", result);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/chat
  // -----------------------------------------------------------------------
  const SendChatMessage = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");
      return sendSuccessFeedback(res, "Message sent");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // GET /api/v1/chat/highlights
  // -----------------------------------------------------------------------
  const GetChatHighlights = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const grouped: Record<string, any> = {};
      for (const c of chats) {
        const key = c.artisan;
        if (!grouped[key] || new Date(c.createdAt) > new Date(grouped[key].createdAt)) {
          const artisan = artisans.find((a) => a._id === c.artisan);
          grouped[key] = {
            _id: { user: c.user, artisan: c.artisan },
            message: c.message,
            files: c.files || [],
            createdAt: c.createdAt,
            recipient: {
              fullname: artisan?.fullname || "Artisan",
              photoUrl: artisan?.photoUrl || "https://i.pravatar.cc/150?u=artisan",
            },
            user: c.user,
            artisan: c.artisan,
          };
        }
      }

      return sendListFeedback(res, "Highlights retrieved", Object.values(grouped));
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/all/notification
  // -----------------------------------------------------------------------
  const GetNotifications = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const notifications = sqlite
        .prepare(
          `SELECT id, title, message, isRead, createdAt FROM artisan_services_web_notifications WHERE userId = ? ORDER BY createdAt DESC`,
        )
        .all(userId) as any[];

      const mapped = notifications.map((n: any) => ({
        _id: String(n.id),
        isRead: Boolean(n.isRead),
        message: n.message,
        model: n.title || "Notification",
        createdAt: n.createdAt,
        category: "general",
        identifier: String(n.id),
        userId: String(userId),
        recipientModel: "User",
        updatedAt: n.createdAt,
      }));

      return sendListFeedback(res, "Notifications retrieved", mapped);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // PATCH /api/v1/notification/update/:id
  // -----------------------------------------------------------------------
  const UpdateNotification = (req: Request, res: Response) => {
    try {
      const userId = getTokenUserId(req);
      if (!userId) return sendErrorFeedback(res, 401, "Unauthorized");

      const id = req.params.id as string;
      sqlite
        .prepare("UPDATE artisan_services_web_notifications SET isRead = 1 WHERE id = ? AND userId = ?")
        .run(id, userId);

      return sendSuccessFeedback(res, "Notification updated");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // GET /api/v1/no-auth/all/artisan-category
  // -----------------------------------------------------------------------
  const GetCategories = (_req: Request, res: Response) => {
    try {
      return sendListFeedback(res, "Categories retrieved", categories);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/no-auth/feedback
  // -----------------------------------------------------------------------
  const SubmitFeedback = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Feedback submitted successfully");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/analytics/views
  // -----------------------------------------------------------------------
  const RecordView = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "View recorded");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // -----------------------------------------------------------------------
  // POST /api/v1/geocode  (Google Maps geocoding replacement)
  // -----------------------------------------------------------------------
  const Geocode = (req: Request, res: Response) => {
    try {
      const { lng, lat } = req.body;
      if (!lng || !lat)
        return sendErrorFeedback(res, 400, "Longitude and latitude are required");

      const areas = [
        "Ikeja, Lagos", "Victoria Island, Lagos", "Lekki Phase 1, Lagos",
        "Surulere, Lagos", "GRA, Port Harcourt", "Maitama, Abuja",
        "Wuse 2, Abuja", "Garki, Abuja", "Bodija, Ibadan",
        "Enugu, Enugu State", "Asaba, Delta State", "Calabar, Cross River",
      ];
      const streets = [
        "15 Adeola Odeku Street", "22 Awolowo Road", "7 Bishop Aboyade Cole Street",
        "31 Toyin Street", "4 Idejo Street", "12 Admiralty Way",
        "8 Ahmadu Bello Way", "19 Constitution Avenue",
      ];
      const index = Math.floor(Math.abs(Number(lng) + Number(lat)) * 10) % areas.length;
      const streetIndex = Math.floor(Math.abs(Number(lat)) * 7) % streets.length;

      const formattedAddress = `${streets[streetIndex]}, ${areas[index]}`;

      return sendSuccessFeedback(res, "Geocoding successful", {
        results: [
          {
            formatted_address: formattedAddress,
            geometry: {
              location: {
                lat: Number(lat),
                lng: Number(lng),
              },
            },
          },
        ],
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // =========================================================================
  return {
    Register,
    Login,
    SendCode,
    VerifyCode,
    ForgotPassword,
    ResetPassword,
    Logout,
    DeactivateAccount,
    UpdateUser,
    UpdatePassword,
    UploadProfileImage,
    GetArtisans,
    GetArtisan,
    UpdateArtisan,
    UploadArtisanPhoto,
    SubmitNIN,
    SubmitPersonalDetails,
    SubmitBusinessDetails,
    UpdateBusinessHoursOrInfo,
    UpdateSocials,
    GetBusinessHours,
    GetPortfolios,
    CreatePortfolio,
    DeletePortfolio,
    CreateBooking,
    GetBookings,
    GetBooking,
    UpdateBooking,
    GetFavourites,
    ToggleFavourite,
    GetRatings,
    SubmitRating,
    GetDisputes,
    CreateDispute,
    GetDisputeResponses,
    CreateDisputeResponse,
    GetChats,
    SendChatMessage,
    GetChatHighlights,
    GetNotifications,
    UpdateNotification,
    GetCategories,
    SubmitFeedback,
    RecordView,
    Geocode,
  };
};
