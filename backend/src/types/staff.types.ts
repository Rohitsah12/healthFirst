import * as z from "zod";
import { emailSchema, passwordSchema } from "./auth.types.js";

export const nameSchema = z.string().min(2, "Name must be at least 2 characters long").max(100, "Name must be at most 100 characters long");
export const phoneSchema = z.string().min(10, "Phone number must be at least 10 characters long").max(15, "Phone number must be at most 15 characters long").regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format");
export const staffCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema
});


export type StaffCreateInput = z.infer<typeof staffCreateSchema>;

export const staffUpdateSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  phone: phoneSchema.optional()
});


export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;
export const staffIdParamSchema = z.object({
  staffId: z.string().uuid("Invalid staff ID"),
}); 