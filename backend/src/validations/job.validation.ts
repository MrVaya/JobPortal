import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location is required"),
  jobType: z.enum(["Full-time", "Part-time", "Remote"]),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
});

export const applyToJobSchema = z.object({
  coverLetter: z.string().min(5, "Cover letter must be at least 5 characters"),
});