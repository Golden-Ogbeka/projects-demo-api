import { Request } from "express";

export type PaginatedBody = { page?: number; limit?: number; populate?: unknown; fields?: string };
export type WithId = { _id: string };
export type ApiResponse<T> = { success: boolean; message: string; data: T; count?: number };

declare module "express" {
  interface Request {
    userId?: string;
    adminId?: string;
  }
}
