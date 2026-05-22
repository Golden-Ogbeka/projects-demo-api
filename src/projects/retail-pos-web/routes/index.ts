import { Router } from "express";
import { RetailPosWebGraphqlController } from "../controllers/graphql.js";
import {
    RetailPosWebLoanController,
    RetailPosWebOAuthController,
    RetailPosWebPasscodeController,
    RetailPosWebUploadController,
    RetailPosWebVasController,
} from "../controllers/rest.js";

const RetailPosWebRouter = Router();

const GraphqlController = RetailPosWebGraphqlController();
const OAuthController = RetailPosWebOAuthController();
const UploadController = RetailPosWebUploadController();
const VasController = RetailPosWebVasController();
const PasscodeController = RetailPosWebPasscodeController();
const LoanController = RetailPosWebLoanController();

// ── Health / info ──────────────────────────────────────────────────────────────
RetailPosWebRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Retail POS Web dummy backend",
    data: {
      graphql: "/retail-pos-web/graphql",
      upload: "/retail-pos-web/upload/media",
      oauth: "/retail-pos-web/oauth/token/:code",
      demoLogin: "Use the OAuth flow — the token endpoint returns a demo Firebase token automatically.",
    },
  });
});

// ── GraphQL ────────────────────────────────────────────────────────────────────
RetailPosWebRouter.post("/graphql", GraphqlController.HandleGraphql);
RetailPosWebRouter.get("/graphql", (_req, res) => {
  res.json({ success: true, message: "POST GraphQL operations to this endpoint." });
});

// ── OAuth token exchange ───────────────────────────────────────────────────────
// Client calls: GET /oauth/token/{code}?nonce=...&state=...&platform=...
RetailPosWebRouter.get("/oauth/token/:code", OAuthController.GetToken);
RetailPosWebRouter.get("/oauth/token", OAuthController.GetToken);
RetailPosWebRouter.post("/oauth/refresh", OAuthController.RefreshToken);

// ── Media upload ───────────────────────────────────────────────────────────────
// uploadMedia() in libs.ts: POST /upload/media?id=...&type=...
RetailPosWebRouter.post("/upload/media", UploadController.UploadMedia);

// ── Passcode ───────────────────────────────────────────────────────────────────
RetailPosWebRouter.post("/auth/passcode/verify", PasscodeController.VerifyPasscode);
RetailPosWebRouter.post("/auth/passcode/set", PasscodeController.SetPasscode);

// ── VAS — Airtime ──────────────────────────────────────────────────────────────
RetailPosWebRouter.get("/payapi/airtime/providers", VasController.GetAirtimeProviders);
RetailPosWebRouter.post("/payapi/airtime/purchase", VasController.BuyAirtime);

// ── VAS — Data ─────────────────────────────────────────────────────────────────
RetailPosWebRouter.get("/payapi/data/bundles", VasController.GetDataBundles);
RetailPosWebRouter.post("/payapi/data/purchase", VasController.BuyData);

// ── VAS — Electricity ──────────────────────────────────────────────────────────
RetailPosWebRouter.get("/payapi/electricity/discos", VasController.GetDiscos);
RetailPosWebRouter.get("/payapi/electricity/resolve", VasController.ResolveDiscoCustomer);
RetailPosWebRouter.post("/payapi/electricity/purchase", VasController.PurchaseElectricity);

// ── VAS — Cable TV ─────────────────────────────────────────────────────────────
RetailPosWebRouter.get("/payapi/cable/providers", VasController.GetCableProviders);
RetailPosWebRouter.get("/payapi/cable/packages", VasController.GetCablePackages);
RetailPosWebRouter.get("/payapi/cable/resolve", VasController.ResolveCableAccount);
RetailPosWebRouter.post("/payapi/cable/purchase", VasController.PurchaseCable);

// ── Loan API (veedez_bank) ─────────────────────────────────────────────────────
// REACT_APP_LOAN_API_BASE_URL_DEV = 'https://bank.dev.veedezpay.com/api/v1/loan'
// We proxy it under /loan/...
RetailPosWebRouter.get("/loan", LoanController.GetCustomerLoans);
RetailPosWebRouter.post("/loan/apply", LoanController.ApplyForLoan);

export default RetailPosWebRouter;
