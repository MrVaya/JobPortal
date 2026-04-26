import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/ApiResponse";

export const errorMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);

  if (error instanceof ZodError) {
    return sendError({
      res,
      statusCode: 400,
      message: error.issues
        .map((issue) => issue.message)
        .join(", "),
    });
  }

  if (error.statusCode) {
    return sendError({
      res,
      statusCode: error.statusCode,
      message: error.message,
    });
  }

  return sendError({
    res,
    statusCode: 500,
    message: "Internal server error",
  });
};