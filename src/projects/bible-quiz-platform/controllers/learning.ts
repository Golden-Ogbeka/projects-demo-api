import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { sendCatchFeedback } from "../../../functions/feedback.js";

const parseJson = (v: string) => { try { return JSON.parse(v); } catch { return v || []; } };

const mapTopic = (t: any) => t ? {
  _id: t._id, title: t.title, description: t.description || "", class_id: t.class_id,
  sub_topics: [], created_by: "", last_updated_by: "", creation_date: t.createdAt,
  last_update_date: t.createdAt, num_of_enrollments: 0, num_of_questions: t.num_of_questions || 0,
  test_duration: t.test_duration || 0, test_notice: t.test_notice || "",
  can_take_test: true, progress_rate: 0,
} : null;

const mapSubTopic = (s: any) => s ? {
  _id: s._id, title: s.title, description: s.description || "", topic_id: s.topic_id,
  created_by: "", last_updated_by: "", creation_date: s.createdAt, last_update_date: s.createdAt,
  num_of_questions: s.num_of_questions || 0, test_duration: s.test_duration || 0,
  test_notice: s.test_notice || "", can_take_test: true, completed: false,
} : null;

const parseResources = (l: any) => {
  if (l.videoUrl) return { video_url: l.videoUrl, audio_url: l.audioUrl || "", document_url: l.documentUrl || "" };
  try { const j = JSON.parse(l.resourceUrl || "{}"); return { video_url: j.videoUrl || "", audio_url: j.audioUrl || "", document_url: j.documentUrl || "" }; }
  catch { return { video_url: l.resourceUrl || "", audio_url: "", document_url: "" }; }
};

const mapLesson = (l: any) => {
  const r = parseResources(l);
  return l ? {
    _id: l._id, title: l.title, description: l.description || "", topic_id: l.topic_id,
    sub_topic_id: l.sub_topic_id || "", created_by: "", last_updated_by: "",
    creation_date: l.createdAt, last_update_date: l.createdAt,
    document_identifier: "", document_url: r.document_url, audio_identifier: "", audio_url: r.audio_url,
    video_identifier: "", video_url: r.video_url,
  } : null;
};

