import { Request, Response } from "express";

export const UploadController = () => {
  const HandleMultiple = async (req: Request, res: Response) => {
    const type = req.query.type?.toString() || "demo";
    const id = req.query.id?.toString() || "demo-id";
    const url = `https://images.unsplash.com/photo-1604719312566-8912e9227c6a?demo=${encodeURIComponent(type)}`;

    return res.json([
      {
        id,
        filename: "demo-upload-1.png",
        type,
        url,
      },
    ]);
  };

  return {
    HandleMultiple,
  };
};
