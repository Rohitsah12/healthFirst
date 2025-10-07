import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createPatientSchema, patientIdParamSchema, updatePatientSchema } from "../types/patient.types.js";
import { paginationSchema } from "../types/pagination.types.js";
import * as patientService from "../service/patient.service.js";

export const addPatient = asyncHandler(async (req: Request, res: Response) => {
  const validated = createPatientSchema.parse(req.body);

  const newPatient = await patientService.createPatient(validated);

  return res.status(201).json(new ApiResponse("Patient created successfully", newPatient, true));
});

export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  const params = paginationSchema.parse(req.query);

  const result = await patientService.getPatients(params);

  return res.status(200).json(new ApiResponse("Patients fetched successfully", result, true));
});

export const getPatientById = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = patientIdParamSchema.parse(req.params);

  const patient = await patientService.getPatientById(patientId);

  return res.status(200).json(new ApiResponse("Patient fetched successfully", patient, true));
});

export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = patientIdParamSchema.parse(req.params);
  const updateData = updatePatientSchema.parse(req.body);

  const updated = await patientService.updatePatient(patientId, updateData);

  return res.status(200).json(new ApiResponse("Patient updated successfully", updated, true));
});

export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = patientIdParamSchema.parse(req.params);
  const isPermanent = req.query.permanent === "true";

  if (!isPermanent) {
    // Since Patient model doesn't have isActive, we disallow soft-deletes.
    return res.status(400).json(new ApiResponse("Short/soft delete not supported for patients. Use permanent=true to delete.", null, false));
  }

  await patientService.deletePatient(patientId, true);

  return res.status(200).json(new ApiResponse("Patient permanently deleted", null, true));
});
