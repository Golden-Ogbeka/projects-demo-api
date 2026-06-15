import { Request, Response } from "express";

export const RestApiController = () => {
  const UploadProductImage = async (req: Request, res: Response) => {
    const productId = req.params.productId || "demo-product";
    return res.json({
      success: true,
      message: "Product image uploaded",
      data: { id: productId, url: `https://images.unsplash.com/photo-1556745757-8d76bdb6984b?product=${productId}` },
    });
  };

  const UploadRebateDiscount = async (req: Request, res: Response) => {
    return res.json({ success: true, message: "Rebate discount CSV uploaded" });
  };

  const UploadTarget = async (req: Request, res: Response) => {
    return res.json({ success: true, message: "Target CSV uploaded" });
  };

  const UploadAdminImage = async (req: Request, res: Response) => {
    const adminId = req.params.id || "zeebly-admin-1";
    return res.json({
      success: true,
      message: "Admin image uploaded",
      data: { id: adminId, url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" },
    });
  };

  const DownloadAuditTrail = async (req: Request, res: Response) => {
    const logType = req.query.log_type?.toString() || "admin";
    const csvHeader = "id,action_type,description,action_date,created_at";
    const csvBody = Array.from({ length: 5 }, (_, i) =>
      `${logType}-${i + 1},${["CREATE", "UPDATE", "DELETE"][i % 3]},Demo ${logType} action ${i + 1},${new Date(Date.now() - i * 86400000).toISOString()},${new Date(Date.now() - i * 86400000).toISOString()}`
    ).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${logType}_audit_trail.csv"`);
    return res.send(`${csvHeader}\n${csvBody}`);
  };

  const RefreshToken = async (req: Request, res: Response) => {
    res.setHeader("x-token", "demo-refreshed-access-token");
    res.setHeader("x-refresh-token", "demo-refreshed-refresh-token");
    res.setHeader("Access-Control-Expose-Headers", "x-token, x-refresh-token");
    return res.json({ success: true, message: "Token refreshed" });
  };

  return {
    UploadProductImage,
    UploadRebateDiscount,
    UploadTarget,
    UploadAdminImage,
    DownloadAuditTrail,
    RefreshToken,
  };
};
