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

import { validateBody } from "../../utils/validate";

import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} from "../../validations/auth.validation";

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = validateBody(registerSchema, req.body);

    const user = await registerUser(validatedData);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to register user",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = validateBody(loginSchema, req.body);

    const result = await loginUser(validatedData);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to login user",
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const validatedData = validateBody(forgotPasswordSchema, req.body);

    const result = await forgotPasswordService(validatedData.email);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send password reset email",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const validatedData = validateBody(resetPasswordSchema, req.body);

    const result = await resetPasswordService(
      token,
      validatedData.password
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
};

export const resendVerificationEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const validatedData = validateBody(
      resendVerificationSchema,
      req.body
    );

    const result = await resendVerificationEmailService(
      validatedData.email
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to resend verification email",
    });
  }
};

export const getMe = async (req: any, res: Response) => {
  return res.json({
    success: true,
    message: "Authenticated user retrieved successfully",
    user: req.user,
  });
};

export const refreshToken = async (req: any, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No refresh token",
      });
    }

    const result = await refreshTokenService(token);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({
      success: true,
    });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};