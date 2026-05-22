import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { generateOtp } from "../../../functions/otp.js";
import {
  sendCatchFeedback,
  sendErrorFeedback,
  sendSuccessFeedback,
  sendValidationErrorFeedback,
} from "../../../functions/feedback.js";
import { sqlite } from "../../../config/db.js";
import { DemoUser, LoginBody, SignupBody, VerifyOtpBody } from "../types/index.js";

export const ExampleStoreAuthController = () => {
  const Signup = async (
    req: Request<never, never, SignupBody>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const existingUser = sqlite
        .prepare("SELECT id FROM example_store_users WHERE email = ?")
        .get(req.body.email);

      if (existingUser) {
        return sendErrorFeedback(res, 409, "User already exists");
      }

      const otp = generateOtp();

      const result = sqlite
        .prepare(
          `
            INSERT INTO example_store_users (name, email, password, otp)
            VALUES (@name, @email, @password, @otp)
          `,
        )
        .run({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          otp,
        });

      return sendSuccessFeedback(
        res,
        "Registration successful. OTP stored locally.",
        {
          user: {
            id: result.lastInsertRowid,
            name: req.body.name,
            email: req.body.email,
          },
          otp,
          emailSent: true,
        },
        201,
      );
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const Login = async (
    req: Request<never, never, LoginBody>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const user = sqlite
        .prepare(
          `
            SELECT
              id, name, email, password, otp, created_at as createdAt
            FROM example_store_users
            WHERE email = ? AND password = ?
          `,
        )
        .get(req.body.email, req.body.password) as DemoUser | undefined;

      if (!user) return sendErrorFeedback(res, 400, "Invalid login details");

      const otp = generateOtp();
      sqlite
        .prepare("UPDATE example_store_users SET otp = ? WHERE id = ?")
        .run(otp, user.id);

      return sendSuccessFeedback(res, "Login accepted. OTP stored locally.", {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        otp,
        emailSent: true,
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  const VerifyOtp = async (
    req: Request<never, never, VerifyOtpBody>,
    res: Response,
  ) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationErrorFeedback(res, errors);

      const user = sqlite
        .prepare(
          `
            SELECT
              id, name, email, password, otp, created_at as createdAt
            FROM example_store_users
            WHERE email = ? AND otp = ?
          `,
        )
        .get(req.body.email, req.body.otp) as DemoUser | undefined;

      if (!user) return sendErrorFeedback(res, 400, "Invalid OTP");

      sqlite
        .prepare("UPDATE example_store_users SET otp = NULL WHERE id = ?")
        .run(user.id);

      return sendSuccessFeedback(res, "OTP verified", {
        token: `demo-token-${user.id}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      return sendCatchFeedback(res, error);
    }
  };

  return {
    Signup,
    Login,
    VerifyOtp,
  };
};
