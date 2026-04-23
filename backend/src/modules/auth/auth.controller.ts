import { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service";
import { validateBody } from "../../utils/validate";
import { registerSchema, loginSchema } from "../../validations/auth.validation";

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

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to login user",
    });
  }
};

export const getMe = async (req: any, res: Response) => {
    res.json({
        success: true,
        message: "Authenticated user retrieved successfully",
        user: req.user,
    });
};