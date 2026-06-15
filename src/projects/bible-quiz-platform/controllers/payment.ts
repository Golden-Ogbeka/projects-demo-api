import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { sendCatchFeedback } from "../../../functions/feedback.js";

export const PaymentController = () => {
  const GetPlans = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_subscription_plans ORDER BY id").all() as any[];
      const mapped: any[] = rows.map((r: any) => ({
        _id: r._id,
        subscriptionPlan: r.name,
        subscriptionAmount: r.amount,
        duration: r.duration_days,
        createdAt: r.createdAt,
        messages: JSON.parse(r.features || "[]"),
      }));
      return res.json({ data: mapped, count: mapped.length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetTransactions = (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, status, plan } = req.body;
      const offset = (Number(page) - 1) * Number(limit);
      let q = "SELECT * FROM bq_transactions WHERE user_id = ?";
      const params: any[] = [req.userId];
      if (status) { q += " AND status = ?"; params.push(status); }
      if (plan) { q += " AND plan_id = ?"; params.push(plan); }
      q += " ORDER BY id DESC LIMIT ? OFFSET ?";
      params.push(Number(limit), offset);
      const rows = sqlite.prepare(q).all(...params);
      const count = ((sqlite.prepare("SELECT COUNT(*) as c FROM bq_transactions WHERE user_id = ?").get(req.userId) as any)).c;
      return res.json({ data: rows, count });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const InitiatePayment = (req: Request, res: Response) => {
    try {
      const plan = sqlite.prepare("SELECT * FROM bq_subscription_plans WHERE _id = ?").get(req.body.plan_id) as any;
      if (!plan) return res.status(404).json({ message: "Plan not found" });
      const txId = `bq-tx-${Date.now()}`;
      const ref = `BQ-${Date.now()}`;
      sqlite.prepare("INSERT INTO bq_transactions (_id,user_id,plan_id,amount,reference,status,createdAt) VALUES (?,?,?,?,?,?,?)").run(txId, req.userId, plan._id, plan.amount, ref, "pending", new Date().toISOString());
      return res.json({
        success: true, message: "Payment initiated",
        data: { transaction_id: txId, reference: ref, amount: plan.amount, plan_name: plan.name, access_code: `demo-ac-${Date.now()}`, authorization_url: `https://demo-paygate.local/checkout/${ref}`, plan },
      });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const VerifyPayment = (req: Request, res: Response) => {
    try {
      const tx = sqlite.prepare("SELECT * FROM bq_transactions WHERE reference = ?").get(req.params.reference) as any;
      if (!tx) return res.status(404).json({ message: "Transaction not found" });
      sqlite.prepare("UPDATE bq_transactions SET status = 'success' WHERE reference = ?").run(req.params.reference);
      return res.json({ success: true, message: "Payment verified", data: { ...tx, status: "success" } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  return { GetPlans, GetTransactions, InitiatePayment, VerifyPayment };
};
