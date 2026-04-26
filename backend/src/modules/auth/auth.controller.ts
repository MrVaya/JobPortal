import { Request, Response } from "express";
import {
  forgotPasswordService,
  loginUser,
  registerUser,
  refreshTokenService,
  resendVerificationEmailService,
  resetPasswordService,
  verifyEmailService,
} from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/ApiResponse";
import { COOKIE_NAMES } from "../../constants";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await registerUser(req.body);

  return sendSuccess({
    res,
    statusCode: 201,
    message: "User registered successfully",
    data: { user },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);

  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

 res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess({
    res,
    message: "Login successful",
    data: { user: result.user },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await forgotPasswordService(req.body.email);

  return sendSuccess({
    res,
    message: result.message,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token;
  const result = await resetPasswordService(token, req.body.password);

  return sendSuccess({
    res,
    message: result.message,
  });
});

export const resendVerificationEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await resendVerificationEmailService(req.body.email);

    return sendSuccess({
      res,
      message: result.message,
    });
  }
);

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token;
  const result = await verifyEmailService(token);

  return sendSuccess({
    res,
    message: result.message,
  });
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
  return sendSuccess({
    res,
    message: "Authenticated user retrieved successfully",
    data: { user: req.user },
  });
});

export const refreshToken = asyncHandler(async (req: any, res: Response) => {
  const token = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN]

  if (!token) {
    throw new AppError("No refresh token", 401);
  }

  const result = await refreshTokenService(token);

  res.cookie("accessToken", result.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  return sendSuccess({
    res,
    message: "Session refreshed successfully",
  });
});