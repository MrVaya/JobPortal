import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export const authMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // 1. Try HTTP-only cookie
    token = req.cookies?.accessToken;

    // 2. Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;

      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = verifyToken(token);

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};