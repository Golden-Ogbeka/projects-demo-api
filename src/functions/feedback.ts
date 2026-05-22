import { Response } from "express";
import { Result, ValidationError } from "express-validator";

export const sendSuccessFeedback = (
  res: Response,
  message: string,
  data: Record<string, unknown> = {},
  status = 200,
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const sendErrorFeedback = (
  res: Response,
  status: number,
  message: string,
  data: Record<string, unknown> = {},
) => {
  return res.status(status).json({
    success: false,
    message,
    data,
  });
};

export const sendValidationErrorFeedback = (
  res: Response,
  errors: Result<ValidationError>,
) => {
  return sendErrorFeedback(res, 422, "Validation failed", {
    errors: errors.array(),
  });
};

export const sendCatchFeedback = (res: Response, error: unknown) => {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return sendErrorFeedback(res, 500, message);
};
