import { Response } from "express";
import { Result, ValidationError } from "express-validator";

export const sendSuccessFeedback = (
  res: Response,
  message: string,
  data: unknown = {},
  status = 200,
) => {
  return res.status(status).json({
    success: true,
    message,
    data: data as Record<string, unknown>,
  });
};

export const sendErrorFeedback = (
  res: Response,
  status: number,
  message: string,
  data: unknown = {},
) => {
  return res.status(status).json({
    success: false,
    message,
    data: data as Record<string, unknown>,
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

export const sendListFeedback = (
  res: Response,
  message: string,
  items: unknown[],
  total?: number,
  extra: Record<string, unknown> = {},
) => {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    results: total ?? items.length,
    ...extra,
  });
};

export const sendCatchFeedback = (res: Response, error: unknown) => {
  const message = error instanceof Error ? error.message : "Unexpected error";
  return sendErrorFeedback(res, 500, message);
};
