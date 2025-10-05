import * as z from "zod";
import { emailSchema, passwordSchema } from "./auth.types.js";

const nameSchema = z.string().min(2, "Name must be at least 2 characters long").max(100, "Name must be at most 100 characters long");


export const staffCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});


export type StaffCreateInput = z.infer<typeof staffCreateSchema>;

export const staffUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
});


export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;
export const staffIdParamSchema = z.object({
  staffId: z.string().uuid("Invalid staff ID"),
}); 