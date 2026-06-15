import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import { sendCatchFeedback } from "../../../functions/feedback.js";

const createToken = (id: string) => `demo-token-${id}`;

const mapUser = (u: any) => {
  if (!u) return null;
  return {
    _id: u._id, email: u.email, userName: u.userName, firstName: u.firstName, lastName: u.lastName,
    password: u.password, isVerified: !!u.isVerified, acceptTermsAndConditions: !!u.acceptTermsAndConditions,
    verificationCode: u.verificationCode || "", verificationCodeExpires: u.verificationCodeExpires || "",
    resetCode: u.resetCode || "", resetExpires: u.resetExpires || "", passwordChangedAt: u.passwordChangedAt || "",
    classLevel: u.classLevel || "", country: u.country || "", countryState: u.countryState || "",
    gender: u.gender || "", school: u.school || "",
    guardianEmail: u.guardianEmail || "", guardianFullName: u.guardianFullName || "",
    reportToGuardian: u.reportToGuardian || "never",
    goal: u.goal || 0, numOfReferrals: u.numOfReferrals || 0,
    referralActivity: [], referralEarnings: u.referralEarnings || 0,
    personalReferralCode: u.personalReferralCode || "",
    profilePicture: u.profilePicture || "", profilePictureId: u.profilePictureId || "",
    createdAt: u.createdAt || "", role: u.role || "user",
    subscription: {
      plan: u.subscription_plan || "Basic", active: !!u.subscription_active,
      running: !!u.subscription_active, settledReferrer: false,
      gateway: u.subscription_gateway || "paystack",
      lastPaymentDate: u.lastPaymentDate || u.createdAt,
      nextPaymentDate: u.nextPaymentDate || "", token: u.subscription_token || "",
    },
    freeAccess: !!u.freeAccess, referralEarningsBalance: u.referralEarningsBalance || 0,
    isFrozen: !!u.isFrozen, isDeleted: !!u.isDeleted,
  };
};

const mapAdmin = (a: any) => a ? {
  _id: a._id, email: a.email, userName: a.userName || a.email?.split("@")[0],
  firstName: a.firstName, lastName: a.lastName, phoneNumber: a.phoneNumber || "",
  role: a.role || "admin", createdAt: a.createdAt || "",
  resetCode: a.resetCode || "", resetExpires: a.resetExpires || "",
  passwordChangedAt: a.passwordChangedAt || "", roles: [], populatedRoles: [],
} : null;

