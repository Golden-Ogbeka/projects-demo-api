import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
} from "../../../functions/feedback.js";
import { generateOtp } from "../../../functions/otp.js";
import {
  MonoBank,
  MonoInvestment,
  MonoTransaction,
  MonoUser,
  MonoUserInvestment,
} from "../types/index.js";

const makeSession = (profileId: string) =>
  Buffer.from(`${profileId}:${Date.now()}`).toString("base64");

const makeRef = () =>
  `REF-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const ok = (data: object) => ({ status: "OK", ...data });
const fail = (message: string) => ({ status: "FAILED", message });

export const MonoWebController = () => {
  // POST /authentication
  const Authentication = (req: Request, res: Response) => {
    try {
      const { loginName, password } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM mono_users WHERE email = ? AND password = ?")
        .get(loginName, password) as MonoUser | undefined;

      if (!user)
        return res.json({ data: fail("Invalid email or password") });

      if (!user.isVerified)
        return res.json({ data: fail("Account not verified. Check your email.") });

      const session = makeSession(user.profileId);
      sqlite
        .prepare("UPDATE mono_users SET session = ? WHERE id = ?")
        .run(session, user.id);

      return res.json({
        data: ok({
          message: "Login Successful!",
          profileDetails: {
            profileId: user.profileId,
            loginName: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            message: "Login Successful!",
            session,
            firstLoginStatus: "D",
            twoFactorAuthStatus: user.twoFactorAuthStatus,
          },
        }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /registration
  const Registration = (req: Request, res: Response) => {
    try {
      const { firstName, lastName, emailAddress, phoneNumber, password } = req.body;

      const existing = sqlite
        .prepare("SELECT id FROM mono_users WHERE email = ?")
        .get(emailAddress);
      if (existing)
        return res.json({ data: fail("Email already registered") });

      const profileId = `CS${String(Date.now()).slice(-13)}`;
      const token = generateOtp();

      sqlite
        .prepare(
          `INSERT INTO mono_users
            (profileId, firstName, lastName, email, phoneNumber, password, isVerified, verificationToken)
           VALUES
            (@profileId, @firstName, @lastName, @email, @phoneNumber, @password, 0, @token)`,
        )
        .run({ profileId, firstName, lastName, email: emailAddress, phoneNumber, password, token });

      return res.json({
        data: ok({
          message: "Registration successful! Check your email for a verification link.",
          verificationToken: token,
        }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /registrationVerification
  const RegistrationVerification = (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM mono_users WHERE verificationToken = ?")
        .get(token) as MonoUser | undefined;

      if (!user)
        return res.json({ data: { ...fail("Invalid or expired token"), message: "jwt malformed" } });

      if (user.isVerified)
        return res.json({ data: { status: "FAILED", message: "User Account Has Already Been Activated" } });

      sqlite
        .prepare("UPDATE mono_users SET isVerified = 1, verificationToken = NULL WHERE id = ?")
        .run(user.id);

      return res.json({ data: ok({ response: "Account verified successfully!" }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /validateToken (2FA)
  const ValidateToken = (req: Request, res: Response) => {
    try {
      const { profileId, token } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM mono_users WHERE profileId = ? AND twoFactorOtp = ?")
        .get(profileId, token) as MonoUser | undefined;

      if (!user)
        return res.json({ data: fail("Invalid OTP") });

      const session = makeSession(user.profileId);
      sqlite
        .prepare("UPDATE mono_users SET session = ?, twoFactorOtp = NULL WHERE id = ?")
        .run(session, user.id);

      return res.json({
        data: ok({
          message: "2FA verified successfully!",
          profileDetails: {
            profileId: user.profileId,
            loginName: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            session,
            firstLoginStatus: "D",
            twoFactorAuthStatus: user.twoFactorAuthStatus,
          },
        }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /forgotPassword
  const ForgotPassword = (req: Request, res: Response) => {
    try {
      const { loginName } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE email = ?")
        .get(loginName) as MonoUser | undefined;

      if (!user)
        return res.json({ data: fail("Email not found") });

      const token = generateOtp();
      sqlite
        .prepare("UPDATE mono_users SET resetToken = ? WHERE id = ?")
        .run(token, user.id);

      return res.json({
        data: ok({ message: "Password reset link sent to your email.", resetToken: token }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /resetPassword
  const ResetPassword = (req: Request, res: Response) => {
    try {
      const { resetToken, password } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM mono_users WHERE resetToken = ?")
        .get(resetToken) as MonoUser | undefined;

      if (!user)
        return res.json({ data: fail("Invalid or expired reset token") });

      sqlite
        .prepare("UPDATE mono_users SET password = ?, resetToken = NULL WHERE id = ?")
        .run(password, user.id);

      return res.json({ data: ok({ message: "Password changed successfully!" }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getUser
  const GetUser = (req: Request, res: Response) => {
    try {
      const { profileId } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      return res.json({
        data: ok({
          message: "User retrieved",
          customerData: {
            FIRST_NAME: user.firstName,
            LAST_NAME: user.lastName,
            LOGIN_NAME: user.email,
            PHONE: user.phoneNumber,
            PROFILE_IMAGE_URL: user.profileImage,
            PROFILE_ID: user.profileId,
            TWO_FACTOR_AUTH_STATUS: user.twoFactorAuthStatus,
          },
        }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /updateUser (multipart/form-data)
  const UpdateUser = (req: Request, res: Response) => {
    try {
      const { profileId, firstName, lastName, phoneNumber } = req.body;
      const profileImage = (req as any).file
        ? `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&t=${Date.now()}`
        : null;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const newImage = profileImage || user.profileImage;

      sqlite
        .prepare(
          `UPDATE mono_users SET
            firstName = COALESCE(@firstName, firstName),
            lastName = COALESCE(@lastName, lastName),
            phoneNumber = COALESCE(@phoneNumber, phoneNumber),
            profileImage = COALESCE(@profileImage, profileImage)
           WHERE id = @id`,
        )
        .run({ firstName, lastName, phoneNumber, profileImage: newImage, id: user.id });

      return res.json({
        data: ok({
          message: "Profile updated successfully!",
          Profile_URL: newImage,
        }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /changePassword
  const ChangePassword = (req: Request, res: Response) => {
    try {
      const { profileId, oldPassword, newPassword } = req.body;
      const user = sqlite
        .prepare("SELECT * FROM mono_users WHERE profileId = ? AND password = ?")
        .get(profileId, oldPassword) as MonoUser | undefined;

      if (!user)
        return res.json({ data: fail("Incorrect current password") });

      sqlite
        .prepare("UPDATE mono_users SET password = ? WHERE id = ?")
        .run(newPassword, user.id);

      return res.json({ data: ok({ message: "Password changed successfully!" }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /twoFactorAuth
  const TwoFactorAuth = (req: Request, res: Response) => {
    try {
      const { profileId, status: newStatus } = req.body; // status: "R" | "D"
      const user = sqlite
        .prepare("SELECT * FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const otp = newStatus === "R" ? generateOtp() : null;

      sqlite
        .prepare("UPDATE mono_users SET twoFactorAuthStatus = ?, twoFactorOtp = ? WHERE id = ?")
        .run(newStatus, otp, user.id);

      return res.json({
        data: ok({
          message: newStatus === "R" ? "2FA enabled" : "2FA disabled",
          twoFactorAuthStatus: newStatus,
          ...(otp ? { otp } : {}),
        }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getBalance
  const GetBalance = (req: Request, res: Response) => {
    try {
      const { profileId } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const credits = (
        sqlite
          .prepare(
            "SELECT COALESCE(SUM(amount),0) as total FROM mono_transactions WHERE userId = ? AND type = 'credit' AND status = 'successful'",
          )
          .get(user.id) as { total: number }
      ).total;

      const debits = (
        sqlite
          .prepare(
            "SELECT COALESCE(SUM(amount),0) as total FROM mono_transactions WHERE userId = ? AND type = 'debit' AND status = 'successful'",
          )
          .get(user.id) as { total: number }
      ).total;

      const balance = credits - debits;

      return res.json({
        data: ok({
          message: "Balance retrieved",
          transactionBalanceData: [{ BALANCE: balance }],
        }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getTransaction
  const GetTransaction = (req: Request, res: Response) => {
    try {
      const { profileId } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const transactions = sqlite
        .prepare(
          "SELECT * FROM mono_transactions WHERE userId = ? ORDER BY createdAt DESC",
        )
        .all(user.id) as MonoTransaction[];

      const mapped = transactions.map((t) => ({
        TRAN_REF_NO: t.transactionRef,
        TRAN_NARRATION: t.description,
        TRAN_AMOUNT: t.amount,
        TRAN_FEE: 0,
        TRAN_STATUS: t.status,
        TRAN_DATE: t.createdAt,
        TRAN_TYPE: t.type,
      }));

      return res.json({
        data: ok({ message: "Transactions retrieved", transactionHistoryData: mapped }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getReferenceNo
  const GetReferenceNo = (_req: Request, res: Response) => {
    try {
      return res.json({ data: ok({ message: "Reference generated", TransactionReference: makeRef() }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getPaymentChannel
  const GetPaymentChannel = (_req: Request, res: Response) => {
    try {
      return res.json({
        data: ok({
          message: "Payment channels retrieved",
          paymentChannelData: [
            { CHANNEL_NAME: "CuePay", CHANNEL_FEE: 0, CHANNEL_URL: "https://cuepay.com/secure/pay", IMAGE_NAME: "cuePay.png" },
            { CHANNEL_NAME: "Paystack", CHANNEL_FEE: 0, CHANNEL_URL: "https://paystack.com/pay", IMAGE_NAME: "paystack.png" },
          ],
        }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /createTransaction
  const CreateTransaction = (req: Request, res: Response) => {
    try {
      const { profileId, referenceNo, transactionReference, transactionAmount, amount, transactionDescription, description, channel } = req.body;
      const refAmount = Number(transactionAmount ?? amount ?? 0);
      const type = refAmount >= 0 ? "credit" : "debit";
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const ref = referenceNo || transactionReference || makeRef();
      const desc = transactionDescription || description || "Wallet funded";

      sqlite
        .prepare(
          `INSERT INTO mono_transactions (userId, transactionRef, type, amount, status, description)
           VALUES (@userId, @ref, @type, @amount, 'successful', @description)`,
        )
        .run({ userId: user.id, ref, type, amount: refAmount, description: desc });

      return res.json({
        data: ok({ message: "Transaction created", transactionRef: ref }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /updateTransaction
  const UpdateTransaction = (req: Request, res: Response) => {
    try {
      const { transactionReference: transactionRef, status = "successful" } = req.body;

      sqlite
        .prepare("UPDATE mono_transactions SET status = ? WHERE transactionRef = ?")
        .run(status, transactionRef);

      return res.json({ data: ok({ message: "Transaction updated" }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /cashOut
  const CashOut = (req: Request, res: Response) => {
    try {
      const { profileId, amount, bankId } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const ref = makeRef();
      sqlite
        .prepare(
          `INSERT INTO mono_transactions (userId, transactionRef, type, amount, status, description)
           VALUES (@userId, @ref, 'debit', @amount, 'successful', 'Cash out to bank')`,
        )
        .run({ userId: user.id, ref, amount });

      return res.json({ data: ok({ message: "Cash out successful", transactionRef: ref }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getUserAudit
  const GetUserAudit = (req: Request, res: Response) => {
    try {
      const { profileId, startDate, endDate } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const start = startDate ? `${startDate}T00:00:00.000Z` : "2000-01-01T00:00:00.000Z";
      const end = endDate ? `${endDate}T23:59:59.999Z` : new Date().toISOString();

      const audits = sqlite
        .prepare(
          `SELECT * FROM mono_transactions
           WHERE userId = ? AND createdAt >= ? AND createdAt <= ?
           ORDER BY createdAt DESC`,
        )
        .all(user.id, start, end) as MonoTransaction[];

      const mapped = audits.map((a, idx) => ({
        ACTION_ID: `AUDIT-${String(idx + 1).padStart(4, "0")}`,
        ACTION_PERFORMED: a.description,
        AUDIT_DATE: new Date(a.createdAt).toISOString().split("T")[0],
        ACTION_STATUS: "Successful",
        ACTION_TYPE: a.type.toUpperCase(),
        ACTION_AMOUNT: a.amount,
        REFERENCE_NO: a.transactionRef,
      }));

      return res.json({
        data: ok({ message: "Audit retrieved", auditHistoryData: mapped }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getProperty
  const GetProperty = (_req: Request, res: Response) => {
    try {
      const properties = sqlite
        .prepare("SELECT * FROM mono_properties WHERE available = 1")
        .all() as MonoInvestment[];

      const mapped = properties.map((p) => ({
        PROPERTY_ID: p.propertyId,
        PROPERTY_NAME: p.name,
        PROPERTY_AMOUNT: p.price,
        PROPERTY_DESCRIPTION: p.description,
        PROPERTY_PATH: p.image,
        PROPERTY_IMAGE_URL: p.image,
        PROPERTY_SHORT_DESCRIPTION: p.description.slice(0, 120),
        PROPERTY_ROI: p.roi,
        PROPERTY_DUE_DATE: p.dueDate,
        PROPERTY_LOCATION: p.location,
        PROPERTY_STATUS: p.available === 1 ? "Available" : "Sold Out",
      }));

      return res.json({ data: ok({ message: "Properties retrieved", propertyData: mapped }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /createInvestmentTransaction
  const CreateInvestmentTransaction = (req: Request, res: Response) => {
    try {
      const { profileId, propertyId, amount } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const ref = makeRef();

      sqlite
        .prepare(
          `INSERT INTO mono_user_investments (userId, propertyId, amount, transactionRef, status)
           VALUES (@userId, @propertyId, @amount, @ref, 'active')`,
        )
        .run({ userId: user.id, propertyId, amount, ref });

      sqlite
        .prepare(
          `INSERT INTO mono_transactions (userId, transactionRef, type, amount, status, description)
           VALUES (@userId, @ref, 'debit', @amount, 'successful', 'Investment in property')`,
        )
        .run({ userId: user.id, ref: `${ref}-TX`, amount });

      return res.json({ data: ok({ message: "Investment created", transactionRef: ref }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getInvestmentTransaction
  const GetInvestmentTransaction = (req: Request, res: Response) => {
    try {
      const { profileId } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const investments = sqlite
        .prepare(
          `SELECT ui.*, p.name as propertyName, p.location, p.roi, p.dueDate, p.image, p.propertyId
           FROM mono_user_investments ui
           JOIN mono_properties p ON ui.propertyId = p.propertyId
           WHERE ui.userId = ?
           ORDER BY ui.createdAt DESC`,
        )
        .all(user.id) as any[];

      const mapped = investments.map((inv) => ({
        INVEST_AMOUNT: inv.amount,
        INVEST_REF_NO: inv.transactionRef,
        INVEST_NAME: inv.propertyName,
        INVEST_STATUS: inv.status,
        INVEST_DUE_DATE: inv.dueDate,
        INVEST_DATE: inv.createdAt,
        INVEST_LOCATION: inv.location,
        INVEST_ROI: inv.roi,
        INVEST_IMAGE: inv.image,
      }));

      return res.json({ data: ok({ message: "Investments retrieved", investmentHistoryData: mapped }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getUserBank
  const GetUserBank = (req: Request, res: Response) => {
    try {
      const { profileId } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const bank = sqlite
        .prepare("SELECT * FROM mono_banks WHERE userId = ?")
        .get(user.id) as MonoBank | undefined;

      const mapped = bank
        ? {
            BANK_ID: bank.id,
            BANK_NAME: bank.bankName,
            ACCOUNT_NUMBER: bank.accountNumber,
            ACCOUNT_NAME: bank.accountName,
          }
        : null;

      return res.json({ data: ok({ message: "Banks retrieved", UserBankData: mapped }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /getBank (list of all supported banks)
  const GetBank = (_req: Request, res: Response) => {
    try {
      const banks = [
        { BANK_ID: "1", BANK_NAME: "Guaranty Trust Bank", BANK_CODE: "058" },
        { BANK_ID: "2", BANK_NAME: "First Bank of Nigeria", BANK_CODE: "011" },
        { BANK_ID: "3", BANK_NAME: "Access Bank", BANK_CODE: "044" },
        { BANK_ID: "4", BANK_NAME: "Zenith Bank", BANK_CODE: "057" },
        { BANK_ID: "5", BANK_NAME: "United Bank for Africa", BANK_CODE: "033" },
        { BANK_ID: "6", BANK_NAME: "Polaris Bank", BANK_CODE: "076" },
        { BANK_ID: "7", BANK_NAME: "Stanbic IBTC Bank", BANK_CODE: "221" },
        { BANK_ID: "8", BANK_NAME: "Sterling Bank", BANK_CODE: "232" },
      ];
      return res.json({ data: ok({ message: "Banks retrieved", BankData: banks }) });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  // POST /createUserBank
  const CreateUserBank = (req: Request, res: Response) => {
    try {
      const { profileId, bankId: bankCode, bankName, accountNumber, accountName } = req.body;
      const user = sqlite
        .prepare("SELECT id FROM mono_users WHERE profileId = ?")
        .get(profileId) as MonoUser | undefined;

      if (!user) return res.json({ data: fail("User not found") });

      const result = sqlite
        .prepare(
          `INSERT INTO mono_banks (userId, bankCode, bankName, accountNumber, accountName)
           VALUES (@userId, @bankCode, @bankName, @accountNumber, @accountName)`,
        )
        .run({ userId: user.id, bankCode, bankName, accountNumber, accountName });

      return res.json({
        data: ok({ message: "Bank account added", bankId: result.lastInsertRowid }),
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  return {
    Authentication,
    Registration,
    RegistrationVerification,
    ValidateToken,
    ForgotPassword,
    ResetPassword,
    GetUser,
    UpdateUser,
    ChangePassword,
    TwoFactorAuth,
    GetBalance,
    GetTransaction,
    GetReferenceNo,
    GetPaymentChannel,
    CreateTransaction,
    UpdateTransaction,
    CashOut,
    GetUserAudit,
    GetProperty,
    CreateInvestmentTransaction,
    GetInvestmentTransaction,
    GetUserBank,
    GetBank,
    CreateUserBank,
  };
};
