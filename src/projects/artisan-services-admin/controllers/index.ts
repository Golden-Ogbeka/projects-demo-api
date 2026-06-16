import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
} from "../../../functions/feedback.js";

const names = {
  first: [
    "John", "Jane", "Bob", "Alice", "Charlie", "Diana", "Frank",
    "Grace", "Henry", "Ivy", "Jack", "Karen", "Leo", "Maria",
    "Nathan", "Olivia", "Paul", "Quinn", "Rachel", "Sam",
    "Tina", "Uma", "Victor", "Wendy", "Xander", "Yara",
    "Zane", "Ava", "Ben", "Chloe", "David", "Ella",
    "Finn", "Gemma", "Hank", "Isla", "Jake", "Luna",
  ],
  last: [
    "Doe", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia",
    "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor",
    "Thomas", "Moore", "Jackson", "Martin", "Lee", "Perez",
    "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez",
    "Lewis", "Robinson", "Walker", "Hall", "Allen", "Young",
  ],
  artisanBusiness: [
    "PrimeFix Services", "Ace Plumbing", "Bright Electricals", "DeRoi Carpentry",
    "Sparkle Cleaning Co", "ColourCraft Painting", "CoolBreeze AC Services",
    "Steadfast Plumbing", "VoltMaster Electrical", "WoodArt Carpentry",
    "ShineBright Cleaning", "BrushStroke Painting", "ChillMax AC Repairs",
    "FlowRight Plumbing", "PowerGrid Electrical", "CraftWood Carpentry",
    "CleanSweep Services", "HueMasters Painting", "BreezyAir Solutions",
    "DrainPro Plumbing",
  ],
  locations: [
    "Ikeja, Lagos", "Victoria Island, Lagos", "Lekki Phase 1, Lagos",
    "Surulere, Lagos", "GRA, Port Harcourt", "Maitama, Abuja",
    "Wuse 2, Abuja", "Garki, Abuja", "Bodija, Ibadan",
    "Owerri, Imo", "Enugu, Enugu State", "Asaba, Delta State",
    "Calabar, Cross River", "Uyo, Akwa Ibom", "Benin City, Edo",
    "Abeokuta, Ogun State", "Ilorin, Kwara State", "Kano, Kano State",
    "Kaduna, Kaduna State", "Jos, Plateau State",
  ],
  streets: [
    "15 Adeola Odeku", "22 Awolowo Road", "7 Bishop Aboyade Cole",
    "31 Toyin Street", "4 Idejo Street", "12 Admiralty Way",
    "8 Ahmadu Bello Way", "19 Constitution Avenue", "3 Shehu Yar'adua Way",
    "27 Dan Fodio Road", "11 Trans Amadi", "6 Aba Road",
    "9 Nnamdi Azikiwe Road", "14 Murtala Mohammed Way",
    "2 Tafawa Balewa Square",
  ],
};

const categories = [
  { _id: "cat_1", name: "Plumbing", description: "Pipe repairs, installations, water heater services", image: "", services: ["Pipe Repairs", "Water Heater Installation", "Drain Cleaning"] },
  { _id: "cat_2", name: "Electrical", description: "Wiring, repairs, installations, solar systems", image: "", services: ["Wiring", "Solar Installation", "Lighting"] },
  { _id: "cat_3", name: "Carpentry", description: "Furniture, cabinets, woodwork, installations", image: "", services: ["Custom Furniture", "Cabinet Installation", "Wood Decking"] },
  { _id: "cat_4", name: "Cleaning", description: "Home, office, deep cleaning, fumigation", image: "", services: ["Home Cleaning", "Office Cleaning", "Fumigation"] },
  { _id: "cat_5", name: "Painting", description: "Interior and exterior painting, decorations", image: "", services: ["Interior Painting", "Exterior Painting", "Wallpaper Installation"] },
  { _id: "cat_6", name: "AC & Refrigeration", description: "AC installation, repairs, fridge maintenance", image: "", services: ["AC Installation", "AC Repairs", "Fridge Repairs"] },
  { _id: "cat_7", name: "Tiling & Flooring", description: "Floor and wall tiling, marble installation", image: "", services: ["Floor Tiling", "Wall Tiling"] },
  { _id: "cat_8", name: "POP & Ceiling", description: "POP ceiling design, installation, repairs", image: "", services: ["POP Design", "POP Repairs"] },
  { _id: "cat_9", name: "Mechanical", description: "Generator repairs, mechanical installations", image: "", services: ["Generator Servicing", "Mechanical Repairs"] },
  { _id: "cat_10", name: "Landscaping", description: "Garden design, lawn maintenance, hedge trimming", image: "", services: ["Garden Design", "Lawn Care"] },
];

const defaultPermissions = {
  login: true,
  userRead: true,
  approveArtisans: true,
  adminRead: true,
  orderRead: true,
  deactivateUser: true,
  deactivateAdmin: true,
  createArtisanCategories: true,
  createPlans: true,
  createGeneralData: true,
};

const userPermissions = { login: true };

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const daysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const catNames = categories.map((c) => c.name);
const catIdMap = Object.fromEntries(categories.map((c) => [c.name, c._id]));

