import { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join(", ");

    throw new Error(message);
  }

  return result.data;
}