import * as z from "zod";
import { phoneSchema } from "./staff.types.js";
import { Gender } from "@prisma/client";

export const createPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: phoneSchema,
  gender: z.nativeEnum(Gender),
  dob: z.coerce.date(), // accepts ISO date string or JS date-like input
  address: z.string().min(2, "Address must be at least 2 characters").max(150, "Address must be at most 150 characters").optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;

export const updatePatientSchema = z.object({
  name: z.string().min(1).optional(),
  phone: phoneSchema.optional(),
  gender: z.nativeEnum(Gender).optional(),
  dob: z.coerce.date().optional(),
  address: z.string().min(2).max(150).optional(),
});

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

export const patientIdParamSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
});

export type PatientIdParam = z.infer<typeof patientIdParamSchema>;
