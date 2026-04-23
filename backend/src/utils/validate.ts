import { ZodSchema } from "zod";

export const validateBody = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(firstError?.message || "Invalid request data");
  }

  return result.data;
};