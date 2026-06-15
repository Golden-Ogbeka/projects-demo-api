import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { AuthController, LearningController, PaymentController, ReportsController, AdminCrudController, MiscController } from "../controllers/index.js";
import { sendErrorFeedback, sendCatchFeedback } from "../../../functions/feedback.js";
import { sqlite } from "../../../config/db.js";
import { sendSuccessFeedback } from "../../../functions/feedback.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

const auth = AuthController();
const learning = LearningController();
const payment = PaymentController();
const reports = ReportsController();
const admin = AdminCrudController();
const misc = MiscController();

const decodeToken = (token: string) => {
  if (token.startsWith("demo-token-")) {
    const id = token.slice("demo-token-".length);
    return { id, isAdmin: id.startsWith("bq-admin-") };
  }
  return null;
};

const userAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return sendErrorFeedback(res, 401, "Unauthorized");
  const decoded = decodeToken(auth.slice(7));
  if (!decoded) return sendErrorFeedback(res, 401, "Invalid token");
  req.userId = decoded.id;
  next();
};

const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return sendErrorFeedback(res, 401, "Unauthorized");
  const decoded = decodeToken(auth.slice(7));
  if (!decoded?.isAdmin) return sendErrorFeedback(res, 403, "Forbidden");
  req.adminId = decoded.id;
  next();
};

// Health
router.get("/", (_req, res) => res.json({ success: true, message: "Bible Quiz Platform API running" }));

// ========================
// a1quest-web USER AUTH
// ========================
router.post("/auth/register", auth.Register);
router.post("/auth/verify-code", auth.VerifyCode);
router.post("/auth/verify-otp", auth.VerifyCode);
router.post("/auth/resend-code", auth.ResendCode);
router.post("/auth/login", auth.Login);
router.post("/auth/forgot-password", auth.ForgotPassword);
router.post("/auth/reset-password", auth.ResetPassword);
router.get("/auth/profile", userAuth, auth.GetProfile);
router.post("/auth/profile", userAuth, auth.UpdateProfile);
router.post("/auth/guardian", userAuth, auth.UpdateGuardian);
router.post("/auth/goal", userAuth, auth.UpdateGoal);
router.get("/auth/classes", auth.GetClasses);
router.get("/auth/countries", auth.GetCountries);
router.post("/auth/states", auth.GetStates);

// Legacy user route aliases
router.get("/user", userAuth, misc.GetProfile);
router.put("/user", userAuth, misc.UpdateProfile);
router.put("/update-password", userAuth, misc.UpdatePassword);
router.delete("/delete-account", userAuth, misc.DeleteAccount);

