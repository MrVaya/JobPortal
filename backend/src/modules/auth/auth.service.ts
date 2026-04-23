import bcrypt from "bcrypt";
import prisma from "../../lib/prisma";
import { generateToken } from "../../lib/jwt";
import { Role } from "@prisma/client";

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
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
  }

  return user;
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


    const token = generateToken({
        userId: user.id,
        role: user.role,
    });

    return { user, token };
};