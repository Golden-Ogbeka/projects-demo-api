import { Request, Response } from "express";
import { sendSuccessFeedback } from "../../../functions/feedback.js";

export const TemplateController = () => {
  const GetStatus = async (_req: Request, res: Response) => {
    return sendSuccessFeedback(res, "Template project is ready");
  };

  return {
    GetStatus,
  };
};