// ========================
// a1quest-web LEARNING
// ========================
router.post("/learning/classes", learning.ViewClasses);
router.post("/learning/view-classes", learning.ViewClasses);
router.post("/learning/popular-topics", learning.PopularTopics);
router.post("/learning/topics", learning.ViewTopics);
router.post("/learning/view-topics", learning.ViewTopics);
router.post("/learning/sub-topics", learning.ViewSubTopics);
router.post("/learning/view-sub-topics", learning.ViewSubTopics);
router.post("/learning/view-topic", learning.ViewTopic);
router.get("/learning/view-topic/:id", learning.ViewTopic);
router.post("/learning/view-sub-topic", learning.ViewSubTopic);
router.get("/learning/view-sub-topic/:id", learning.ViewSubTopic);
router.post("/learning/lessons", learning.ViewLessons);
router.post("/learning/view-lessons", learning.ViewLessons);
router.post("/learning/view-lesson", learning.ViewLesson);
router.get("/learning/view-lesson/:id", learning.ViewLesson);
router.post("/learning/take-test", userAuth, learning.TakeTest);
router.post("/learning/tests/:testId/answers", userAuth, learning.SubmitTestAnswers);
router.post("/learning/submit-test/:testId", userAuth, learning.SubmitTestAnswers);
router.get("/learning/tests/:testId/review", userAuth, learning.GetTestReview);
router.get("/learning/test-review/:testId", userAuth, learning.GetTestReview);
router.get("/learning/tests/:testId/test-performance", userAuth, learning.GetTestPerformance);
router.get("/learning/test-performance/:testId", userAuth, learning.GetTestPerformance);
router.post("/learning/tests", userAuth, learning.GetTests);
router.post("/learning/track-progress", userAuth, learning.TrackProgress);
router.post("/learning/track-progress-rate", userAuth, learning.TrackProgress);
router.get("/learning/user-lesson/:lessonId", userAuth, learning.GetUserLesson);
router.get("/learning/bookmarks", userAuth, learning.GetBookmarks);
router.post("/learning/bookmarks", userAuth, learning.CreateBookmark);
router.delete("/learning/bookmarks/:bookmarkId", userAuth, learning.DeleteBookmark);
router.get("/learning/enrolled-topics", userAuth, learning.GetEnrolledTopics);
router.post("/learning/enrolled-topics", userAuth, learning.GetEnrolledTopics);
router.post("/learning/:topicId/enroll", userAuth, learning.EnrollTopic);
router.get("/learning/enroll-topic/:topicId", userAuth, learning.EnrollTopic);
router.post("/learning/free-videos", learning.FreeVideos);
router.post("/learning/recent-learning", userAuth, learning.RecentLearning);
router.get("/learning/recent-learning", userAuth, learning.RecentLearning);
router.get("/learning/streak", userAuth, learning.GetStreak);

// ========================
// a1quest-web PAYMENT
// ========================
router.get("/payment/fetch-subscription-plans", payment.GetPlans);
router.post("/payment/plans", payment.GetPlans);
router.post("/payment/choose-subscription-plan", userAuth, (req, res) => {
  try {
    const plan = sqlite.prepare("SELECT * FROM bq_subscription_plans WHERE _id = ? OR name = ?").get(req.body.plan || req.body.plan_id, req.body.plan) as any;
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    return res.json({ data: { subscriptionAmount: plan.amount, subscriptionPlan: plan.name, duration: plan.duration || "monthly", createdAt: plan.createdAt, messages: [], _id: plan._id } });
  } catch (e) { return sendCatchFeedback(res, e); }
});
router.post("/payment/transaction", userAuth, (req, res) => {
  const ref = `BQ-DEMO-${Date.now()}`;
  sqlite.prepare("INSERT INTO bq_transactions (_id,user_id,amount,reference,status,createdAt) VALUES (?,?,?,?,?,?)").run(`bq-tx-${Date.now()}`, req.userId, req.body.amount || 0, ref, "pending", new Date().toISOString());
  return res.json({ data: ref });
});
router.get("/payment/wallet-balance", userAuth, (_req, res) => res.json({ data: 50000 }));
router.get("/payment/transaction-history", userAuth, (req, res) => {
  const rows = sqlite.prepare("SELECT * FROM bq_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 20").all(req.userId);
  const mapped = (rows as any[]).map((t: any) => ({ _id: t._id, owner: t.user_id, amount: t.amount, reference: t.reference, txnType: t.amount >= 0 ? "credit" : "debit", txnName: t.plan_name || "Subscription", status: t.status === "success" ? "successful" : t.status, gateway: t.gateway || "paystack", createdAt: t.createdAt }));
  return res.json({ data: mapped });
});
router.post("/payment/transfer", userAuth, (_req, res) => res.json({ data: { reference: `TRF-${Date.now()}` }, message: "Transfer initiated" }));
router.get("/payment/fetch-banks", (_req, res) => {
  return res.json({ data: [{ id: "1", code: "057", name: "Zenith Bank" }, { id: "2", code: "033", name: "United Bank For Africa" }, { id: "3", code: "011", name: "First Bank" }, { id: "4", code: "044", name: "Access Bank" }, { id: "5", code: "058", name: "GTBank" }] });
});
router.post("/payment/verify-bank-account", (_req, res) => res.json({ data: { account_number: _req.body.account_number, account_name: "John Doe", bank_id: _req.body.account_bank } }));
router.post("/payment/initiate", userAuth, payment.InitiatePayment);
router.get("/payment/verify/:reference", payment.VerifyPayment);
router.post("/payment/transactions", userAuth, payment.GetTransactions);

