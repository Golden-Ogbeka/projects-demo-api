import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { sendCatchFeedback } from "../../../functions/feedback.js";

const crud = (table: string, idColumn = "_id") => ({
  list: (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const rows = sqlite.prepare(`SELECT * FROM ${table} ORDER BY id DESC LIMIT ? OFFSET ?`).all(Number(limit), offset);
      const count = (sqlite.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as any).c;
      return res.json({ data: rows, count });
    } catch (e) { return sendCatchFeedback(res, e); }
  },
  get: (req: Request, res: Response) => {
    try {
      const row = sqlite.prepare(`SELECT * FROM ${table} WHERE ${idColumn} = ?`).get(req.params.id);
      if (!row) return res.status(404).json({ message: "Not found" });
      return res.json({ data: row });
    } catch (e) { return sendCatchFeedback(res, e); }
  },
  create: (req: Request, res: Response) => {
    try {
      const keys = Object.keys(req.body).filter(k => k !== "_id" && k !== "id");
      const vals = keys.map(k => req.body[k]);
      const id = `${table.replace(/^bq_/, "bq-")}-${Date.now()}`;
      sqlite.prepare(`INSERT INTO ${table} (_id,${keys.join(",")},createdAt) VALUES (?,${keys.map(() => "?").join(",")},?)`).run(id, ...vals, new Date().toISOString());
      return res.json({ message: "Created", data: { _id: id, ...req.body } });
    } catch (e) { return sendCatchFeedback(res, e); }
  },
  update: (req: Request, res: Response) => {
    try {
      const existing = sqlite.prepare(`SELECT ${idColumn} FROM ${table} WHERE ${idColumn} = ?`).get(req.params.id);
      if (!existing) return res.status(404).json({ message: "Not found" });
      const keys = Object.keys(req.body).filter(k => k !== "_id" && k !== "id");
      const vals = keys.map(k => req.body[k]);
      sqlite.prepare(`UPDATE ${table} SET ${keys.map(k => `${k}=?`).join(",")} WHERE ${idColumn}=?`).run(...vals, req.params.id);
      return res.json({ message: "Updated" });
    } catch (e) { return sendCatchFeedback(res, e); }
  },
  del: (req: Request, res: Response) => {
    try {
      sqlite.prepare(`DELETE FROM ${table} WHERE ${idColumn}=?`).run(req.params.id);
      return res.json({ message: "Deleted" });
    } catch (e) { return sendCatchFeedback(res, e); }
  },
});

export const AdminCrudController = () => {
  const classes = crud("bq_classes");
  const topics = crud("bq_topics");
  const subTopics = crud("bq_sub_topics");
  const lessons = crud("bq_lessons");
  const questions = crud("bq_questions");
  const users = crud("bq_users");
  const roles = crud("bq_roles");
  const achievements = crud("bq_achievements");
  const faqs = crud("bq_faqs");
  const feedbacks = crud("bq_feedbacks");
  const transactions = crud("bq_transactions");
  const plans = crud("bq_subscription_plans");
  const broadcasts = crud("bq_broadcasts");
  const notifications = crud("bq_notifications");

  const Dashboard = (_req: Request, res: Response) => {
    try {
      const usersCount = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_users").get() as any).c;
      const classesCount = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_classes").get() as any).c;
      const topicsCount = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_topics").get() as any).c;
      const lessonsCount = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_lessons").get() as any).c;
      const questionsCount = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_questions").get() as any).c;
      const plansCount = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_subscription_plans").get() as any).c;
      const enrollments = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_enrollments").get() as any).c;
      const revenue = (sqlite.prepare("SELECT COALESCE(SUM(amount),0) as total FROM bq_transactions WHERE status='success'").get() as any).total;
      return res.json({
        data: {
          users: usersCount, classes: classesCount, topics: topicsCount, lessons: lessonsCount,
          questions: questionsCount, active_subscriptions: plansCount, enrollments,
          total_revenue: revenue, total_transactions: 0, total_plans: plansCount,
        },
      });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const Leaderboard = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_leaderboard ORDER BY points DESC LIMIT 50").all();
      return res.json({ data: rows, count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const LeaderboardReset = (_req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_leaderboard").run();
      return res.json({ message: "Leaderboard reset" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const PendingFeedbacks = (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const rows = sqlite.prepare("SELECT * FROM bq_feedbacks ORDER BY id DESC LIMIT ? OFFSET ?").all(Number(limit), offset);
      const count = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_feedbacks").get() as any).c;
      return res.json({ data: rows, count });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  return {
    Dashboard, Leaderboard, LeaderboardReset, PendingFeedbacks,
    ViewClasses: classes.list, CreateClass: classes.create, ViewClass: classes.get,
    UpdateClass: classes.update, DeleteClass: classes.del,
    ViewTopics: topics.list, CreateTopic: topics.create, ViewTopic: topics.get,
    UpdateTopic: topics.update, DeleteTopic: topics.del,
    ViewSubTopics: subTopics.list, CreateSubTopic: subTopics.create, ViewSubTopic: subTopics.get,
    UpdateSubTopic: subTopics.update, DeleteSubTopic: subTopics.del,
    ViewLessons: lessons.list, CreateLesson: lessons.create, ViewLesson: lessons.get,
    UpdateLesson: lessons.update, DeleteLesson: lessons.del,
    ViewQuestions: questions.list, CreateQuestion: questions.create, ViewQuestion: questions.get,
    UpdateQuestion: questions.update, DeleteQuestion: questions.del,
    ViewUsers: users.list, ViewUser: users.get, DeleteUser: users.del,
    ViewRoles: roles.list, CreateRole: roles.create, ViewRole: roles.get,
    UpdateRole: roles.update, DeleteRole: roles.del,
    ViewAchievements: achievements.list, CreateAchievement: achievements.create,
    ViewAchievement: achievements.get, UpdateAchievement: achievements.update,
    DeleteAchievement: achievements.del,
    ViewFaqs: faqs.list, CreateFaq: faqs.create, ViewFaq: faqs.get,
    UpdateFaq: faqs.update, DeleteFaq: faqs.del,
    ViewTransactions: transactions.list, DeleteTransaction: transactions.del,
    ViewPlans: plans.list, CreatePlan: plans.create, ViewPlan: plans.get,
    UpdatePlan: plans.update, DeletePlan: plans.del,
    ViewBroadcasts: broadcasts.list, CreateBroadcast: broadcasts.create, DeleteBroadcast: broadcasts.del,
    ViewNotifications: notifications.list, CreateNotification: notifications.create, DeleteNotification: notifications.del,
  };
};
