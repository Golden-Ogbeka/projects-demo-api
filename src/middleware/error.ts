import { NextFunction, Request, Response } from "express";
import { sendCatchFeedback } from "../functions/feedback.js";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(error);
  return sendCatchFeedback(res, error);
};
