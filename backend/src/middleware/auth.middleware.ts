import { Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { COOKIE_NAMES } from "../constants";

export const authMiddleware = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN]

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