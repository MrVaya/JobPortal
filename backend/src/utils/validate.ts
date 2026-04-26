import { ZodSchema } from "zod";

export function validateBody<T>(
  schema: ZodSchema<T>,
  body: unknown
): T {
  return schema.parse(body);
}