const generateArtisans = (count: number) => {
  const items: any[] = [];
  for (let i = 1; i <= count; i++) {
    const firstName = pick(names.first);
    const lastName = pick(names.last);
    const catName = pick(catNames);
    const cat = categories.find((c) => c.name === catName)!;
    items.push({
      _id: `art_${i}`,
      userPermissions: { ...userPermissions },
      country: "Nigeria",
      role: "artisan",
      isActive: Math.random() > 0.15,
      isVerified: Math.random() > 0.3,
      verified: Math.random() > 0.3,
      isApproved: Math.random() > 0.2,
      resetCount: 0,
      verificationCount: 1,
      sendCodeTo: null,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      fullname: `${firstName} ${lastName}`,
      phone: `+23480${String(10000000 + i).slice(0, 8)}`,
      ntfToken: `demo-ntf-${i}`,
      createdAt: daysAgo(Math.floor(30 + Math.random() * 365)),
      companyName: pick(names.artisanBusiness),
      firstname: firstName,
      lastname: lastName,
      location: { type: "Point", coordinates: [3.3792 + Math.random(), 6.5244 + Math.random()] },
      rating: Math.round((3 + Math.random() * 2) * 10) / 10,
      heroImage: [],
      services: null,
      rateCurrency: "NGN",
      deactivated: false,
      minNoticeHrs: 24,
      jobsCompleted: Math.floor(10 + Math.random() * 200),
      jobsCancelled: Math.floor(Math.random() * 10),
      favourited: Math.floor(Math.random() * 50),
      views: Math.floor(Math.random() * 500),
      gender: pick(["male", "female"]),
      homeAddress: `${pick(names.streets)}, ${pick(names.locations)}`,
      nin: `${String(10000000000 + i)}`,
      category: catName,
      companyAddress: `${pick(names.streets)}, ${pick(names.locations)}`,
      photoUrl: `https://i.pravatar.cc/150?u=art_${i}`,
      lastVisitedAt: daysAgo(Math.floor(Math.random() * 7)),
    });
  }
  return items;
};

const generateCustomers = (count: number) => {
  const items: any[] = [];
  for (let i = 1; i <= count; i++) {
    const firstName = pick(names.first);
    const lastName = pick(names.last);
    items.push({
      _id: `user_${i}`,
      userPermissions: { ...userPermissions },
      country: "Nigeria",
      role: "user",
      isActive: Math.random() > 0.15,
      isVerified: Math.random() > 0.2,
      resetCount: 0,
      verificationCount: 1,
      sendCodeTo: "email",
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      fullname: `${firstName} ${lastName}`,
      firstname: firstName,
      lastname: lastName,
      phone: `+23480${String(20000000 + i).slice(0, 8)}`,
      ntfToken: `demo-ntf-user-${i}`,
      createdAt: daysAgo(Math.floor(30 + Math.random() * 365)),
      verificationCode: "",
      verificationExpires: "",
      resetExpires: "",
    });
  }
  return items;
};

const generateTransactions = (artisans: any[], customers: any[], count: number) => {
  const txns: any[] = [];
  const methods = ["card", "bank_transfer", "wallet", "ussd"];
  const descriptions = [
    "Payment for plumbing repair", "Electrical installation fee",
    "Carpentry service payment", "Cleaning service fee",
    "Painting job payment", "AC repair service fee",
    "Tiling project payment", "POP ceiling installation fee",
    "Landscaping service payment", "Generator repair fee",
  ];
  for (let i = 1; i <= count; i++) {
    const artisan = pick(artisans);
    const customer = pick(customers);
    const statuses: ("successful" | "failed" | "pending" | "refunded")[] =
      ["successful", "successful", "successful", "successful", "failed", "pending", "refunded"];
    txns.push({
      _id: `txn_${i}`,
      reference: `KQT-${String(100000 + i)}`,
      artisanId: artisan._id,
      artisanName: artisan.fullname,
      customerId: customer._id,
      customerName: customer.fullname,
      amount: Math.floor(5000 + Math.random() * 200000),
      fee: Math.floor(100 + Math.random() * 2000),
      status: pick(statuses),
      method: pick(methods),
      description: pick(descriptions),
      createdAt: daysAgo(Math.floor(Math.random() * 90)),
    });
  }
  return txns;
};

const generateTickets = (count: number) => {
  const tickets: any[] = [];
  const subjects = [
    "Unable to complete payment", "Artisan not showing up",
    "Account verification issue", "App glitch on booking",
    "Refund request", "Wrong charges applied",
    "Service not as described", "Technical support needed",
    "Profile update not saving", "Rating not posting",
  ];
  for (let i = 1; i <= count; i++) {
    const fn = pick(names.first);
    const ln = pick(names.last);
    tickets.push({
      _id: `ticket_${i}`,
      liveChat: false,
      status: pick(["open", "open", "closed"]),
      files: [],
      uid: `uid_${i}`,
      fullname: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      phone: `+23480${String(30000000 + i).slice(0, 8)}`,
      subject: pick(subjects),
      comment: `Customer reported: ${pick(subjects).toLowerCase()}.`,
      role: pick(["user", "artisan"]),
      userId: `user_${Math.floor(1 + Math.random() * 30)}`,
      attendingStaff: i % 3 === 0 ? { _id: "admin_1", fullname: "Demo Admin", phone: "+2348011111111", email: "demo@example.com" } : null,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    });
  }
  return tickets;
};

