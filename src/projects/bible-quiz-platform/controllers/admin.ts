import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { sendCatchFeedback } from "../../../functions/feedback.js";

const parseJson = (val: string) => { try { return JSON.parse(val); } catch { return val; } };

export const AdminController = () => {
  const GetDashboardStats = (_req: Request, res: Response) => {
    try {
      const totalUsers = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_users").get() as any).c;
      const totalClasses = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_classes").get() as any).c;
      const totalTopics = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_topics").get() as any).c;
      const totalLessons = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_lessons").get() as any).c;
      const totalQuestions = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_questions").get() as any).c;
      const totalTransactions = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_transactions").get() as any).c;
      const totalRevenue = (sqlite.prepare("SELECT COALESCE(SUM(amount),0) as t FROM bq_transactions WHERE status = 'successful' AND txnType = 'debit'").get() as any).t;
      const activeSubs = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_users WHERE subscription_active = 1").get() as any).c;
      const totalEnrollments = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_enrollments").get() as any).c;
      return res.json({ success: true, message: "Dashboard stats", data: { totalUsers, totalClasses, totalTopics, totalLessons, totalQuestions, totalTransactions, totalRevenue, activeSubs, totalEnrollments } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetUsers = (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      let rows: any[];
      let count: number;
      if (search) {
        rows = sqlite.prepare("SELECT * FROM bq_users WHERE email LIKE ? OR firstName LIKE ? OR lastName LIKE ? OR userName LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?").all(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, Number(limit), offset);
        count = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_users WHERE email LIKE ? OR firstName LIKE ? OR lastName LIKE ? OR userName LIKE ?").get(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`) as any).c;
      } else {
        rows = sqlite.prepare("SELECT * FROM bq_users ORDER BY id DESC LIMIT ? OFFSET ?").all(Number(limit), offset);
        count = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_users").get() as any).c;
      }
      rows = rows.map((r: any) => { const { password, verificationCode, verificationCodeExpires, resetCode, resetExpires, passwordChangedAt, ...safe } = r; return safe; });
      return res.json({ success: true, message: "Users retrieved", data: rows, count });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetUser = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT * FROM bq_users WHERE _id = ?").get(req.params.id) as any;
      if (!user) return res.json({ success: false, message: "User not found", data: null });
      const { password, verificationCode, verificationCodeExpires, resetCode, resetExpires, passwordChangedAt, ...safe } = user;
      return res.json({ success: true, message: "User retrieved", data: safe });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const UpdateUser = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT id FROM bq_users WHERE _id = ?").get(req.params.id) as any;
      if (!user) return res.json({ success: false, message: "User not found", data: null });
      const { firstName, lastName, userName, email, classLevel, country, countryState, gender, school, isVerified, isFrozen, role, subscription_plan, subscription_active, freeAccess } = req.body;
      sqlite.prepare(`UPDATE bq_users SET firstName=COALESCE(?,firstName),lastName=COALESCE(?,lastName),userName=COALESCE(?,userName),email=COALESCE(?,email),classLevel=COALESCE(?,classLevel),country=COALESCE(?,country),countryState=COALESCE(?,countryState),gender=COALESCE(?,gender),school=COALESCE(?,school),isVerified=COALESCE(?,isVerified),isFrozen=COALESCE(?,isFrozen),role=COALESCE(?,role),subscription_plan=COALESCE(?,subscription_plan),subscription_active=COALESCE(?,subscription_active),freeAccess=COALESCE(?,freeAccess) WHERE id=?`).run(firstName, lastName, userName, email, classLevel, country, countryState, gender, school, isVerified, isFrozen, role, subscription_plan, subscription_active, freeAccess, user.id);
      return res.json({ success: true, message: "User updated", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteUser = (req: Request, res: Response) => {
    try {
      sqlite.prepare("UPDATE bq_users SET isDeleted = 1 WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "User deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateClass = (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      const id = `bq-class-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_classes (_id,name,createdAt) VALUES (?,?,?)").run(id, name, new Date().toISOString());
      return res.json({ success: true, message: "Class created", data: { _id: id, name } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const UpdateClass = (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      sqlite.prepare("UPDATE bq_classes SET name = ? WHERE _id = ?").run(name, req.params.id);
      return res.json({ success: true, message: "Class updated", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteClass = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_classes WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Class deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateTopic = (req: Request, res: Response) => {
    try {
      const { title, class_id, description, test_notice, num_of_questions, test_duration } = req.body;
      const id = `bq-topic-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_topics (_id,title,class_id,description,test_notice,num_of_questions,test_duration,createdAt) VALUES (?,?,?,?,?,?,?,?)").run(id, title, class_id, description || "", test_notice || "", num_of_questions || 10, test_duration || 30, new Date().toISOString());
      return res.json({ success: true, message: "Topic created", data: { _id: id, title } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const UpdateTopic = (req: Request, res: Response) => {
    try {
      const { title, class_id, description, test_notice, num_of_questions, test_duration } = req.body;
      sqlite.prepare("UPDATE bq_topics SET title=COALESCE(?,title),class_id=COALESCE(?,class_id),description=COALESCE(?,description),test_notice=COALESCE(?,test_notice),num_of_questions=COALESCE(?,num_of_questions),test_duration=COALESCE(?,test_duration) WHERE _id=?").run(title, class_id, description, test_notice, num_of_questions, test_duration, req.params.id);
      return res.json({ success: true, message: "Topic updated", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteTopic = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_topics WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Topic deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateSubTopic = (req: Request, res: Response) => {
    try {
      const { title, description, topic_id, test_notice, num_of_questions, test_duration } = req.body;
      const id = `bq-sub-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_sub_topics (_id,title,description,topic_id,test_notice,num_of_questions,test_duration,createdAt) VALUES (?,?,?,?,?,?,?,?)").run(id, title, description || "", topic_id, test_notice || "", num_of_questions || 10, test_duration || 30, new Date().toISOString());
      return res.json({ success: true, message: "Sub topic created", data: { _id: id, title } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const UpdateSubTopic = (req: Request, res: Response) => {
    try {
      const { title, description, topic_id, test_notice, num_of_questions, test_duration } = req.body;
      sqlite.prepare("UPDATE bq_sub_topics SET title=COALESCE(?,title),description=COALESCE(?,description),topic_id=COALESCE(?,topic_id),test_notice=COALESCE(?,test_notice),num_of_questions=COALESCE(?,num_of_questions),test_duration=COALESCE(?,test_duration) WHERE _id=?").run(title, description, topic_id, test_notice, num_of_questions, test_duration, req.params.id);
      return res.json({ success: true, message: "Sub topic updated", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteSubTopic = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_sub_topics WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Sub topic deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateLesson = (req: Request, res: Response) => {
    try {
      const { title, description, topic_id, sub_topic_id, resourceUrl } = req.body;
      const id = `bq-lesson-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_lessons (_id,title,description,topic_id,sub_topic_id,resourceUrl,currentTime,createdAt) VALUES (?,?,?,?,?,?,?,?)").run(id, title, description || "", topic_id, sub_topic_id || "", resourceUrl || "", 0, new Date().toISOString());
      return res.json({ success: true, message: "Lesson created", data: { _id: id, title } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const UpdateLesson = (req: Request, res: Response) => {
    try {
      const { title, description, topic_id, sub_topic_id, resourceUrl } = req.body;
      sqlite.prepare("UPDATE bq_lessons SET title=COALESCE(?,title),description=COALESCE(?,description),topic_id=COALESCE(?,topic_id),sub_topic_id=COALESCE(?,sub_topic_id),resourceUrl=COALESCE(?,resourceUrl) WHERE _id=?").run(title, description, topic_id, sub_topic_id, resourceUrl, req.params.id);
      return res.json({ success: true, message: "Lesson updated", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteLesson = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_lessons WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Lesson deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateQuestion = (req: Request, res: Response) => {
    try {
      const { title, question_type, question_input_type, topic_id, sub_topic_id, options } = req.body;
      const id = `bq-q-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_questions (_id,title,question_type,question_input_type,topic_id,sub_topic_id,options,createdAt) VALUES (?,?,?,?,?,?,?,?)").run(id, title, question_type || "radio", question_input_type || "", topic_id, sub_topic_id || "", JSON.stringify(options || []), new Date().toISOString());
      return res.json({ success: true, message: "Question created", data: { _id: id } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const UpdateQuestion = (req: Request, res: Response) => {
    try {
      const { title, question_type, question_input_type, topic_id, sub_topic_id, options } = req.body;
      sqlite.prepare("UPDATE bq_questions SET title=COALESCE(?,title),question_type=COALESCE(?,question_type),question_input_type=COALESCE(?,question_input_type),topic_id=COALESCE(?,topic_id),sub_topic_id=COALESCE(?,sub_topic_id),options=COALESCE(?,options) WHERE _id=?").run(title, question_type, question_input_type, topic_id, sub_topic_id, options ? JSON.stringify(options) : null, req.params.id);
      return res.json({ success: true, message: "Question updated", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteQuestion = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_questions WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Question deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateSubscriptionPlan = (req: Request, res: Response) => {
    try {
      const { name, description, amount, duration_days, features, popular } = req.body;
      const id = `bq-plan-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_subscription_plans (_id,name,description,amount,duration_days,features,popular,createdAt) VALUES (?,?,?,?,?,?,?,?)").run(id, name, description || "", amount || 0, duration_days || 30, JSON.stringify(features || []), popular ? 1 : 0, new Date().toISOString());
      return res.json({ success: true, message: "Plan created", data: { _id: id } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const UpdateSubscriptionPlan = (req: Request, res: Response) => {
    try {
      const { name, description, amount, duration_days, features, popular } = req.body;
      sqlite.prepare("UPDATE bq_subscription_plans SET name=COALESCE(?,name),description=COALESCE(?,description),amount=COALESCE(?,amount),duration_days=COALESCE(?,duration_days),features=COALESCE(?,features),popular=COALESCE(?,popular) WHERE _id=?").run(name, description, amount, duration_days, features ? JSON.stringify(features) : null, popular, req.params.id);
      return res.json({ success: true, message: "Plan updated", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteSubscriptionPlan = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_subscription_plans WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Plan deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetTransactions = (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const rows = sqlite.prepare("SELECT * FROM bq_transactions ORDER BY id DESC LIMIT ? OFFSET ?").all(Number(limit), offset);
      const count = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_transactions").get() as any).c;
      return res.json({ success: true, message: "Transactions retrieved", data: rows, count });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetRoles = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_roles ORDER BY id").all();
      rows.forEach((r: any) => { r.permissions = parseJson(r.permissions); });
      return res.json({ success: true, message: "Roles retrieved", data: rows, count: (rows as any[]).length });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateRole = (req: Request, res: Response) => {
    try {
      const { name, permissions } = req.body;
      const id = `bq-role-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_roles (_id,name,permissions,createdAt) VALUES (?,?,?,?)").run(id, name, JSON.stringify(permissions || []), new Date().toISOString());
      return res.json({ success: true, message: "Role created", data: { _id: id } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetPermissions = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_permissions ORDER BY id").all();
      return res.json({ success: true, message: "Permissions retrieved", data: rows, count: (rows as any[]).length });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetAchievements = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_achievements ORDER BY id").all();
      return res.json({ success: true, message: "Achievements retrieved", data: rows, count: (rows as any[]).length });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateAchievement = (req: Request, res: Response) => {
    try {
      const { name, notification_message, badge, points } = req.body;
      const id = `bq-ach-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_achievements (_id,name,notification_message,badge,points,createdAt) VALUES (?,?,?,?,?,?)").run(id, name, notification_message || "", badge || "", points || 0, new Date().toISOString());
      return res.json({ success: true, message: "Achievement created", data: { _id: id } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteAchievement = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_achievements WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Achievement deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetFAQs = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_faqs ORDER BY id").all();
      return res.json({ success: true, message: "FAQs retrieved", data: rows, count: (rows as any[]).length });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateFAQ = (req: Request, res: Response) => {
    try {
      const { question, answer } = req.body;
      const id = `bq-faq-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_faqs (_id,question,answer,createdAt) VALUES (?,?,?,?)").run(id, question, answer, new Date().toISOString());
      return res.json({ success: true, message: "FAQ created", data: { _id: id } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteFAQ = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_faqs WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "FAQ deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetFeedback = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_feedback ORDER BY id DESC").all();
      return res.json({ success: true, message: "Feedback retrieved", data: rows, count: (rows as any[]).length });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteFeedback = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_feedback WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Feedback deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetBroadcasts = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_broadcasts ORDER BY id DESC").all();
      return res.json({ success: true, message: "Broadcasts retrieved", data: rows, count: (rows as any[]).length });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateBroadcast = (req: Request, res: Response) => {
    try {
      const { message, type } = req.body;
      const id = `bq-brd-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_broadcasts (_id,admin_id,message,type,createdAt) VALUES (?,?,?,?,?)").run(id, req.adminId, message, type || "in-app", new Date().toISOString());
      return res.json({ success: true, message: "Broadcast sent", data: { _id: id } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteBroadcast = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_broadcasts WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Broadcast deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetLeaderboard = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_leaderboard ORDER BY points DESC LIMIT 100").all();
      return res.json({ success: true, message: "Leaderboard retrieved", data: rows, count: (rows as any[]).length });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const GetAdmins = (_req: Request, res: Response) => {
    try {
      let rows = sqlite.prepare("SELECT * FROM bq_admin_users ORDER BY id").all();
      rows = rows.map((r: any) => { const { password: _, ...safe } = r; return safe; }) as any;
      return res.json({ success: true, message: "Admins retrieved", data: rows, count: (rows as any[]).length });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const CreateAdmin = (req: Request, res: Response) => {
    try {
      const { email, firstName, lastName, userName, phoneNumber, password, role } = req.body;
      const existing = sqlite.prepare("SELECT id FROM bq_admin_users WHERE email = ?").get(email);
      if (existing) return res.json({ success: false, message: "Email already exists", data: null });
      const id = `bq-admin-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_admin_users (_id,email,firstName,lastName,userName,phoneNumber,password,role,createdAt) VALUES (?,?,?,?,?,?,?,?,?)").run(id, email, firstName, lastName, userName || email.split("@")[0], phoneNumber || "", password, role || "admin", new Date().toISOString());
      return res.json({ success: true, message: "Admin created", data: { _id: id } });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const UpdateAdmin = (req: Request, res: Response) => {
    try {
      const { firstName, lastName, userName, phoneNumber, email, role } = req.body;
      sqlite.prepare("UPDATE bq_admin_users SET firstName=COALESCE(?,firstName),lastName=COALESCE(?,lastName),userName=COALESCE(?,userName),phoneNumber=COALESCE(?,phoneNumber),email=COALESCE(?,email),role=COALESCE(?,role) WHERE _id=?").run(firstName, lastName, userName, phoneNumber, email, role, req.params.id);
      return res.json({ success: true, message: "Admin updated", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  const DeleteAdmin = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_admin_users WHERE _id = ?").run(req.params.id);
      return res.json({ success: true, message: "Admin deleted", data: null });
    } catch (error) { return sendCatchFeedback(res, error); }
  };

  return { GetDashboardStats, GetUsers, GetUser, UpdateUser, DeleteUser, CreateClass, UpdateClass, DeleteClass, CreateTopic, UpdateTopic, DeleteTopic, CreateSubTopic, UpdateSubTopic, DeleteSubTopic, CreateLesson, UpdateLesson, DeleteLesson, CreateQuestion, UpdateQuestion, DeleteQuestion, CreateSubscriptionPlan, UpdateSubscriptionPlan, DeleteSubscriptionPlan, GetTransactions, GetRoles, CreateRole, GetPermissions, GetAchievements, CreateAchievement, DeleteAchievement, GetFAQs, CreateFAQ, DeleteFAQ, GetFeedback, DeleteFeedback, GetBroadcasts, CreateBroadcast, DeleteBroadcast, GetLeaderboard, GetAdmins, CreateAdmin, UpdateAdmin, DeleteAdmin };
};
