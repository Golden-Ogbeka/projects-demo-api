import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { sendCatchFeedback } from "../../../functions/feedback.js";

export const MiscController = () => {
  const Leaderboard = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_leaderboard ORDER BY points DESC LIMIT 20").all();
      return res.json({ data: rows, count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const Notifications = (req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_notifications WHERE user_id = ? OR user_id = '' ORDER BY id DESC LIMIT 20").all(req.userId);
      return res.json({ data: rows, count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const Faqs = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_faqs ORDER BY id").all();
      return res.json({ data: rows, count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const Achievements = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_achievements ORDER BY id").all();
      return res.json({ data: rows, count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const Contact = (req: Request, res: Response) => {
    try {
      sqlite.prepare("INSERT INTO bq_feedbacks (_id,user_id,name,email,message,createdAt) VALUES (?,?,?,?,?,?)").run(`bq-fb-${Date.now()}`, req.userId || "", req.body.name || "", req.body.email || "", req.body.message || "", new Date().toISOString());
      return res.json({ success: true, message: "Feedback submitted" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ResetPassword = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT _id FROM bq_users WHERE email = ?").get(req.body.email) as any;
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      return res.json({ success: true, message: "Password reset link sent to your email" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const UpdatePassword = (req: Request, res: Response) => {
    try {
      if (req.body.password) sqlite.prepare("UPDATE bq_users SET password = ? WHERE _id = ?").run(req.body.password, req.userId);
      return res.json({ success: true, message: "Password updated" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const UpdateProfile = (req: Request, res: Response) => {
    try {
      const keys = Object.keys(req.body).filter(k => k !== "_id" && k !== "id" && k !== "password");
      if (keys.length) {
        const vals = keys.map(k => req.body[k]);
        sqlite.prepare(`UPDATE bq_users SET ${keys.map(k => `${k}=?`).join(",")} WHERE _id=?`).run(...vals, req.userId);
      }
      const user = sqlite.prepare("SELECT * FROM bq_users WHERE _id = ?").get(req.userId) as any;
      return res.json({ success: true, message: "Profile updated", data: { ...user, password: undefined } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetProfile = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT * FROM bq_users WHERE _id = ?").get(req.userId) as any;
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ data: { ...user, password: undefined } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetSettings = (req: Request, res: Response) => {
    try {
      const row = sqlite.prepare("SELECT * FROM bq_settings WHERE user_id = ?").get(req.userId);
      return res.json({ data: row || {} });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const UpdateSettings = (req: Request, res: Response) => {
    try {
      const existing = sqlite.prepare("SELECT id FROM bq_settings WHERE user_id = ?").get(req.userId);
      const data = JSON.stringify(req.body);
      if (existing) sqlite.prepare("UPDATE bq_settings SET data = ? WHERE user_id = ?").run(data, req.userId);
      else sqlite.prepare("INSERT INTO bq_settings (_id,user_id,data,createdAt) VALUES (?,?,?,?)").run(`bq-set-${Date.now()}`, req.userId, data, new Date().toISOString());
      return res.json({ message: "Settings saved" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ClientSettings = (_req: Request, res: Response) => {
    try {
      const row = sqlite.prepare("SELECT * FROM bq_client_settings ORDER BY id DESC LIMIT 1").get();
      return res.json({ data: row || {} });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const UpdateClientSettings = (req: Request, res: Response) => {
    try {
      const data = JSON.stringify(req.body);
      const existing = sqlite.prepare("SELECT id FROM bq_client_settings ORDER BY id DESC LIMIT 1").get();
      if (existing) sqlite.prepare("UPDATE bq_client_settings SET data = ?").run(data);
      else sqlite.prepare("INSERT INTO bq_client_settings (_id,data,createdAt) VALUES (?,?,?)").run("bq-cs-1", data, new Date().toISOString());
      return res.json({ message: "Client settings saved" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetUploadUrl = (_req: Request, res: Response) => {
    return res.json({ data: { url: "https://demo-uploads.local/upload", fileUrl: "https://demo-uploads.local/files/", key: "" } });
  };

  const UploadFile = (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File | undefined;
    const url = file ? `https://demo-uploads.local/files/${file.originalname || "upload"}-${Date.now()}.png` : `https://demo-uploads.local/files/upload-${Date.now()}.png`;
    return res.json({ success: true, data: { url } });
  };

  const CreateStreak = (req: Request, res: Response) => {
    try {
      sqlite.prepare("INSERT INTO bq_streaks (_id,user_id,date,createdAt) VALUES (?,?,?,?)").run(`bq-str-${Date.now()}`, req.userId, new Date().toISOString().split("T")[0], new Date().toISOString());
      return res.json({ message: "Streak recorded" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const DeleteAccount = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_users WHERE _id = ?").run(req.userId);
      ["bq_progress", "bq_tests", "bq_test_reviews", "bq_enrollments", "bq_bookmarks", "bq_streaks", "bq_notifications", "bq_settings"].forEach(t => sqlite.prepare(`DELETE FROM ${t} WHERE user_id=?`).run(req.userId));
      return res.json({ success: true, message: "Account deleted" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  return { Leaderboard, Notifications, Faqs, Achievements, Contact, ResetPassword, UpdatePassword, UpdateProfile, GetProfile, GetSettings, UpdateSettings, ClientSettings, UpdateClientSettings, GetUploadUrl, UploadFile, CreateStreak, DeleteAccount };
};