export const LearningController = () => {
  const ViewClasses = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_classes ORDER BY id").all();
      return res.json({ data: rows, count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ViewCbt = ViewClasses;

  const PopularTopics = (req: Request, res: Response) => {
    try {
      const rows = req.body.class_id
        ? sqlite.prepare("SELECT * FROM bq_topics WHERE class_id = ? ORDER BY RANDOM() LIMIT 4").all(req.body.class_id)
        : sqlite.prepare("SELECT * FROM bq_topics ORDER BY RANDOM() LIMIT 4").all();
      return res.json({ data: rows.map(mapTopic), count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ViewTopics = (req: Request, res: Response) => {
    try {
      const rows = req.body.class_id
        ? sqlite.prepare("SELECT * FROM bq_topics WHERE class_id = ? ORDER BY id").all(req.body.class_id)
        : sqlite.prepare("SELECT * FROM bq_topics ORDER BY id").all();
      return res.json({ data: rows.map(mapTopic), count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ViewSubTopics = (req: Request, res: Response) => {
    try {
      const rows = req.body.topic_id
        ? sqlite.prepare("SELECT * FROM bq_sub_topics WHERE topic_id = ? ORDER BY id").all(req.body.topic_id)
        : sqlite.prepare("SELECT * FROM bq_sub_topics ORDER BY id").all();
      return res.json({ data: rows.map(mapSubTopic), count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ViewTopic = (req: Request, res: Response) => {
    try {
      const id = req.body?.topic_id || req.body?.id || req.params?.id;
      const row = sqlite.prepare("SELECT * FROM bq_topics WHERE _id = ?").get(id) as any;
      if (!row) return res.status(404).json({ message: "Topic not found" });
      return res.json({ data: mapTopic(row) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ViewSubTopic = (req: Request, res: Response) => {
    try {
      const id = req.body?.sub_topic_id || req.body?.id || req.params?.id;
      const row = sqlite.prepare("SELECT * FROM bq_sub_topics WHERE _id = ?").get(id) as any;
      if (!row) return res.status(404).json({ message: "Sub topic not found" });
      return res.json({ data: mapSubTopic(row) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ViewLessons = (req: Request, res: Response) => {
    try {
      let rows: any[];
      if (req.body.sub_topic_id) rows = sqlite.prepare("SELECT * FROM bq_lessons WHERE sub_topic_id = ? ORDER BY id").all(req.body.sub_topic_id);
      else if (req.body.topic_id) rows = sqlite.prepare("SELECT * FROM bq_lessons WHERE topic_id = ? ORDER BY id").all(req.body.topic_id);
      else rows = sqlite.prepare("SELECT * FROM bq_lessons ORDER BY id").all();
      return res.json({ data: rows.map(mapLesson), count: rows.length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ViewLesson = (req: Request, res: Response) => {
    try {
      const id = req.body?.lesson_id || req.body?.id || req.params?.id;
      const row = sqlite.prepare("SELECT * FROM bq_lessons WHERE _id = ?").get(id) as any;
      if (!row) return res.status(404).json({ message: "Lesson not found" });
      return res.json({ data: mapLesson(row) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const TakeTest = (req: Request, res: Response) => {
    try {
      const { topic_id, sub_topic_id } = req.body;
      const questions = ((sub_topic_id
        ? sqlite.prepare("SELECT * FROM bq_questions WHERE sub_topic_id = ? ORDER BY RANDOM()").all(sub_topic_id)
        : sqlite.prepare("SELECT * FROM bq_questions WHERE topic_id = ? ORDER BY RANDOM()").all(topic_id)) as any[])
        .map((q: any) => ({
          _id: q._id, topic_id: q.topic_id, sub_topic_id: q.sub_topic_id || "", title: q.title,
          question: { fileId: "", fileUrl: "" }, question_type: q.question_type,
          question_input_type: q.question_input_type || "",
          options: parseJson(q.options).map((o: any, i: number) => ({ option_value: o.option_value, _id: `opt-${q._id}-${i}` })),
          created_by: "", creation_date: q.createdAt, last_updated_by: "", last_update_date: q.createdAt,
        }));
      const id = `bq-test-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_tests (_id,user_id,topic_id,sub_topic_id,questions,completed,creation_date) VALUES (?,?,?,?,?,?,?)").run(id, req.userId, topic_id || "", sub_topic_id || "", JSON.stringify(questions.map((q: any) => q._id)), 0, new Date().toISOString());
      return res.json({ data: { _id: id, topic_id: topic_id || "", sub_topic_id: sub_topic_id || "", user_id: req.userId, questions, completed: false, creation_date: new Date().toISOString() } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const SubmitTestAnswers = (req: Request, res: Response) => {
    try {
      const test = sqlite.prepare("SELECT * FROM bq_tests WHERE _id = ? AND user_id = ?").get(req.params.testId, req.userId) as any;
      if (!test) return res.status(404).json({ message: "Test not found" });
      if (test.completed) return res.json({ message: "Test already completed" });
      const questionIds = parseJson(test.questions) as string[];
      const originals = sqlite.prepare(`SELECT * FROM bq_questions WHERE _id IN (${questionIds.map(() => "?").join(",")})`).all(...questionIds) as any[];
      const optMap = new Map(originals.map((q: any) => [q._id, parseJson(q.options)]));
      let correct = 0;
      const reviewed = questionIds.map((qId: string) => {
        const opts = optMap.get(qId) || [];
        const correctOpts = opts.filter((o: any) => o.isCorrectAnswer).map((o: any) => o.option_value);
        const ans = (req.body.answers || []).find((a: any) => a.question_id === qId)?.answer || [];
        const userAns = Array.isArray(ans) ? ans : [ans];
        const isCorrect = correctOpts.length === userAns.length && correctOpts.every((v: string) => userAns.includes(v));
        if (isCorrect) correct++;
        return { _id: qId, topic_id: "", sub_topic_id: "", title: "", question: { fileId: "", fileUrl: "" }, solution: "", question_type: "", question_input_type: "", options: opts.map((o: any, i: number) => ({ option_value: o.option_value, isCorrectAnswer: o.isCorrectAnswer, _id: `opt-${qId}-${i}` })), created_by: "", creation_date: "", last_updated_by: "", last_update_date: "", passed: isCorrect, answer_provided: userAns };
      });
      const mistakes = reviewed.length - correct;
      const reviewId = `bq-review-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_test_reviews (_id,test_id,user_id,questions,time,correct,mistakes,creation_date) VALUES (?,?,?,?,?,?,?,?)").run(reviewId, test._id, req.userId, JSON.stringify(reviewed), req.body.time || 0, correct, mistakes, new Date().toISOString());
      sqlite.prepare("UPDATE bq_tests SET completed = 1 WHERE _id = ?").run(test._id);
      const points = correct * 10;
      const lb = sqlite.prepare("SELECT id FROM bq_leaderboard WHERE user_id = ?").get(req.userId);
      if (lb) sqlite.prepare("UPDATE bq_leaderboard SET points = points + ? WHERE user_id = ?").run(points, req.userId);
      else sqlite.prepare("INSERT INTO bq_leaderboard (_id,user_id,userName,points,createdAt) VALUES (?,?,?,?,?)").run(`bq-lb-${Date.now()}`, req.userId, req.userId, points, new Date().toISOString());
      return res.json({ message: "Test submitted", data: { review_id: reviewId, correct, mistakes, total: reviewed.length, points } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetTestReview = (req: Request, res: Response) => {
    try {
      const row = sqlite.prepare("SELECT * FROM bq_test_reviews WHERE test_id = ? AND user_id = ?").get(req.params.testId, req.userId) as any;
      if (!row) return res.status(404).json({ message: "Review not found" });
      return res.json({ data: { _id: row._id, test_id: row.test_id, user_id: row.user_id, questions: parseJson(row.questions), time: row.time || 0, correct: row.correct || 0, mistakes: row.mistakes || 0, creation_date: row.creation_date } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetTestPerformance = (req: Request, res: Response) => {
    try {
      const row = sqlite.prepare("SELECT * FROM bq_test_reviews WHERE test_id = ? AND user_id = ?").get(req.params.testId, req.userId) as any;
      if (!row) return res.json({ data: { questions: 0, time: 0, correct: 0, mistakes: 0 } });
      return res.json({ data: { questions: (row.correct || 0) + (row.mistakes || 0), time: row.time || 0, correct: row.correct || 0, mistakes: row.mistakes || 0 } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetTests = (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.body;
      const offset = (Number(page) - 1) * Number(limit);
      const rows = sqlite.prepare("SELECT * FROM bq_tests WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?").all(req.userId, Number(limit), offset);
      const count = (sqlite.prepare("SELECT COUNT(*) as c FROM bq_tests WHERE user_id = ?").get(req.userId) as any).c;
      const mapped = rows.map((t: any) => ({
        _id: t._id, topic_id: { _id: t.topic_id || "", title: t.topic_id ? (sqlite.prepare("SELECT title FROM bq_topics WHERE _id = ?").get(t.topic_id) as any)?.title || "" : "" },
        sub_topic_id: { _id: t.sub_topic_id || "", title: "" }, user_id: t.user_id,
        questions: parseJson(t.questions) || [], completed: !!t.completed, creation_date: t.creation_date,
      }));
      return res.json({ data: mapped, count });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const TrackProgress = (req: Request, res: Response) => {
    try {
      const { topic_id, type, lesson_id, time, duration, currentTime, test_id } = req.body;
      sqlite.prepare("INSERT INTO bq_progress (_id,user_id,topic_id,lesson_id,test_id,type,time,duration,currentTime,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)").run(`bq-prog-${Date.now()}`, req.userId, topic_id || "", lesson_id || "", test_id || "", type || "lesson", time || 0, duration || 0, currentTime || 0, new Date().toISOString());
      return res.json({ message: "Progress saved" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetUserLesson = (req: Request, res: Response) => {
    try {
      const prog = sqlite.prepare("SELECT * FROM bq_progress WHERE user_id = ? AND lesson_id = ? ORDER BY id DESC LIMIT 1").get(req.userId, req.params.lessonId) as any;
      return res.json({ data: { currentTime: prog?.currentTime || 0 } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetBookmarks = (req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_bookmarks WHERE user_id = ? ORDER BY id DESC").all(req.userId);
      const mapped = rows.map((b: any) => {
        const lesson = sqlite.prepare("SELECT * FROM bq_lessons WHERE _id = ?").get(b.lesson_id) as any;
        return { _id: b._id, user_id: b.user_id, lesson_id: mapLesson(lesson), creation_date: b.createdAt };
      });
      return res.json({ data: mapped, count: mapped.length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const CreateBookmark = (req: Request, res: Response) => {
    try {
      const existing = sqlite.prepare("SELECT id FROM bq_bookmarks WHERE user_id = ? AND lesson_id = ?").get(req.userId, req.body.lesson_id);
      if (existing) return res.json({ message: "Already bookmarked" });
      sqlite.prepare("INSERT INTO bq_bookmarks (_id,user_id,lesson_id,createdAt) VALUES (?,?,?,?)").run(`bq-bm-${Date.now()}`, req.userId, req.body.lesson_id, new Date().toISOString());
      return res.json({ message: "Bookmark added" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const DeleteBookmark = (req: Request, res: Response) => {
    try {
      sqlite.prepare("DELETE FROM bq_bookmarks WHERE _id = ? AND user_id = ?").run(req.params.bookmarkId, req.userId);
      return res.json({ message: "Bookmark removed" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetEnrolledTopics = (req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT e.*, t.title, t.description, t.class_id FROM bq_enrollments e LEFT JOIN bq_topics t ON e.topic_id = t._id WHERE e.user_id = ? ORDER BY e.id DESC").all(req.userId);
      const mapped = rows.map((e: any) => ({
        _id: e._id, user_id: e.user_id, topic_id: e.topic_id,
        progress_rate: 0, enrollment_date: e.createdAt, last_viewed_at: e.createdAt, content_consumed: [],
      }));
      return res.json({ data: mapped, count: mapped.length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const EnrollTopic = (req: Request, res: Response) => {
    try {
      const existing = sqlite.prepare("SELECT id FROM bq_enrollments WHERE user_id = ? AND topic_id = ?").get(req.userId, req.params.topicId);
      if (existing) return res.json({ message: "Already enrolled" });
      sqlite.prepare("INSERT INTO bq_enrollments (_id,user_id,topic_id,createdAt) VALUES (?,?,?,?)").run(`bq-enr-${Date.now()}`, req.userId, req.params.topicId, new Date().toISOString());
      return res.json({ message: "Enrolled successfully" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const FreeVideos = (req: Request, res: Response) => {
    try {
      const lessons = sqlite.prepare("SELECT * FROM bq_lessons ORDER BY RANDOM() LIMIT 3").all();
      const mapped = lessons.map((l: any) => {
        const r = parseResources(l);
        return {
          _id: l._id, classLevel: req.body.classLevel || "SS1",
          video_identifier: "", video_url: r.video_url || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        };
      });
      return res.json({ data: mapped, count: mapped.length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const RecentLearning = (req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_progress WHERE user_id = ? GROUP BY topic_id ORDER BY id DESC LIMIT 5").all(req.userId);
      const mapped = rows.map((p: any) => {
        const topic = sqlite.prepare("SELECT * FROM bq_topics WHERE _id = ?").get(p.topic_id) as any;
        return { _id: p._id, user_id: p.user_id, topic_id: mapTopic(topic), progress_rate: 0, enrollment_date: p.createdAt, last_viewed_at: p.createdAt };
      });
      return res.json({ data: mapped, count: mapped.length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetStreak = (req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_streaks WHERE user_id = ? ORDER BY date DESC").all(req.userId) as any[];
      const mapped = rows.map((s: any, i: number) => ({
        _id: s._id, day: s.date, met_target: true, time_spent: 30, days_in_last_streak: rows.length - i, creation_date: s.createdAt,
      }));
      return res.json({ data: mapped, count: mapped.length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  return { ViewClasses, ViewCbt, PopularTopics, ViewTopics, ViewSubTopics, ViewTopic, ViewSubTopic, ViewLessons, ViewLesson, TakeTest, SubmitTestAnswers, GetTestReview, GetTestPerformance, GetTests, TrackProgress, GetUserLesson, GetBookmarks, CreateBookmark, DeleteBookmark, GetEnrolledTopics, EnrollTopic, FreeVideos, RecentLearning, GetStreak };
};
