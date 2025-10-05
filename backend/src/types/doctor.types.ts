import * as z from "zod";

import { emailSchema } from "./auth.types.js";
import { nameSchema, phoneSchema } from "./staff.types.js";
import { Gender } from "@prisma/client";

export const specializationSchema = z.string().min(2, "Specialization must be at least 2 characters long").max(100, "Specialization must be at most 100 characters long");

export const createDoctorSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  specialisation: specializationSchema,
  gender: z.nativeEnum(Gender)
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;

export const updateDoctorSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  specialization: specializationSchema.optional(),
  gender: z.nativeEnum(Gender).optional()
});

export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export const doctorIdParamSchema = z.object({
  doctorId: z.string().uuid("Invalid doctor ID"),
}); 