import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { createDoctorSchema, doctorIdParamSchema, updateDoctorSchema } from "../types/doctor.types.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { paginationSchema } from "../types/pagination.types.js";
import * as doctorService from "../service/doctor.service.js";

export const addDoctor = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createDoctorSchema.parse(req.body);

  const newDoctor = await doctorService.createDoctor(validatedData);

  return res
    .status(201)
    .json(new ApiResponse("Doctor created successfully", newDoctor, true));
});

export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const params = paginationSchema.parse(req.query);

  const result = await doctorService.getDoctors(params);

  return res.status(200).json(
    new ApiResponse("Doctors fetched successfully", result, true)
  );
});

export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = doctorIdParamSchema.parse(req.params);
  const updateData = updateDoctorSchema.parse(req.body);

  const updatedDoctor = await doctorService.updateDoctor(doctorId, updateData);

  return res.status(200).json(
    new ApiResponse("Doctor updated successfully", updatedDoctor, true)
  );
});

export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = doctorIdParamSchema.parse(req.params);
  const isPermanent = req.query.permanent === "true";

  const result = await doctorService.deleteDoctor(doctorId, isPermanent);

  const message = isPermanent 
    ? "Doctor permanently deleted" 
    : "Doctor deactivated successfully";

  return res.status(200).json(new ApiResponse(message, result, true));
});