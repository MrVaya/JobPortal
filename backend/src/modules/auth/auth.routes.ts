import { Router } from "express";
import {
  getMe,
  login,
  register,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  refreshToken,
} from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/token";
import { sendEmail } from "../../utils/email";
import { PrismaClient } from "@prisma/client";
import { loginRateLimiter } from "../../middleware/rateLimit.middleware";

const prisma = new PrismaClient();


const router = Router();

router.get("/me", authMiddleware, getMe);

router.post("/register", register);
router.post("/login", loginRateLimiter, login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/refresh", refreshToken);
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Do not reveal whether email exists
    if (!user) {
      return res.json({
        success: true,
        message: "If account exists, reset link has been sent.",
      });
    }

    const token = generateToken();

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: token,
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      text: `Click this link to reset your password: ${resetLink}`,
    });

    return res.json({
      success: true,
      message: "If account exists, reset link has been sent.",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to send reset link.",
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
});

router.post("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token.",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return res.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to verify email.",
    });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        success: true,
        message: "If account exists, verification email has been sent.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified.",
      });
    }

    const token = generateToken();

    await prisma.user.update({
      where: { email },
      data: {
        emailVerificationToken: token,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      text: `Click this link to verify your email: ${verifyLink}`,
    });

    return res.json({
      success: true,
      message: "Verification email sent.",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email.",
    });
  }
});
router.post("/refresh", refreshToken);


export default router;