const generateTicketResponses = (tickets: any[], count: number) => {
  const responses: any[] = [];
  for (let i = 1; i <= count; i++) {
    const ticket = pick(tickets);
    const fn = pick(names.first);
    const ln = pick(names.last);
    responses.push({
      _id: `tresp_${i}`,
      files: [],
      uid: `uid_r_${i}`,
      ticketId: ticket._id,
      attendingStaff: "admin_1",
      createdAt: daysAgo(Math.floor(Math.random() * 5)),
      userId: ticket.userId,
      fullname: `${fn} ${ln}`,
      role: pick(["user", "artisan", "admin"]),
      comment: `This is a response to ticket: ${ticket.subject.toLowerCase()}.`,
    });
  }
  return responses;
};

const generateDisputes = (artisans: any[], customers: any[], count: number) => {
  const disputes: any[] = [];
  const reasons = [
    "Artisan did not complete the job", "Poor quality of work",
    "Overcharged for service", "Damaged property during service",
    "Artisan did not show up", "Incomplete materials used",
    "Late arrival without notice", "Different person showed up",
  ];
  for (let i = 1; i <= count; i++) {
    const artisan = pick(artisans);
    const customer = pick(customers);
    disputes.push({
      _id: `disp_${i}`,
      status: pick(["open", "open", "closed"]),
      user: { _id: customer._id, email: customer.email, fullname: customer.fullname, phone: customer.phone },
      firstname: customer.firstname,
      role: "user",
      model: "User",
      artisan: { _id: artisan._id, email: artisan.email, fullname: artisan.fullname, phone: artisan.phone, companyName: artisan.companyName },
      createdBy: customer._id,
      booking: `booking_${Math.floor(1 + Math.random() * 40)}`,
      createdAt: daysAgo(Math.floor(Math.random() * 45)),
    });
  }
  return disputes;
};

const generateDisputeResponses = (disputes: any[], count: number) => {
  const responses: any[] = [];
  for (let i = 1; i <= count; i++) {
    const dispute = pick(disputes);
    const fn = pick(names.first);
    const ln = pick(names.last);
    responses.push({
      _id: `dresp_${i}`,
      files: [],
      booking: dispute.booking,
      disputeId: dispute._id,
      createdAt: daysAgo(Math.floor(Math.random() * 3)),
      user: { _id: dispute.user._id, email: dispute.user.email, fullname: dispute.user.fullname, phone: dispute.user.phone },
      firstname: fn,
      role: pick(["user", "admin"]),
      comment: `Regarding dispute: ${pick(reasons).toLowerCase()}.`,
      model: pick(["User", "Admin"]),
    });
  }
  return responses;
};

const reasons = [
  "Artisan did not complete the job", "Poor quality of work",
  "Overcharged for service", "Damaged property during service",
  "Artisan did not show up", "Incomplete materials used",
  "Late arrival without notice", "Different person showed up",
];

const generateAppointments = (artisans: any[], customers: any[], count: number) => {
  const appointments: any[] = [];
  for (let i = 1; i <= count; i++) {
    const artisan = pick(artisans);
    const customer = pick(customers);
    const d = new Date();
    d.setDate(d.getDate() + Math.floor(Math.random() * 14) - 7);
    appointments.push({
      _id: `booking_${i}`,
      location: { type: "Point", coordinates: [3.3792 + Math.random(), 6.5244 + Math.random()] },
      status: pick(["scheduled", "completed", "completed", "cancelled"]),
      artisanViewed: Math.random() > 0.3,
      artisanCompleted: Math.random() > 0.5,
      userCompleted: Math.random() > 0.4,
      artisanCancelled: false,
      userCancelled: false,
      isInDispute: false,
      rescheduled: Math.random() > 0.8 ? 1 : 0,
      userId: customer._id,
      address: `${pick(names.streets)}, ${pick(names.locations)}`,
      duration: Math.floor(1 + Math.random() * 4),
      notes: `${pick(catNames)} service appointment`,
      artisan: { _id: artisan._id, email: artisan.email, fullname: artisan.fullname, phone: artisan.phone, companyName: artisan.companyName },
      date: d.toISOString().split("T")[0],
      createdAt: daysAgo(Math.floor(3 + Math.random() * 20)),
      updatedAt: daysAgo(Math.floor(Math.random() * 3)),
      userCompletedAt: Math.random() > 0.5 ? daysAgo(Math.floor(Math.random() * 5)) : undefined,
    });
  }
  return appointments;
};

const generateNotifications = (count: number) => {
  const notifs: any[] = [];
  const categories_list = ["info", "warning", "promotion", "system"];
  const messages = [
    "New artisan registered", "Payment received", "Service completed",
    "Promotion: 20% off cleaning", "Welcome to Artisan Services",
    "Weekly artisan report", "System maintenance tonight",
    "New category added",
  ];
  for (let i = 1; i <= count; i++) {
    notifs.push({
      _id: `notif_${i}`,
      userId: `user_${Math.floor(1 + Math.random() * 30)}`,
      isRead: Math.random() > 0.6,
      category: pick(categories_list),
      identifier: `id_${i}`,
      message: pick(messages),
      createdAt: daysAgo(Math.floor(Math.random() * 60)),
      updatedAt: daysAgo(Math.floor(Math.random() * 3)),
    });
  }
  return notifs;
};