export const AuthController = () => {
  // ---------- a1quest-web (user) ----------
  const Login = (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = sqlite.prepare("SELECT * FROM bq_users WHERE email = ? AND password = ?").get(email, password) as any;
      if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });
      if (!user.isVerified) return res.status(401).json({ success: false, message: "Email not verified" });
      return res.json({ success: true, message: "Login successful", data: createToken(user._id) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const Register = (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, userName, acceptTermsAndConditions, referralCode } = req.body;
      if (sqlite.prepare("SELECT id FROM bq_users WHERE email = ?").get(email))
        return res.json({ message: "Email already registered" });
      const id = `bq-user-${Date.now()}`;
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      sqlite.prepare(`INSERT INTO bq_users (_id,email,userName,firstName,lastName,password,isVerified,acceptTermsAndConditions,verificationCode,verificationCodeExpires,personalReferralCode,freeAccess,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, email, userName || email.split("@")[0], firstName, lastName, password, 0, acceptTermsAndConditions ? 1 : 0, code, new Date(Date.now() + 86400000).toISOString(), `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, 1, new Date().toISOString());
      return res.json({ message: "Registration successful. Check your email for verification code.", data: { verificationCode: code } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetProfile = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT * FROM bq_users WHERE _id = ?").get(req.userId) as any;
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ data: mapUser(user) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const UpdateProfile = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT id FROM bq_users WHERE _id = ?").get(req.userId) as any;
      if (!user) return res.status(404).json({ message: "User not found" });
      const { school, classLevel, gender, country, countryState, firstName, lastName, userName } = req.body;
      sqlite.prepare("UPDATE bq_users SET school=COALESCE(?,school),classLevel=COALESCE(?,classLevel),gender=COALESCE(?,gender),country=COALESCE(?,country),countryState=COALESCE(?,countryState),firstName=COALESCE(?,firstName),lastName=COALESCE(?,lastName),userName=COALESCE(?,userName) WHERE id=?").run(school, classLevel, gender, country, countryState, firstName, lastName, userName, user.id);
      const updated = sqlite.prepare("SELECT * FROM bq_users WHERE id = ?").get(user.id) as any;
      return res.json({ data: mapUser(updated) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ForgotPassword = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT id FROM bq_users WHERE email = ?").get(req.body.email) as any;
      if (!user) return res.json({ message: "Email not found" });
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      sqlite.prepare("UPDATE bq_users SET resetCode = ?, resetExpires = ? WHERE id = ?").run(code, new Date(Date.now() + 3600000).toISOString(), user.id);
      return res.json({ message: "Reset code sent to your email", data: { resetCode: code } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ResetPassword = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT * FROM bq_users WHERE resetCode = ?").get(req.body.token || req.body.code) as any;
      if (!user) return res.json({ message: "Invalid or expired reset token" });
      sqlite.prepare("UPDATE bq_users SET password = ?, resetCode = NULL, passwordChangedAt = ? WHERE id = ?").run(req.body.password, new Date().toISOString(), user.id);
      return res.json({ message: "Password reset successful" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const VerifyCode = (req: Request, res: Response) => {
    try {
      const code = req.body.verificationCode || req.body.code || req.body.otp;
      const user = sqlite.prepare("SELECT * FROM bq_users WHERE email = ? AND verificationCode = ? AND verificationCodeExpires > ?").get(req.body.email, code, new Date().toISOString()) as any;
      if (!user) return res.status(400).json({ success: false, message: "Invalid or expired code" });
      sqlite.prepare("UPDATE bq_users SET isVerified = 1, verificationCode = NULL, verificationCodeExpires = NULL WHERE _id = ?").run(user._id);
      return res.json({ success: true, message: "Account verified", data: { ...mapUser(user), isVerified: true } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const ResendCode = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT id FROM bq_users WHERE email = ?").get(req.body.email) as any;
      if (!user) return res.json({ message: "Email not found" });
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      sqlite.prepare("UPDATE bq_users SET verificationCode = ?, verificationCodeExpires = ? WHERE id = ?").run(code, new Date(Date.now() + 86400000).toISOString(), user.id);
      return res.json({ message: "Verification code resent", data: { verificationCode: code } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const UpdateGuardian = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT id FROM bq_users WHERE _id = ?").get(req.userId) as any;
      if (!user) return res.status(404).json({ message: "User not found" });
      const { guardianFullName, guardianEmail, reportToGuardian } = req.body;
      sqlite.prepare("UPDATE bq_users SET guardianFullName=COALESCE(?,guardianFullName),guardianEmail=COALESCE(?,guardianEmail),reportToGuardian=COALESCE(?,reportToGuardian) WHERE id=?").run(guardianFullName, guardianEmail, reportToGuardian, user.id);
      const updated = sqlite.prepare("SELECT * FROM bq_users WHERE id = ?").get(user.id) as any;
      return res.json({ data: mapUser(updated) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const UpdateGoal = (req: Request, res: Response) => {
    try {
      const user = sqlite.prepare("SELECT id FROM bq_users WHERE _id = ?").get(req.userId) as any;
      if (!user) return res.status(404).json({ message: "User not found" });
      sqlite.prepare("UPDATE bq_users SET goal = ? WHERE id = ?").run(req.body.goal, user.id);
      const updated = sqlite.prepare("SELECT * FROM bq_users WHERE id = ?").get(user.id) as any;
      return res.json({ data: mapUser(updated) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetClasses = (_req: Request, res: Response) => {
    try {
      const rows = sqlite.prepare("SELECT * FROM bq_classes ORDER BY id").all();
      return res.json({ data: rows.map((r: any) => r.name), count: (rows as any[]).length });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetCountries = (_req: Request, res: Response) => {
    try {
      return res.json({ data: [{ iso2: "NG", iso3: "NGA", country: "Nigeria", cities: ["Lagos", "Abuja", "Rivers", "Oyo", "Kano"] }], count: 1 });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const GetStates = (req: Request, res: Response) => {
    try {
      const states: Record<string, { name: string; state_code: string }[]> = {
        Nigeria: [
          { name: "Lagos", state_code: "LA" }, { name: "Abuja", state_code: "FC" },
          { name: "Rivers", state_code: "RV" }, { name: "Oyo", state_code: "OY" },
          { name: "Kano", state_code: "KN" }, { name: "Kaduna", state_code: "KD" },
        ],
      };
      return res.json({ data: { states: states[req.body.country] || states.Nigeria } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  // ---------- a1quest-admin-web (admin) ----------
  const AdminLogin = (req: Request, res: Response) => {
    try {
      const admin = sqlite.prepare("SELECT * FROM bq_admin_users WHERE email = ? AND password = ?").get(req.body.email, req.body.password) as any;
      if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });
      return res.json({ success: true, message: "Login successful", data: createToken(admin._id) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const AdminProfile = (req: Request, res: Response) => {
    try {
      const admin = sqlite.prepare("SELECT * FROM bq_admin_users WHERE _id = ?").get(req.adminId) as any;
      if (!admin) return res.status(404).json({ message: "Admin not found" });
      return res.json({ data: mapAdmin(admin) });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const AdminForgotPassword = (req: Request, res: Response) => {
    try {
      const admin = sqlite.prepare("SELECT id FROM bq_admin_users WHERE email = ?").get(req.body.email) as any;
      if (!admin) return res.json({ message: "Email not found" });
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      sqlite.prepare("UPDATE bq_admin_users SET resetCode = ? WHERE id = ?").run(code, admin.id);
      return res.json({ message: "Reset code sent", data: { resetCode: code } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const AdminResetPassword = (req: Request, res: Response) => {
    try {
      const admin = sqlite.prepare("SELECT * FROM bq_admin_users WHERE resetCode = ?").get(req.body.token || req.body.code) as any;
      if (!admin) return res.json({ message: "Invalid or expired reset token" });
      sqlite.prepare("UPDATE bq_admin_users SET password = ?, resetCode = NULL, passwordChangedAt = ? WHERE id = ?").run(req.body.password, new Date().toISOString(), admin.id);
      return res.json({ message: "Password reset successful" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const AdminVerifyCode = (req: Request, res: Response) => {
    try {
      const code = req.body.verificationCode || req.body.code;
      const admin = sqlite.prepare("SELECT * FROM bq_admin_users WHERE verificationCode = ? AND verificationCodeExpires > ?").get(code, new Date().toISOString()) as any;
      if (!admin) return res.status(400).json({ success: false, message: "Invalid or expired code" });
      return res.json({ success: true, message: "Account verified" });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  const AdminResendCode = (req: Request, res: Response) => {
    try {
      const admin = sqlite.prepare("SELECT id FROM bq_admin_users WHERE email = ?").get(req.body.email) as any;
      if (!admin) return res.json({ message: "Email not found" });
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      sqlite.prepare("UPDATE bq_admin_users SET verificationCode = ?, verificationCodeExpires = ? WHERE id = ?").run(code, new Date(Date.now() + 86400000).toISOString(), admin.id);
      return res.json({ message: "Verification code resent", data: { verificationCode: code } });
    } catch (e) { return sendCatchFeedback(res, e); }
  };

  return {
    Login, Register, GetProfile, UpdateProfile, ForgotPassword, ResetPassword, VerifyCode, ResendCode,
    UpdateGuardian, UpdateGoal, GetClasses, GetCountries, GetStates,
    AdminLogin, AdminProfile, AdminForgotPassword, AdminResetPassword, AdminVerifyCode, AdminResendCode,
  };
};
