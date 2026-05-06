import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AppError } from "../utils/AppError";

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      throw new AppError("User role not found", 403);
    }

    if (!allowedRoles.includes(userRole)) {
      throw new AppError("You are not authorized to access this resource", 403);
    }

    next();
  };
};