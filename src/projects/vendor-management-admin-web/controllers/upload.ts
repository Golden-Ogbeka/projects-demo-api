import { Request, Response } from "express";
import { sendSuccessFeedback } from "../../../functions/feedback.js";

export const VendorManagementUploadController = () => {
  const UploadMedia = (_req: Request, res: Response) => {
    // Return an array of uploaded files matching the expected shape
    const uploadedFiles = [
      {
        id: "file-1",
        filename: "demo-image-1.jpg",
        type: "image/jpeg",
        url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600",
      },
    ];

    return res.json(uploadedFiles);
  };

  return { UploadMedia };
};
