import { Router } from "express";
import multer from "multer";
import { MonoWebController } from "../controllers/index.js";

const MonoWebRouter = Router();
const Controller = MonoWebController();
const upload = multer({ storage: multer.memoryStorage() });

MonoWebRouter.get("/", (_req, res) => {
  res.json({ success: true, message: "mono-web dummy backend running" });
});
MonoWebRouter.post("/authentication", Controller.Authentication);
MonoWebRouter.post("/registration", Controller.Registration);
MonoWebRouter.post("/registrationVerification", Controller.RegistrationVerification);
MonoWebRouter.post("/validateToken", Controller.ValidateToken);
MonoWebRouter.post("/forgotPassword", Controller.ForgotPassword);
MonoWebRouter.post("/resetPassword", Controller.ResetPassword);
MonoWebRouter.post("/getUser", Controller.GetUser);
MonoWebRouter.post("/updateUser", upload.single("profileImage"), Controller.UpdateUser);
MonoWebRouter.post("/changePassword", Controller.ChangePassword);
MonoWebRouter.post("/twoFactorAuth", Controller.TwoFactorAuth);
MonoWebRouter.post("/getBalance", Controller.GetBalance);
MonoWebRouter.post("/getTransaction", Controller.GetTransaction);
MonoWebRouter.post("/getTransactionRange", Controller.GetTransaction);
MonoWebRouter.post("/getReferenceNo", Controller.GetReferenceNo);
MonoWebRouter.post("/getPaymentChannel", Controller.GetPaymentChannel);
MonoWebRouter.post("/createTransaction", Controller.CreateTransaction);
MonoWebRouter.post("/updateTransaction", Controller.UpdateTransaction);
MonoWebRouter.post("/cashOut", Controller.CashOut);
MonoWebRouter.post("/getUserAudit", Controller.GetUserAudit);
MonoWebRouter.post("/getProperty", Controller.GetProperty);
MonoWebRouter.post("/createInvestmentTransaction", Controller.CreateInvestmentTransaction);
MonoWebRouter.post("/getInvestmentTransaction", Controller.GetInvestmentTransaction);
MonoWebRouter.post("/getUserBank", Controller.GetUserBank);
MonoWebRouter.post("/getBank", Controller.GetBank);
MonoWebRouter.post("/createUserBank", Controller.CreateUserBank);

export default MonoWebRouter;
