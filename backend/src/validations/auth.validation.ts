import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["CANDIDATE", "EMPLOYER"]),
    companyName: z.string().optional(),
    companyLocation: z.string().optional(),
    companyDescription: z.string().optional(),
    companyWebsite: z.string().url("Company website must be a valid URL").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.role === "EMPLOYER") {
      if (!data.companyName || data.companyName.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Company name is required for employer registration",
          path: ["companyName"],
        });
      }

      if (!data.companyLocation || data.companyLocation.trim().length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Company location is required for employer registration",
          path: ["companyLocation"],
        });
      }
    }
  });

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});