// ========================
// a1quest-web REPORTS
// ========================
router.get("/report-analytics/performance", userAuth, (_req, res) => {
  const reviews = sqlite.prepare("SELECT SUM(correct) as cr, SUM(mistakes) as mi FROM bq_test_reviews WHERE user_id = ?").get(_req.userId) as any;
  const total = (reviews?.cr || 0) + (reviews?.mi || 0);
  return res.json({ data: { total_tests: (sqlite.prepare("SELECT COUNT(*) as c FROM bq_tests WHERE user_id = ?").get(_req.userId) as any).c, total_correct: reviews?.cr || 0, total_mistakes: reviews?.mi || 0, total_questions: total, average_score: total > 0 ? Math.round((reviews?.cr || 0) / total * 100) : 0 } });
});
router.get("/report-analytics/topics", userAuth, (_req, res) => res.json({ data: [] }));
router.get("/report-analytics/topics/:id", userAuth, (_req, res) => res.json({ data: null }));
router.post("/report-analytics", userAuth, reports.ReportAnalytics);
router.get("/user-performance", userAuth, reports.UserPerformance);

// ========================
// a1quest-web LEADERBOARD / NOTIFICATIONS / MISC
// ========================
router.get("/leaderboards", misc.Leaderboard);
router.get("/leaderboard", misc.Leaderboard);
router.get("/notifications", userAuth, (req, res) => misc.Notifications(req, res));
router.post("/notifications/get", userAuth, (req, res) => misc.Notifications(req, res));
router.post("/notifications", userAuth, (_req, res) => res.json({ message: "Notification token saved" }));
router.patch("/notifications/:id", userAuth, (_req, res) => res.json({ message: "Notification updated" }));
router.get("/faqs", misc.Faqs);
router.get("/achievements", misc.Achievements);
router.post("/contact", misc.Contact);
router.get("/settings", userAuth, misc.GetSettings);
router.post("/settings", userAuth, misc.UpdateSettings);
router.get("/client-settings", misc.ClientSettings);
router.post("/client-settings", misc.UpdateClientSettings);
router.get("/upload-url", misc.GetUploadUrl);
router.post("/upload", upload.single("file"), misc.UploadFile);
router.post("/create-streak", userAuth, misc.CreateStreak);
router.get("/parents/children", userAuth, (req, res) => {
  const user = sqlite.prepare("SELECT * FROM bq_users WHERE _id = ?").get(req.userId) as any;
  return res.json({ data: { children: user ? [{ ...user, password: undefined }] : [] } });
});
router.get("/alert-adverts", (_req, res) => res.json({ data: [] }));

// ========================
// a1quest-admin-web ADMIN AUTH
// ========================
router.post("/admin/login", auth.AdminLogin);
router.get("/admin/profile", adminAuth, auth.AdminProfile);
router.post("/admin/forgot-password", auth.AdminForgotPassword);
router.post("/admin/reset-password", auth.AdminResetPassword);
router.post("/admin/verify-code", auth.AdminVerifyCode);
router.post("/admin/resend-code", auth.AdminResendCode);

