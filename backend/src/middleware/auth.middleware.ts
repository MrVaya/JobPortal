import { Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export const authMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
    }

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};