import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { sendCatchFeedback } from "../../../functions/feedback.js";

export const ReportsController = () => {
  const ReportAnalytics = (req: Request, res: Response) => {
    try {
      const tests = sqlite.prepare("SELECT COUNT(*) as c FROM bq_tests WHERE user_id = ?").get(req.userId) as any;
      const reviews = sqlite.prepare("SELECT SUM(correct) as cr, SUM(mistakes) as mi FROM bq_test_reviews WHERE user_id = ?").get(req.userId) as any;
      return res.json({
        data: {
          total_tests: tests?.c || 0,
          total_correct: reviews?.cr || 0,
          total_mistakes: reviews?.mi || 0,
          total_questions: (reviews?.cr || 0) + (reviews?.mi || 0),
          average_score: (reviews?.cr || 0) + (reviews?.mi || 0) > 0 ? Math.round((reviews?.cr || 0) / ((reviews?.cr || 0) + (reviews?.mi || 0)) * 100) : 0,
          tests: ((req.body.type && req.body.type !== "all") ? sqlite.prepare("SELECT * FROM bq_tests WHERE user_id = ? ORDER BY id DESC LIMIT 10").all(req.userId) : sqlite.prepare("SELECT * FROM bq_tests WHERE user_id = ? ORDER BY id DESC LIMIT 10").all(req.userId)),
        },
      });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const UserPerformance = (req: Request, res: Response) => {
    try {
      const reviews = sqlite.prepare("SELECT * FROM bq_test_reviews WHERE user_id = ? ORDER BY id DESC").all(req.userId);
      const tests = sqlite.prepare("SELECT t.*, r.correct, r.mistakes, r.time as rtime FROM bq_tests t LEFT JOIN bq_test_reviews r ON t._id = r.test_id WHERE t.user_id = ? ORDER BY t.id DESC").all(req.userId);
      return res.json({ data: { reviews, tests, total: (reviews as any[]).length, more: false } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  return { ReportAnalytics, UserPerformance };
};
