import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import {
  cleanupOrphanResumes,
  findOrphanResumes,
  getResumeStorageStats,
} from "./file-cleanup.service";

export const getOrphanResumeFiles = asyncHandler(
  async (req: any, res: Response) => {
    const files = await findOrphanResumes();

    return sendSuccess({
      res,
      message: "Orphan resume files retrieved successfully",
      data: { files },
    });
  }
);

export const deleteOrphanResumeFiles = asyncHandler(
  async (req: any, res: Response) => {
    const result = await cleanupOrphanResumes();

    return sendSuccess({
      res,
      message: "Orphan resume files cleaned successfully",
      data: result,
    });
  }
);

export const getStorageStats = asyncHandler(
  async (req: any, res: Response) => {
    const stats = await getResumeStorageStats();

    return sendSuccess({
      res,
      message: "Storage stats retrieved successfully",
      data: stats,
    });
  }
);