const generateWaitingList = (count: number) => {
  const list: any[] = [];
  for (let i = 1; i <= count; i++) {
    const firstName = pick(names.first);
    const lastName = pick(names.last);
    list.push({
      _id: `wait_${i}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      createdAt: daysAgo(Math.floor(Math.random() * 90)),
    });
  }
  return list;
};

const generateFeedbacks = (count: number) => {
  const items: any[] = [];
  for (let i = 1; i <= count; i++) {
    const firstName = pick(names.first);
    const lastName = pick(names.last);
    items.push({
      _id: `fb_${i}`,
      firstname: firstName,
      lastname: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      comment: `Great service! I am very satisfied with the ${pick(catNames).toLowerCase()} work done.`,
      createdAt: daysAgo(Math.floor(Math.random() * 90)),
    });
  }
  return items;
};

const generateUserRatings = (artisans: any[], customers: any[], count: number) => {
  const items: any[] = [];
  for (let i = 1; i <= count; i++) {
    const artisan = pick(artisans);
    const customer = pick(customers);
    items.push({
      _id: `rating_${i}`,
      userId: customer._id,
      rating: Math.floor(3 + Math.random() * 3),
      review: `Great ${pick(catNames).toLowerCase()} service! Very professional.`,
      createdAt: daysAgo(Math.floor(Math.random() * 60)),
      artisan: artisan._id,
    });
  }
  return items;
};

const generateViews = (artisans: any[], count: number) => {
  const items: any[] = [];
  for (let i = 1; i <= count; i++) {
    const artisan = pick(artisans);
    items.push({
      _id: `view_${i}`,
      artisan: artisan._id,
      userId: pick(customers)._id,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
      updatedAt: daysAgo(Math.floor(Math.random() * 5)),
      views: Math.floor(1 + Math.random() * 20),
    });
  }
  return items;
};

const artisans = generateArtisans(50);
const customers = generateCustomers(30);
const transactions = generateTransactions(artisans, customers, 120);
const tickets = generateTickets(25);
const ticketResponses = generateTicketResponses(tickets, 60);
const disputes = generateDisputes(artisans, customers, 15);
const disputeResponses = generateDisputeResponses(disputes, 30);
const appointments = generateAppointments(artisans, customers, 40);
const notifications = generateNotifications(20);
const waitingList = generateWaitingList(15);
const feedbacks = generateFeedbacks(10);
const userRatings = generateUserRatings(artisans, customers, 25);
const views = generateViews(artisans, 40);

const paginate = (items: any[], page: number, limit: number = 20) => {
  const totalPages = Math.ceil(items.length / limit);
  const start = (page - 1) * limit;
  return {
    count: items.length,
    page,
    totalPages,
    items: items.slice(start, start + limit),
  };
};

const logEvent = (action: string, resource: string, adminId: number, details?: string) => {
  sqlite
    .prepare(
      `INSERT INTO artisan_services_admin_events (action, resource, adminId, details)
       VALUES (@action, @resource, @adminId, @details)`,
    )
    .run({ action, resource, adminId, details: details || null });
};

const getAdminUserShape = (admin: any) => ({
  _id: String(admin.id),
  fullname: admin.name,
  email: admin.email,
  phone: "+2348012345678",
  role: admin.role,
  isActive: true,
  isVerified: true,
  userPermissions: { ...defaultPermissions },
  ntfToken: "demo-ntf-token",
  createdAt: admin.createdAt || new Date().toISOString(),
  photoUrl: "",
  notificationSettings: {
    emailNotify: true,
    newAdmin: true,
    newArtisan: true,
    newBooking: true,
    newUser: true,
    pushNotification: true,
  },
  token: "demo-artisan-services-admin-token",
});

export const ArtisanServicesAdminController = () => {
  const Login = (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const admin = sqlite
        .prepare("SELECT * FROM artisan_services_admin_admins WHERE email = ? AND password = ?")
        .get(email, password) as any;

      if (!admin)
        return sendErrorFeedback(res, 401, "Invalid email or password");

      const data = getAdminUserShape(admin);
      logEvent("login", "auth", admin.id);

      return sendSuccessFeedback(res, "Login successful", data);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const Logout = (_req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Logged out successfully");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const VerifyAccount = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Account verified successfully");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const SendVerification = (_req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Verification code sent to your email");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const ForgotPassword = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Verification code sent to your email");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const ResetPassword = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Password reset successful");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const RegisterAdmin = (req: Request, res: Response) => {
    try {
      const { email, fullname, phone, password } = req.body;
      if (!email || !fullname) {
        return sendErrorFeedback(res, 400, "Email and fullname are required");
      }

      const existing = sqlite
        .prepare("SELECT id FROM artisan_services_admin_admins WHERE email = ?")
        .get(email);
      if (existing) {
        return sendErrorFeedback(res, 409, "Admin with this email already exists");
      }

      const result = sqlite
        .prepare(
          `INSERT INTO artisan_services_admin_admins (email, password, name, role)
           VALUES (@email, @password, @name, @role)`,
        )
        .run({
          email,
          password: password || "password",
          name: fullname,
          role: "admin",
        });

      logEvent("create", "admin", 1, `Created admin: ${fullname}`);
      return sendSuccessFeedback(res, "Admin created successfully", {
        _id: String(result.lastInsertRowid),
        fullname,
        email,
        phone: phone || "",
        role: "admin",
        isActive: true,
        isVerified: false,
        userPermissions: { ...defaultPermissions },
        ntfToken: "",
        createdAt: new Date().toISOString(),
        photoUrl: "",
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateEmail = (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      return sendSuccessFeedback(res, "Email updated. Verify your new email.", {
        email,
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdatePassword = (req: Request, res: Response) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return sendErrorFeedback(res, 400, "Old password and new password are required");
      }

      const admin = sqlite
        .prepare("SELECT * FROM artisan_services_admin_admins WHERE id = 1")
        .get() as any;

      sqlite
        .prepare("UPDATE artisan_services_admin_admins SET password = ? WHERE id = 1")
        .run(newPassword);

      logEvent("change_password", "auth", 1);
      return sendSuccessFeedback(res, "Password updated successfully", getAdminUserShape(admin));
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const Dashboard = (_req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Stats retrieved", {
        tickets: tickets.filter((t) => t.status === "open").length,
        completedBookings: appointments.filter((a) => a.status === "completed").length,
        artisans: artisans.length,
        users: customers.length,
        visitingUsers: Math.floor(50 + Math.random() * 200),
        activeUsers: customers.filter((c) => c.isActive).length,
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetArtisans = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const totalPages = Math.ceil(artisans.length / limit);
      const start = (page - 1) * limit;
      const items = artisans.slice(start, start + limit);
      return res.json({ success: true, data: items, results: artisans.length, page, totalPages });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetArtisan = (req: Request, res: Response) => {
    try {
      const artisan = artisans.find((a) => a._id === req.params.id);
      if (!artisan) return sendErrorFeedback(res, 404, "Artisan not found");
      return sendSuccessFeedback(res, "Artisan retrieved", artisan);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const VerifyArtisan = (req: Request, res: Response) => {
    try {
      const { artisanId, status } = req.body;
      const artisan = artisans.find((a) => a._id === artisanId);
      if (!artisan) return sendErrorFeedback(res, 404, "Artisan not found");
      artisan.isVerified = status;
      artisan.verified = status;
      logEvent("verify", "artisan", 1, `Updated artisan ${artisanId} verification to ${status}`);
      return sendSuccessFeedback(res, status ? "Artisan verified" : "Verification cancelled");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const ApproveArtisan = (req: Request, res: Response) => {
    try {
      const { artisanId, status } = req.body;
      const artisan = artisans.find((a) => a._id === artisanId);
      if (!artisan) return sendErrorFeedback(res, 404, "Artisan not found");
      artisan.isApproved = status;
      logEvent("approve", "artisan", 1, `Updated artisan ${artisanId} approval to ${status}`);
      return sendSuccessFeedback(res, status ? "Artisan approved" : "Approval cancelled");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const ToggleArtisanActive = (req: Request, res: Response) => {
    try {
      const { isActive, userId } = req.body;
      const artisan = artisans.find((a) => a._id === userId);
      if (!artisan) return sendErrorFeedback(res, 404, "Artisan not found");
      artisan.isActive = isActive;
      logEvent("toggle_active", "artisan", 1, `Set artisan ${userId} active to ${isActive}`);
      return sendSuccessFeedback(res, isActive ? "Artisan activated" : "Artisan deactivated", artisan);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateArtisanPermissions = (req: Request, res: Response) => {
    try {
      const { userId, ...perms } = req.body;
      const artisan = artisans.find((a) => a._id === userId);
      if (!artisan) return sendErrorFeedback(res, 404, "Artisan not found");
      artisan.userPermissions = { ...artisan.userPermissions, ...perms };
      logEvent("update_permissions", "artisan", 1, `Updated artisan ${userId} permissions`);
      return sendSuccessFeedback(res, "Permissions updated", artisan);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetBusinessHours = (req: Request, res: Response) => {
    try {
      const dayShape = { openTime: "08:00", closeTime: "17:00" };
      return sendSuccessFeedback(res, "Business hours retrieved", {
        _id: `bizhrs_${req.params.id}`,
        artisan: req.params.id,
        monday: dayShape,
        tuesday: { openTime: "08:00", closeTime: "17:00" },
        wednesday: { openTime: "08:00", closeTime: "17:00" },
        thursday: { openTime: "08:00", closeTime: "17:00" },
        friday: { openTime: "08:00", closeTime: "17:00" },
        saturday: { openTime: "09:00", closeTime: "14:00" },
        sunday: { openTime: "closed", closeTime: "closed" },
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetRating = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Rating retrieved", {
        _id: `rating_${req.params.id}`,
        one: Math.floor(Math.random() * 5),
        two: Math.floor(Math.random() * 5),
        three: Math.floor(Math.random() * 10),
        four: Math.floor(5 + Math.random() * 15),
        five: Math.floor(10 + Math.random() * 20),
        totalRatingsCount: Math.floor(20 + Math.random() * 40),
        totalRatingsValue: Math.floor(80 + Math.random() * 150),
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        createdAt: daysAgo(Math.floor(Math.random() * 60)),
        artisan: req.params.id,
        updatedAt: daysAgo(Math.floor(Math.random() * 5)),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetViews = (_req: Request, res: Response) => {
    try {
      return res.json({ success: true, data: views, results: views.length });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetArtisanCategories = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = categories.slice(start, start + limit);
      return res.json({ success: true, data: items, results: categories.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetArtisanCategory = (req: Request, res: Response) => {
    try {
      const cat = categories.find((c) => c._id === req.params.id);
      if (!cat) return sendErrorFeedback(res, 404, "Category not found");
      return sendSuccessFeedback(res, "Category retrieved", cat);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  let nextCatId = categories.length + 1;
  const CreateOrUpdateArtisanCategory = (req: Request, res: Response) => {
    try {
      const { name, description, categoryId } = req.body;

      if (categoryId) {
        const cat = categories.find((c) => c._id === categoryId);
        if (cat) {
          if (name) cat.name = name;
          if (description) cat.description = description;
          logEvent("update", "category", 1, `Updated category: ${name}`);
          return sendSuccessFeedback(res, "Category updated", cat);
        }
      }

      const newCat: any = {
        _id: `cat_${nextCatId++}`,
        name: name || "Demo Category",
        description: description || "",
        image: "",
        services: [],
        createdAt: new Date().toISOString(),
        createdBy: "admin_1",
      };
      categories.push(newCat);
      logEvent("create", "category", 1, `Created category: ${newCat.name}`);
      return sendSuccessFeedback(res, "Category created", newCat);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const DeleteArtisanCategory = (req: Request, res: Response) => {
    try {
      const idx = categories.findIndex((c) => c._id === req.params.id);
      if (idx === -1) return sendErrorFeedback(res, 404, "Category not found");
      categories.splice(idx, 1);
      logEvent("delete", "category", 1, `Deleted category id: ${req.params.id}`);
      return sendSuccessFeedback(res, "Category deleted");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const CreateUser = (req: Request, res: Response) => {
    try {
      const { fullname, email, phone, role, companyName, gender, homeAddress, companyAddress, artisanCategory, nin } = req.body;

      if (req.headers["content-type"]?.includes("multipart")) {
        return sendSuccessFeedback(res, "Users imported successfully", { count: 5 });
      }

      const newId = customers.length + 1;
      const isArtisan = role === "artisan";

      if (isArtisan) {
        const newArtisan: any = {
          _id: `art_${newId + 50}`,
          userPermissions: { ...userPermissions },
          country: "Nigeria",
          role: "artisan",
          isActive: true,
          isVerified: false,
          verified: false,
          isApproved: false,
          resetCount: 0,
          verificationCount: 0,
          sendCodeTo: null,
          email: email || `newartisan${newId}@example.com`,
          fullname: fullname || `${pick(names.first)} ${pick(names.last)}`,
          phone: phone || `+23480${String(40000000 + newId).slice(0, 8)}`,
          ntfToken: "",
          createdAt: new Date().toISOString(),
          companyName: companyName || pick(names.artisanBusiness),
          firstname: fullname?.split(" ")[0] || pick(names.first),
          lastname: fullname?.split(" ")[1] || pick(names.last),
          location: { type: "Point", coordinates: [3.3792, 6.5244] },
          rating: 0,
          heroImage: [],
          services: null,
          rateCurrency: "NGN",
          deactivated: false,
          minNoticeHrs: 24,
          jobsCompleted: 0,
          jobsCancelled: 0,
          favourited: 0,
          views: 0,
          gender: gender || "male",
          homeAddress: homeAddress || "",
          nin: nin || "",
          category: artisanCategory || pick(catNames),
          companyAddress: companyAddress || "",
          photoUrl: "",
          lastVisitedAt: new Date().toISOString(),
        };
        artisans.unshift(newArtisan);
        logEvent("create", "artisan", 1, `Created artisan: ${newArtisan.fullname}`);
        return sendSuccessFeedback(res, "Artisan created successfully", newArtisan);
      }

      const newCustomer: any = {
        _id: `user_${newId + 30}`,
        userPermissions: { ...userPermissions },
        country: "Nigeria",
        role: "user",
        isActive: true,
        isVerified: false,
        resetCount: 0,
        verificationCount: 0,
        sendCodeTo: "email",
        email: email || `newuser${newId}@example.com`,
        fullname: fullname || `${pick(names.first)} ${pick(names.last)}`,
        firstname: fullname?.split(" ")[0] || pick(names.first),
        lastname: fullname?.split(" ")[1] || pick(names.last),
        phone: phone || `+23480${String(50000000 + newId).slice(0, 8)}`,
        ntfToken: "",
        createdAt: new Date().toISOString(),
        verificationCode: "",
        verificationExpires: "",
        resetExpires: "",
      };
      customers.unshift(newCustomer);
      logEvent("create", "user", 1, `Created user: ${newCustomer.fullname}`);
      return sendSuccessFeedback(res, "User created successfully", newCustomer);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateSelf = (req: Request, res: Response) => {
    try {
      const { fullname, phone } = req.body;
      const admin = sqlite
        .prepare("SELECT * FROM artisan_services_admin_admins WHERE id = 1")
        .get() as any;
      return sendSuccessFeedback(res, "Profile updated", { fullname, phone, email: admin.email });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetCustomers = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = customers.slice(start, start + limit);
      return res.json({ success: true, data: items, results: customers.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetCustomer = (req: Request, res: Response) => {
    try {
      const customer = customers.find((c) => c._id === req.params.id);
      if (!customer) return sendErrorFeedback(res, 404, "Customer not found");
      return sendSuccessFeedback(res, "Customer retrieved", customer);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const ToggleCustomerActive = (req: Request, res: Response) => {
    try {
      const { isActive, userId } = req.body;
      const customer = customers.find((c) => c._id === userId);
      if (!customer) return sendErrorFeedback(res, 404, "Customer not found");
      customer.isActive = isActive;
      logEvent("toggle_active", "user", 1, `Set user ${userId} active to ${isActive}`);
      return sendSuccessFeedback(res, isActive ? "User activated" : "User deactivated");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateCustomerPermissions = (req: Request, res: Response) => {
    try {
      const { userId, ...perms } = req.body;
      const customer = customers.find((c) => c._id === userId);
      if (!customer) return sendErrorFeedback(res, 404, "Customer not found");
      customer.userPermissions = { ...customer.userPermissions, ...perms };
      logEvent("update_permissions", "user", 1, `Updated user ${userId} permissions`);
      return sendSuccessFeedback(res, "Permissions updated");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetActiveCustomers = (req: Request, res: Response) => {
    try {
      const { status = "active" } = req.body;
      const active = status === "active";
      const filtered = customers.filter((c) => c.isActive === active);
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = filtered.slice(start, start + limit);
      return res.json({ success: true, data: items, results: filtered.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetVisits = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = customers.slice(start, start + limit).map((c) => ({
        _id: c._id,
        fullname: c.fullname,
        email: c.email,
        phone: c.phone,
        visits: Math.floor(1 + Math.random() * 50),
        lastVisit: daysAgo(Math.floor(Math.random() * 7)),
      }));
      return res.json({ success: true, data: items, results: customers.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetFeedbacks = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = feedbacks.slice(start, start + limit);
      return res.json({ success: true, data: items, results: feedbacks.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetFeedback = (req: Request, res: Response) => {
    try {
      const fb = feedbacks.find((f) => f._id === req.params.id);
      if (!fb) return sendErrorFeedback(res, 404, "Feedback not found");
      return sendSuccessFeedback(res, "Feedback retrieved", fb);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetUserRatings = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = userRatings.slice(start, start + limit);
      return res.json({ success: true, data: items, results: userRatings.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetAdmins = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const dbAdmins = sqlite
        .prepare("SELECT id, email, name, role, avatar, createdAt FROM artisan_services_admin_admins")
        .all() as any[];

      const items = dbAdmins.map((a) => ({
        _id: String(a.id),
        userPermissions: { ...defaultPermissions },
        fullname: a.name,
        phone: "+2348012345678",
        email: a.email,
        role: a.role,
        isVerified: true,
        isActive: true,
        ntfToken: "demo-ntf-token",
        createdAt: a.createdAt,
      }));

      const start = (page - 1) * limit;
      const sliced = items.slice(start, start + limit);
      return res.json({ success: true, data: sliced, results: items.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetAdmin = (req: Request, res: Response) => {
    try {
      const id = parseInt(String(req.params.id).replace("admin_", ""));
      const admin = sqlite
        .prepare("SELECT * FROM artisan_services_admin_admins WHERE id = ?")
        .get(id || 1) as any;
      if (!admin) return sendErrorFeedback(res, 404, "Admin not found");
      return sendSuccessFeedback(res, "Admin retrieved", {
        _id: String(admin.id),
        userPermissions: { ...defaultPermissions },
        fullname: admin.name,
        phone: "+2348012345678",
        email: admin.email,
        role: admin.role,
        isVerified: true,
        isActive: true,
        ntfToken: "demo-ntf-token",
        createdAt: admin.createdAt,
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const ToggleAdminActive = (req: Request, res: Response) => {
    try {
      const { isActive, userId } = req.body;
      const id = parseInt(userId.replace("admin_", ""));
      const admin = sqlite
        .prepare("SELECT * FROM artisan_services_admin_admins WHERE id = ?")
        .get(id || 1) as any;
      if (!admin) return sendErrorFeedback(res, 404, "Admin not found");
      logEvent("toggle_active", "admin", 1, `Set admin ${userId} active to ${isActive}`);
      return sendSuccessFeedback(res, isActive ? "Admin activated" : "Admin deactivated");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateAdminPermissions = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Permissions updated");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const CreateSuperAdmin = (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const admin = sqlite
        .prepare("SELECT * FROM artisan_services_admin_admins WHERE email = ?")
        .get(email) as any;
      if (!admin) return sendErrorFeedback(res, 404, "Admin not found");
      sqlite
        .prepare("UPDATE artisan_services_admin_admins SET role = 'superadmin' WHERE email = ?")
        .run(email);
      logEvent("create_superadmin", "auth", 1, `Made ${email} superadmin`);
      return sendSuccessFeedback(res, "Super admin created successfully");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetTickets = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = tickets.slice(start, start + limit);
      return res.json({ success: true, data: items, results: tickets.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const CreateTicket = (req: Request, res: Response) => {
    try {
      const { subject, comment } = req.body;
      const newTicket: any = {
        _id: `ticket_${tickets.length + 1}`,
        liveChat: false,
        status: "open",
        files: [],
        uid: `uid_new`,
        fullname: "Demo Admin",
        email: "demo@example.com",
        phone: "+2348011111111",
        subject: subject || "New Ticket",
        comment: comment || "",
        role: "admin",
        userId: "admin_1",
        attendingStaff: null,
        createdAt: new Date().toISOString(),
      };
      tickets.unshift(newTicket);
      logEvent("create", "ticket", 1, `Created ticket: ${newTicket.subject}`);
      return sendSuccessFeedback(res, "Ticket created successfully", newTicket);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateTicket = (req: Request, res: Response) => {
    try {
      const { ticketId, status, recipient, recipientId } = req.body;
      const ticket = tickets.find((t) => t._id === ticketId);
      if (!ticket) return sendErrorFeedback(res, 404, "Ticket not found");
      if (status) ticket.status = status;
      if (recipient && recipientId) {
        ticket.attendingStaff = { _id: recipientId, fullname: "Demo Admin", phone: "+2348011111111", email: "demo@example.com" };
      }
      logEvent("update", "ticket", 1, `Updated ticket: ${ticketId}`);
      return sendSuccessFeedback(res, "Ticket updated successfully", ticket);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const RespondToTicket = (req: Request, res: Response) => {
    try {
      const { ticketId, comment } = req.body;
      const newResp: any = {
        _id: `tresp_${ticketResponses.length + 1}`,
        files: [],
        uid: `uid_r_new`,
        ticketId,
        attendingStaff: "admin_1",
        createdAt: new Date().toISOString(),
        userId: "admin_1",
        fullname: "Demo Admin",
        role: "admin",
        comment: comment || "Response message",
      };
      ticketResponses.unshift(newResp);
      return sendSuccessFeedback(res, "Response sent successfully");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetTicketResponses = (req: Request, res: Response) => {
    try {
      const { ticketId } = req.body;
      const filtered = ticketResponses.filter((r) => r.ticketId === ticketId);
      return res.json({ success: true, data: filtered, results: filtered.length });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetDisputes = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = disputes.slice(start, start + limit);
      return res.json({ success: true, data: items, results: disputes.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const JoinDispute = (req: Request, res: Response) => {
    try {
      return sendSuccessFeedback(res, "Joined dispute");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const RespondToDispute = (req: Request, res: Response) => {
    try {
      const { disputeId, booking, comment } = req.body;
      const newResp: any = {
        _id: `dresp_${disputeResponses.length + 1}`,
        files: [],
        booking: booking || "",
        disputeId,
        createdAt: new Date().toISOString(),
        user: { _id: "admin_1", email: "demo@example.com", fullname: "Demo Admin", phone: "+2348011111111" },
        firstname: "Demo",
        role: "admin",
        comment: comment || "Response message",
        model: "Admin",
      };
      disputeResponses.unshift(newResp);
      return sendSuccessFeedback(res, "Response sent successfully");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetDisputeResponses = (req: Request, res: Response) => {
    try {
      const { disputeId } = req.body;
      const filtered = disputeResponses.filter((r) => r.disputeId === disputeId);
      return res.json({ success: true, data: filtered, results: filtered.length });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetAppointments = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = appointments.slice(start, start + limit);
      return res.json({ success: true, data: items, results: appointments.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetAppointment = (req: Request, res: Response) => {
    try {
      const appointment = appointments.find((a) => a._id === req.params.id);
      if (!appointment) return sendErrorFeedback(res, 404, "Appointment not found");
      return sendSuccessFeedback(res, "Appointment retrieved", appointment);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetNotifications = (req: Request, res: Response) => {
    try {
      const page = parseInt(req.body.page) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const items = notifications.slice(start, start + limit);
      return res.json({ success: true, data: items, results: notifications.length, page });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const MarkNotificationRead = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const notif = notifications.find((n) => n._id === id);
      if (notif) notif.isRead = true;
      return sendSuccessFeedback(res, "Notification marked as read");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateNotificationSettings = (req: Request, res: Response) => {
    try {
      const settings = req.body;
      return sendSuccessFeedback(res, "Notification settings updated", settings);
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const GetWaitingList = (_req: Request, res: Response) => {
    try {
      return res.json({ success: true, data: waitingList, results: waitingList.length });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const DeleteWaitingListEntry = (req: Request, res: Response) => {
    try {
      const idx = waitingList.findIndex((w) => w._id === req.params.id);
      if (idx === -1) return sendErrorFeedback(res, 404, "Entry not found");
      waitingList.splice(idx, 1);
      logEvent("delete", "waiting-list", 1, `Deleted waiting list entry: ${req.params.id}`);
      return sendSuccessFeedback(res, "Entry deleted");
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const UpdateProfileImage = (req: Request, res: Response) => {
    try {
      const admin = sqlite
        .prepare("SELECT * FROM artisan_services_admin_admins WHERE id = 1")
        .get() as any;
      return sendSuccessFeedback(res, "Profile image updated", {
        ...getAdminUserShape(admin),
        photoUrl: "https://i.pravatar.cc/150?u=demo_admin",
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  return {
    Login,
    Logout,
    VerifyAccount,
    SendVerification,
    ForgotPassword,
    ResetPassword,
    RegisterAdmin,
    UpdateEmail,
    UpdatePassword,
    Dashboard,
    GetArtisans,
    GetArtisan,
    VerifyArtisan,
    ApproveArtisan,
    ToggleArtisanActive,
    UpdateArtisanPermissions,
    GetBusinessHours,
    GetRating,
    GetViews,
    GetArtisanCategories,
    GetArtisanCategory,
    CreateOrUpdateArtisanCategory,
    DeleteArtisanCategory,
    CreateUser,
    UpdateSelf,
    GetCustomers,
    GetCustomer,
    ToggleCustomerActive,
    UpdateCustomerPermissions,
    GetActiveCustomers,
    GetVisits,
    GetFeedbacks,
    GetFeedback,
    GetUserRatings,
    GetAdmins,
    GetAdmin,
    ToggleAdminActive,
    UpdateAdminPermissions,
    CreateSuperAdmin,
    GetTickets,
    CreateTicket,
    UpdateTicket,
    RespondToTicket,
    GetTicketResponses,
    GetDisputes,
    JoinDispute,
    RespondToDispute,
    GetDisputeResponses,
    GetAppointments,
    GetAppointment,
    GetNotifications,
    MarkNotificationRead,
    UpdateNotificationSettings,
    GetWaitingList,
    DeleteWaitingListEntry,
    UpdateProfileImage,
  };
};