// ========================
// a1quest-admin-web ADMIN DASHBOARD
// ========================
router.get("/admin-dashboard/count", adminAuth, (_req, res) => {
  try {
    const usersCount = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_users").get() as any).c;
    const subscribed = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_users WHERE subscription_active = 1").get() as any).c;
    const free = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_users WHERE freeAccess = 1").get() as any).c;
    return res.json({ data: { all_users_count: usersCount, subscribed_users: subscribed, active_users: free, inactive_users: Math.max(0, usersCount - free) } });
  } catch (e) { return sendCatchFeedback(res, e); }
});
router.get("/admin-dashboard/recent-users", adminAuth, (_req, res) => {
  const rows = sqlite.prepare("SELECT _id,email,firstName,lastName,createdAt FROM bq_users ORDER BY id DESC LIMIT 5").all();
  return res.json({ data: rows });
});
router.get("/admin-dashboard/admin-stats", adminAuth, (_req, res) => {
  const all = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_admin_users").get() as any).c;
  return res.json({ data: { all_admins_count: all, active_admins_count: all, inactive_admins_count: 0 } });
});
router.get("/admin-dashboard/classes-stats", adminAuth, (_req, res) => {
  const classes = sqlite.prepare("SELECT _id, name FROM bq_classes").all() as any[];
  const topics = sqlite.prepare("SELECT _id, class_id FROM bq_topics").all() as any[];
  const data = classes.map((c) => ({
    class: c.name, topics: topics.filter((t) => t.class_id === c._id).length,
    _id: c._id,
  }));
  return res.json({ data });
});

// ========================
// a1quest-admin-web CLASSES CRUD
// ========================
router.get("/classes", adminAuth, admin.ViewClasses);
router.get("/classes/:id", adminAuth, admin.ViewClass);
router.post("/classes", adminAuth, admin.CreateClass);
router.patch("/classes/:id", adminAuth, admin.UpdateClass);
router.delete("/classes/:id", adminAuth, admin.DeleteClass);

// ========================
// a1quest-admin-web TOPICS CRUD
// ========================
router.post("/topics/view-topics", adminAuth, admin.ViewTopics);
router.get("/topics/:id", adminAuth, admin.ViewTopic);
router.post("/topics", adminAuth, admin.CreateTopic);
router.patch("/topics/:id", adminAuth, admin.UpdateTopic);
router.delete("/topics/:id", adminAuth, admin.DeleteTopic);

// ========================
// a1quest-admin-web SUB-TOPICS CRUD
// ========================
router.post("/sub-topics/view-sub-topics", adminAuth, admin.ViewSubTopics);
router.get("/sub-topics/:id", adminAuth, admin.ViewSubTopic);
router.post("/sub-topics", adminAuth, admin.CreateSubTopic);
router.patch("/sub-topics/:id", adminAuth, admin.UpdateSubTopic);
router.delete("/sub-topics/:id", adminAuth, admin.DeleteSubTopic);

// ========================
// a1quest-admin-web LESSONS CRUD
// ========================
router.post("/lessons/view-lessons", adminAuth, admin.ViewLessons);
router.get("/lessons/:id", adminAuth, admin.ViewLesson);
router.post("/lessons", adminAuth, admin.CreateLesson);
router.patch("/lessons/:id", adminAuth, admin.UpdateLesson);
router.delete("/lessons/:id", adminAuth, admin.DeleteLesson);
router.post("/lessons/:id/upload-resources", adminAuth, upload.single("lessonResource"), (_req, res) => res.json({ message: "Resource uploaded", data: { resourceUrl: `https://demo-uploads.local/files/${Date.now()}.png` } }));
router.patch("/lessons/:id/remove-resources", adminAuth, (_req, res) => res.json({ message: "Resource removed" }));

