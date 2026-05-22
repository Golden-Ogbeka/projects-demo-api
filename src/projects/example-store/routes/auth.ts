import { Router } from "express";
import { body } from "express-validator";
import { ExampleStoreAuthController } from "../controllers/auth.js";

const ExampleStoreAuthRouter = Router();
const Controller = ExampleStoreAuthController();

ExampleStoreAuthRouter.post(
  "/signup",
  [
    body("name", "Name is required").exists({ checkFalsy: true }).trim(),
    body("email", "Valid email is required").isEmail().normalizeEmail(),
    body("password", "Password is required").exists({ checkFalsy: true }),
  ],
  Controller.Signup,
);

ExampleStoreAuthRouter.post(
  "/login",
  [
    body("email", "Valid email is required").isEmail().normalizeEmail(),
    body("password", "Password is required").exists({ checkFalsy: true }),
  ],
  Controller.Login,
);

ExampleStoreAuthRouter.post(
  "/verify-otp",
  [
    body("email", "Valid email is required").isEmail().normalizeEmail(),
    body("otp", "OTP is required").exists({ checkFalsy: true }).trim(),
  ],
  Controller.VerifyOtp,
);

export default ExampleStoreAuthRouter;
