import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";

export const RestApiController = () => {
  const Login = async (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    const row = sqlite.prepare("SELECT * FROM logistics_admin_users WHERE email = ? AND password = ?").get(email, password) as Record<string, unknown> | undefined;

    if (row) {
      return res.json({
        success: true,
        message: "Login successful",
        data: {
          token: "demo-token-user-1",
          refreshToken: "demo-refresh-token-user-1",
          expiresIn: 86400,
          user: {
            id: row._id,
            _id: row._id,
            userId: row.userId,
            name: row.name,
            firstName: row.firstName,
            lastName: row.lastName,
            otherName: row.otherName || "",
            userName: row.userName,
            email: row.email,
            phoneNumber: row.phoneNumber,
            role: row.role,
            avatar: row.avatar || "",
            isActive: Boolean(row.isActive),
            accountType: row.accountType,
            isEmailVerified: Boolean(row.isEmailVerified),
            createdAt: row.createdAt,
          },
        },
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  };

  const ForgotPassword = async (req: Request, res: Response) => {
    return res.json({
      success: true,
      message: "If an account exists with that email, a password reset link has been sent",
    });
  };

  const DashboardSummary = async (req: Request, res: Response) => {
    return res.json({
      success: true,
      message: "Dashboard summary retrieved",
      data: {
        totalParcels: 1250,
        inTransit: 340,
        deliveredToday: 85,
        pendingPickup: 42,
        returned: 18,
        cancelled: 25,
        totalRevenue: 4580000,
        monthlyRevenue: 1250000,
        activeUsers: 48,
        avgDeliveryTime: "2.5 days",
      },
    });
  };

  const FileUploadSignedUrl = async (req: Request, res: Response) => {
    return res.json({
      success: true,
      message: "Signed URL generated",
      data: {
        url: "https://demo-uploads.s3.amazonaws.com/uploads/demo-file.png",
        key: "uploads/demo-file.png",
        fields: { key: "uploads/demo-file.png", "Content-Type": "image/png" },
      },
    });
  };

  return { Login, ForgotPassword, DashboardSummary, FileUploadSignedUrl };
};
