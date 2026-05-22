import { Request, Response } from "express";
import { createDemoFirebaseToken, demoAirtimeProviders, demoCableProviders, demoDiscos } from "./fixtures.js";

// ─── OAuth token endpoint ─────────────────────────────────────────────────────
// The client calls GET /oauth/token/{code}?nonce=...&state=...&platform=...
// It expects { token, isPasscodeSet }
export const RetailPosWebOAuthController = () => {
  const GetToken = (_req: Request, res: Response) => {
    return res.json({
      token: createDemoFirebaseToken(),
      isPasscodeSet: true,
    });
  };

  const RefreshToken = (_req: Request, res: Response) => {
    return res.json({
      token: createDemoFirebaseToken(),
    });
  };

  return { GetToken, RefreshToken };
};

// ─── Upload media ─────────────────────────────────────────────────────────────
// uploadMedia() in libs.ts calls POST /upload/media?id=...&type=...
// It expects an array: [{ url }]
export const RetailPosWebUploadController = () => {
  const UploadMedia = (_req: Request, res: Response) => {
    return res.json([
      { url: "https://images.unsplash.com/photo-1556742049-0cfed4f06a45?w=400" },
    ]);
  };

  return { UploadMedia };
};

// ─── VAS (Value Added Services) REST routes ───────────────────────────────────
// These are called via Axios through useVeedezApiRequest hook
export const RetailPosWebVasController = () => {
  // GET /payapi/airtime/providers
  const GetAirtimeProviders = (_req: Request, res: Response) => {
    return res.json({ success: true, data: demoAirtimeProviders });
  };

  // POST /payapi/airtime/purchase
  const BuyAirtime = (_req: Request, res: Response) => {
    return res.json({ success: true, data: { reference: `AIRTIME-${Date.now()}`, status: "SUCCESSFUL" } });
  };

  // GET /payapi/data/bundles?network=...
  const GetDataBundles = (req: Request, res: Response) => {
    const network = req.query.network || "MTN";
    return res.json({
      success: true,
      data: [
        { id: `${network}-500mb`, name: "500MB - 7 days", price: 500, network },
        { id: `${network}-1gb`, name: "1GB - 30 days", price: 1000, network },
        { id: `${network}-2gb`, name: "2GB - 30 days", price: 1500, network },
        { id: `${network}-5gb`, name: "5GB - 30 days", price: 3000, network },
      ],
    });
  };

  // POST /payapi/data/purchase
  const BuyData = (_req: Request, res: Response) => {
    return res.json({ success: true, data: { reference: `DATA-${Date.now()}`, status: "SUCCESSFUL" } });
  };

  // GET /payapi/electricity/discos
  const GetDiscos = (_req: Request, res: Response) => {
    return res.json({ success: true, data: demoDiscos });
  };

  // GET /payapi/electricity/resolve?meterNumber=...&disco=...
  const ResolveDiscoCustomer = (_req: Request, res: Response) => {
    return res.json({ success: true, data: { name: "Demo Customer", address: "12 Demo Road, Ibadan" } });
  };

  // POST /payapi/electricity/purchase
  const PurchaseElectricity = (_req: Request, res: Response) => {
    return res.json({ success: true, data: { token: "1234-5678-9012-3456", units: "50.0", reference: `ELEC-${Date.now()}` } });
  };

  // GET /payapi/cable/providers
  const GetCableProviders = (_req: Request, res: Response) => {
    return res.json({ success: true, data: demoCableProviders });
  };

  // GET /payapi/cable/packages?provider=...
  const GetCablePackages = (req: Request, res: Response) => {
    const provider = req.query.provider || "dstv";
    return res.json({
      success: true,
      data: [
        { id: `${provider}-compact`, name: `${String(provider).toUpperCase()} Compact`, price: 9000, provider },
        { id: `${provider}-premium`, name: `${String(provider).toUpperCase()} Premium`, price: 21000, provider },
      ],
    });
  };

  // GET /payapi/cable/resolve?smartCardNumber=...&provider=...
  const ResolveCableAccount = (_req: Request, res: Response) => {
    return res.json({ success: true, data: { name: "Demo Subscriber", smartCardNumber: "1234567890" } });
  };

  // POST /payapi/cable/purchase
  const PurchaseCable = (_req: Request, res: Response) => {
    return res.json({ success: true, data: { reference: `CABLE-${Date.now()}`, status: "SUCCESSFUL" } });
  };

  return {
    GetAirtimeProviders,
    BuyAirtime,
    GetDataBundles,
    BuyData,
    GetDiscos,
    ResolveDiscoCustomer,
    PurchaseElectricity,
    GetCableProviders,
    GetCablePackages,
    ResolveCableAccount,
    PurchaseCable,
  };
};

// ─── Passcode REST routes ─────────────────────────────────────────────────────
// POST /auth/passcode/verify  and  POST /auth/passcode/set
export const RetailPosWebPasscodeController = () => {
  const VerifyPasscode = (_req: Request, res: Response) => {
    return res.json({ success: true, isPasscodeSet: true, data: { isPasscodeSet: true, verified: true } });
  };

  const SetPasscode = (_req: Request, res: Response) => {
    return res.json({ success: true, isPasscodeSet: true, data: { isPasscodeSet: true, set: true } });
  };

  return { VerifyPasscode, SetPasscode };
};

// ─── Loan API (veedez_bank) ───────────────────────────────────────────────────
// The loan module calls REACT_APP_LOAN_API_BASE_URL_DEV/...
export const RetailPosWebLoanController = () => {
  const GetCustomerLoans = (_req: Request, res: Response) => {
    return res.json({
      status: "successful",
      data: {
        responseBody: {
          status: "successful",
          data: {
            nodes: [],
            pageInfo: { currentPage: 1, size: 10, totalCount: 0, hasNextPage: false },
          },
        },
      },
    });
  };

  const ApplyForLoan = (_req: Request, res: Response) => {
    return res.json({ status: "successful", data: { loanId: "loan-demo-1", status: "PENDING_APPROVAL" } });
  };

  return { GetCustomerLoans, ApplyForLoan };
};
