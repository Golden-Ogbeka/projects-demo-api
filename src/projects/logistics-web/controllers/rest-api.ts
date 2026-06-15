import { Request, Response } from "express";
import { sqlite } from "../../../config/db.js";

export const RestApiController = () => {
  const Login = async (req: Request, res: Response) => {
    const { email, password } = req.body || {};

    const user = sqlite.prepare("SELECT * FROM logistics_web_users WHERE email = ? AND password = ?").get(email, password) as Record<string, unknown> | undefined;

    if (user) {
      return res.json({
        success: true,
        message: "Login successful",
        data: {
          token: "demo-logistics-web-token",
          user: {
            _id: user._id,
            id: user._id,
            userId: user.userId || user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            phoneNumber: user.phoneNumber,
            phone: user.phone || user.phoneNumber,
            isVerified: Boolean(user.isVerified),
            accountType: user.accountType || "personal",
            profilePicture: user.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          expiresIn: 86400,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  };

  const ForgotPassword = async (_req: Request, res: Response) => {
    return res.json({
      success: true,
      message: "Password reset link sent to your email",
      data: { emailSent: true },
    });
  };

  const GooglePlaceDetails = async (_req: Request, res: Response) => {
    return res.json({
      candidates: [
        {
          formatted_address: "42 Marina Street, Lagos Island, Lagos, Nigeria",
          geometry: { location: { lat: 6.4394, lng: 3.3934 } },
          name: "ShipPlug Africa - Lagos Hub",
          place_id: "demo-place-lagos-hub",
          rating: 4.5,
          user_ratings_total: 128,
          photos: [{ photo_reference: "demo-photo-1", height: 400, width: 600 }],
          vicinity: "Marina Street",
        },
      ],
      status: "OK",
    });
  };

  const ContactUs = async (req: Request, res: Response) => {
    return res.json({
      success: true,
      message: "Message received. We will get back to you shortly.",
    });
  };

  return { Login, ForgotPassword, GooglePlaceDetails, ContactUs };
};
