import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../../lib/prisma";
import { generateToken } from "../../lib/jwt";
import { sendEmail } from "../../utils/email";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../lib/jwt";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

function createSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

export const registerUser = async (data: any) => {
  const {
    name,
    email,
    password,
    role,
    companyName,
    companyLocation,
    companyDescription,
    companyWebsite,
  } = data;

  if (!["CANDIDATE", "EMPLOYER"].includes(role)) {
    throw new Error("Invalid role");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const emailVerificationToken = createSecureToken();
  const emailVerificationExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  let user;

  if (role === "EMPLOYER") {
    if (!companyName || !companyLocation) {
      throw new Error("Company name and location are required");
    }

    const company = await prisma.company.create({
      data: {
        name: companyName,
        location: companyLocation,
        description: companyDescription || null,
        website: companyWebsite || null,
      },
    });

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        companyId: company.id,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });
  }

  const verifyLink = `${FRONTEND_URL}/verify-email/${emailVerificationToken}`;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Click this link to verify your email: ${verifyLink}`,
  });

  const { password: _, ...safeUser } = user;

  return safeUser;
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
    },
  });

  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

export const forgotPasswordService = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      message: "If an account exists, reset link has been sent.",
    };
  }

  const passwordResetToken = createSecureToken();
  const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      passwordResetToken,
      passwordResetExpires,
    },
  });

  const resetLink = `${FRONTEND_URL}/reset-password/${passwordResetToken}`;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    text: `Click this link to reset your password: ${resetLink}`,
  });

  return {
    message: "If an account exists, reset link has been sent.",
  };
};

export const resetPasswordService = async (
  token: string,
  password: string
) => {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
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
    throw new Error("Invalid or expired reset token");
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

  return {
    message: "Password updated successfully",
  };
};

export const verifyEmailService = async (token: string) => {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error("Invalid or expired verification token");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  return {
    message: "Email verified successfully",
  };
};

export const resendVerificationEmailService = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      message: "If account exists, verification email has been sent.",
    };
  }

  if (user.emailVerified) {
    throw new Error("Email is already verified");
  }

  const emailVerificationToken = createSecureToken();
  const emailVerificationExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  await prisma.user.update({
    where: { email },
    data: {
      emailVerificationToken,
      emailVerificationExpires,
    },
  });

  const verifyLink = `${FRONTEND_URL}/verify-email/${emailVerificationToken}`;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `Click this link to verify your email: ${verifyLink}`,
  });

  return {
    message: "Verification email sent",
  };
};

export const refreshTokenService = async (token: string) => {
  const decoded = verifyToken(token) as { userId?: string };

  if (!decoded?.userId) {
    throw new Error("Invalid refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || user.refreshToken !== token) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  return {
    accessToken,
  };
};