// ========================
// a1quest-admin-web QUESTIONS CRUD
// ========================
router.post("/questions/view-questions", adminAuth, admin.ViewQuestions);
router.post("/questions", adminAuth, (req, res) => {
  const { topic_id, sub_topic_id, title, question_type, question_input_type, options } = req.body;
  const id = `bq-question-${Date.now()}`;
  sqlite.prepare("INSERT INTO bq_questions (_id,topic_id,sub_topic_id,title,question_type,question_input_type,options,createdAt) VALUES (?,?,?,?,?,?,?,?)").run(id, topic_id || "", sub_topic_id || "", title || "", question_type || "multiple", question_input_type || "", JSON.stringify(options || []), new Date().toISOString());
  return res.json({ message: "Question created", data: { _id: id, ...req.body, options: undefined } });
});
router.patch("/questions/:id", adminAuth, (req, res) => {
  const existing = sqlite.prepare("SELECT _id FROM bq_questions WHERE _id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ message: "Not found" });
  const { topic_id, sub_topic_id, title, question_type, question_input_type, options } = req.body;
  sqlite.prepare("UPDATE bq_questions SET topic_id=COALESCE(?,topic_id),sub_topic_id=COALESCE(?,sub_topic_id),title=COALESCE(?,title),question_type=COALESCE(?,question_type),question_input_type=COALESCE(?,question_input_type),options=COALESCE(?,options) WHERE _id=?").run(topic_id, sub_topic_id, title, question_type, question_input_type, options ? JSON.stringify(options) : null, req.params.id);
  return res.json({ message: "Question updated" });
});
router.delete("/questions/:id", adminAuth, admin.DeleteQuestion);

// ========================
// a1quest-admin-web ADMIN MANAGEMENT
// ========================
router.post("/admin-mgmt/get", adminAuth, (_req, res) => {
  const rows = sqlite.prepare("SELECT * FROM bq_admin_users ORDER BY id").all();
  return res.json({ data: rows, count: (rows as any[]).length });
});
router.get("/admin-mgmt/:id", adminAuth, (_req, res) => {
  const row = sqlite.prepare("SELECT * FROM bq_admin_users WHERE _id = ?").get(_req.params.id);
  if (!row) return res.status(404).json({ message: "Not found" });
  return res.json({ data: { ...(row as any), roles: [], populatedRoles: [] } });
});
router.post("/admin-mgmt", adminAuth, (_req, res) => {
  const { email, firstName, phoneNumber, userName, lastName, password, role } = _req.body;
  const id = `bq-admin-${Date.now()}`;
  sqlite.prepare("INSERT INTO bq_admin_users (_id,email,firstName,lastName,userName,phoneNumber,password,role,createdAt) VALUES (?,?,?,?,?,?,?,?,?)").run(id, email, firstName, lastName, userName || email?.split("@")[0], phoneNumber || "", password, role || "admin", new Date().toISOString());
  return res.json({ message: "Admin created", data: { _id: id, email, firstName, lastName, role } });
});
router.patch("/admin-mgmt/:id", adminAuth, (_req, res) => {
  const keys = Object.keys(_req.body).filter(k => k !== "_id" && k !== "id");
  if (keys.length) {
    const vals = keys.map(k => _req.body[k]);
    sqlite.prepare(`UPDATE bq_admin_users SET ${keys.map(k => `${k}=?`).join(",")} WHERE _id=?`).run(...vals, _req.params.id);
  }
  return res.json({ message: "Admin updated" });
});
router.delete("/admin-mgmt/:id", adminAuth, (_req, res) => {
  sqlite.prepare("DELETE FROM bq_admin_users WHERE _id = ?").run(_req.params.id);
  return res.json({ message: "Admin deleted" });
});
router.patch("/roles/assign-to-admin", adminAuth, (_req, res) => res.json({ message: "Roles assigned" }));

// ========================
// a1quest-admin-web ROLES & PERMISSIONS
// ========================
router.get("/roles", adminAuth, admin.ViewRoles);
router.get("/roles/permissions", adminAuth, (_req, res) => {
  const rows = sqlite.prepare("SELECT * FROM bq_permissions ORDER BY id").all();
  return res.json({ data: rows, count: (rows as any[]).length });
});
router.post("/roles", adminAuth, admin.CreateRole);
router.patch("/roles/:id", adminAuth, admin.UpdateRole);
router.delete("/roles/:id", adminAuth, admin.DeleteRole);

// ========================
// a1quest-admin-web USERS
// ========================
router.post("/users", adminAuth, (_req, res) => {
  const { page = 1, limit = 20, active, running, deleted } = _req.body;
  const offset = (Number(page) - 1) * Number(limit);
  let q = "SELECT * FROM bq_users WHERE 1=1";
  const params: any[] = [];
  if (active !== undefined) { q += " AND isFrozen = 0"; }
  if (deleted === true || deleted === 1) { q += " AND isDeleted = 1"; }
  sqlite.prepare(q + " ORDER BY id DESC LIMIT ? OFFSET ?").all(...params, Number(limit), offset);
  const rows = sqlite.prepare("SELECT * FROM bq_users ORDER BY id DESC LIMIT ? OFFSET ?").all(Number(limit), offset);
  const count = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_users").get() as any).c;
  return res.json({ data: rows.map((r: any) => ({ ...r, password: undefined })), count });
});
router.get("/users/:id", adminAuth, (_req, res) => {
  const row = sqlite.prepare("SELECT * FROM bq_users WHERE _id = ?").get(_req.params.id) as any;
  if (!row) return res.status(404).json({ message: "Not found" });
  return res.json({ data: { ...row, password: undefined } });
});
router.patch("/users/:id/unfreeze-user", adminAuth, (_req, res) => {
  sqlite.prepare("UPDATE bq_users SET isFrozen = 0 WHERE _id = ?").run(_req.params.id);
  return res.json({ message: "User unfrozen" });
});
router.get("/users/:id/performance", adminAuth, (_req, res) => res.json({ data: null }));
router.get("/users/:id/topics", adminAuth, (_req, res) => res.json({ data: [] }));
router.get("/users/:id/topics/:topicId", adminAuth, (_req, res) => res.json({ data: null }));
router.get("/users/:id/test-logs", adminAuth, (_req, res) => {
  const { page = 1 } = _req.query;
  const offset = (Number(page) - 1) * 20;
  const rows = sqlite.prepare("SELECT * FROM bq_test_reviews WHERE user_id = ? ORDER BY id DESC LIMIT 20 OFFSET ?").all(_req.params.id, offset);
  const count = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_test_reviews WHERE user_id = ?").get(_req.params.id) as any).c;
  return res.json({ data: rows, count });
});
router.post("/users/view-users", adminAuth, admin.ViewUsers);

// ========================
// a1quest-admin-web ACHIEVEMENTS
// ========================
router.get("/achievements", adminAuth, admin.ViewAchievements);
router.get("/achievements/:id", adminAuth, admin.ViewAchievement);
router.post("/achievements", adminAuth, upload.single("badge"), (_req, res) => {
  const { name, notification_message, points } = _req.body;
  const id = `bq-ach-${Date.now()}`;
  sqlite.prepare("INSERT INTO bq_achievements (_id,name,notification_message,points,badge,createdAt) VALUES (?,?,?,?,?,?)").run(id, name, notification_message, Number(points) || 0, "https://via.placeholder.com/100", new Date().toISOString());
  return res.json({ message: "Achievement created", data: { _id: id, name, notification_message, points } });
});
router.patch("/achievements/:id", adminAuth, upload.single("badge"), (_req, res) => {
  const keys = Object.keys(_req.body).filter(k => k !== "_id" && k !== "id");
  if (keys.length) {
    const vals = keys.map(k => _req.body[k]);
    sqlite.prepare(`UPDATE bq_achievements SET ${keys.map(k => `${k}=?`).join(",")} WHERE _id=?`).run(...vals, _req.params.id);
  }
  return res.json({ message: "Achievement updated" });
});
router.delete("/achievements/:id", adminAuth, admin.DeleteAchievement);

// ========================
// a1quest-admin-web FEEDBACK
// ========================
router.get("/admin-contact-us", adminAuth, (_req, res) => {
  const rows = sqlite.prepare("SELECT * FROM bq_feedbacks ORDER BY id DESC").all();
  return res.json({ data: rows, count: (rows as any[]).length });
});

// ========================
// a1quest-admin-web NOTIFICATION BROADCASTS
// ========================
router.post("/notification-broadcast/get", adminAuth, (_req, res) => {
  const rows = sqlite.prepare("SELECT * FROM bq_broadcasts ORDER BY id DESC").all();
  return res.json({ data: rows, count: (rows as any[]).length });
});
router.get("/notification-broadcast/:id", adminAuth, (_req, res) => {
  const row = sqlite.prepare("SELECT * FROM bq_broadcasts WHERE _id = ?").get(_req.params.id);
  if (!row) return res.status(404).json({ message: "Not found" });
  return res.json({ data: row });
});
router.post("/notification-broadcast", adminAuth, (_req, res) => {
  const { message, type } = _req.body;
  const id = `bq-bc-${Date.now()}`;
  sqlite.prepare("INSERT INTO bq_broadcasts (_id,message,type,createdAt) VALUES (?,?,?,?)").run(id, message || "", type || "in-app", new Date().toISOString());
  return res.json({ message: "Broadcast created", data: { _id: id, message, type } });
});

// ========================
// a1quest-admin-web NOTIFICATIONS
// ========================
router.post("/all/notification", adminAuth, (_req, res) => {
  const rows = sqlite.prepare("SELECT * FROM bq_notifications ORDER BY id DESC LIMIT 20").all();
  return res.json({ data: rows, count: (rows as any[]).length });
});

// ========================
// a1quest-admin-web ADMIN PROFILE/SETTINGS
// ========================
router.patch("/update-self", adminAuth, (_req, res) => res.json({ message: "Profile updated" }));
router.patch("/auth/update-password", adminAuth, (_req, res) => res.json({ message: "Password updated" }));
router.post("/auth/verify", adminAuth, (_req, res) => res.json({ message: "Code verified" }));
router.patch("/profile-image", adminAuth, upload.single("profileImage"), (_req, res) => res.json({ message: "Profile image updated", data: { profilePicture: `https://demo-uploads.local/files/${Date.now()}.png` } }));

// ========================
// LEGACY ADMIN ROUTES (from original implementation)
// ========================
router.get("/admin/dashboard", adminAuth, admin.Dashboard);
router.get("/admin/classes", adminAuth, admin.ViewClasses);
router.post("/admin/classes", adminAuth, admin.CreateClass);
router.get("/admin/classes/:id", adminAuth, admin.ViewClass);
router.put("/admin/classes/:id", adminAuth, admin.UpdateClass);
router.delete("/admin/classes/:id", adminAuth, admin.DeleteClass);
router.get("/admin/topics", adminAuth, admin.ViewTopics);
router.post("/admin/topics", adminAuth, admin.CreateTopic);
router.get("/admin/topics/:id", adminAuth, admin.ViewTopic);
router.put("/admin/topics/:id", adminAuth, admin.UpdateTopic);
router.delete("/admin/topics/:id", adminAuth, admin.DeleteTopic);
router.get("/admin/sub-topics", adminAuth, admin.ViewSubTopics);
router.post("/admin/sub-topics", adminAuth, admin.CreateSubTopic);
router.get("/admin/sub-topics/:id", adminAuth, admin.ViewSubTopic);
router.put("/admin/sub-topics/:id", adminAuth, admin.UpdateSubTopic);
router.delete("/admin/sub-topics/:id", adminAuth, admin.DeleteSubTopic);
router.get("/admin/lessons", adminAuth, admin.ViewLessons);
router.post("/admin/lessons", adminAuth, admin.CreateLesson);
router.get("/admin/lessons/:id", adminAuth, admin.ViewLesson);
router.put("/admin/lessons/:id", adminAuth, admin.UpdateLesson);
router.delete("/admin/lessons/:id", adminAuth, admin.DeleteLesson);
router.get("/admin/questions", adminAuth, admin.ViewQuestions);
router.post("/admin/questions", adminAuth, admin.CreateQuestion);
router.get("/admin/questions/:id", adminAuth, admin.ViewQuestion);
router.put("/admin/questions/:id", adminAuth, admin.UpdateQuestion);
router.delete("/admin/questions/:id", adminAuth, admin.DeleteQuestion);
router.get("/admin/users", adminAuth, admin.ViewUsers);
router.get("/admin/users/:id", adminAuth, admin.ViewUser);
router.delete("/admin/users/:id", adminAuth, admin.DeleteUser);
router.get("/admin/roles", adminAuth, admin.ViewRoles);
router.post("/admin/roles", adminAuth, admin.CreateRole);
router.get("/admin/roles/:id", adminAuth, admin.ViewRole);
router.put("/admin/roles/:id", adminAuth, admin.UpdateRole);
router.delete("/admin/roles/:id", adminAuth, admin.DeleteRole);
router.get("/admin/achievements", adminAuth, admin.ViewAchievements);
router.post("/admin/achievements", adminAuth, admin.CreateAchievement);
router.get("/admin/achievements/:id", adminAuth, admin.ViewAchievement);
router.put("/admin/achievements/:id", adminAuth, admin.UpdateAchievement);
router.delete("/admin/achievements/:id", adminAuth, admin.DeleteAchievement);
router.get("/admin/faqs", adminAuth, admin.ViewFaqs);
router.post("/admin/faqs", adminAuth, admin.CreateFaq);
router.get("/admin/faqs/:id", adminAuth, admin.ViewFaq);
router.put("/admin/faqs/:id", adminAuth, admin.UpdateFaq);
router.delete("/admin/faqs/:id", adminAuth, admin.DeleteFaq);
router.get("/admin/pending-feedbacks", adminAuth, admin.PendingFeedbacks);
router.get("/admin/feedbacks/:id", adminAuth, admin.ViewFaq);
router.delete("/admin/feedbacks/:id", adminAuth, admin.DeleteFaq);
router.get("/admin/transactions", adminAuth, admin.ViewTransactions);
router.delete("/admin/transactions/:id", adminAuth, admin.DeleteTransaction);
router.get("/admin/plans", adminAuth, admin.ViewPlans);
router.post("/admin/plans", adminAuth, admin.CreatePlan);
router.get("/admin/plans/:id", adminAuth, admin.ViewPlan);
router.put("/admin/plans/:id", adminAuth, admin.UpdatePlan);
router.delete("/admin/plans/:id", adminAuth, admin.DeletePlan);
router.get("/admin/leaderboard", adminAuth, admin.Leaderboard);
router.delete("/admin/leaderboard/reset", adminAuth, admin.LeaderboardReset);
router.get("/admin/broadcasts", adminAuth, admin.ViewBroadcasts);
router.post("/admin/broadcasts", adminAuth, admin.CreateBroadcast);
router.delete("/admin/broadcasts/:id", adminAuth, admin.DeleteBroadcast);
router.get("/admin/notifications", adminAuth, admin.ViewNotifications);
router.post("/admin/notifications", adminAuth, admin.CreateNotification);
router.delete("/admin/notifications/:id", adminAuth, admin.DeleteNotification);
router.get("/admin/client-settings", adminAuth, misc.ClientSettings);
router.post("/admin/client-settings", adminAuth, misc.UpdateClientSettings);
router.get("/admin/upload-url", adminAuth, misc.GetUploadUrl);
router.post("/admin/upload", adminAuth, upload.single("file"), misc.UploadFile);

export default router;
