import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { createDoctorSchema, doctorIdParamSchema, updateDoctorSchema } from "../types/doctor.types.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { paginationSchema } from "../types/pagination.types.js";
import * as doctorService from "../service/doctor.service.js";
import { ApiError } from "../utils/ApiError.js";
import { DayOfWeek } from "@prisma/client";

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

export const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = doctorIdParamSchema.parse(req.params);

  const doctor = await doctorService.getDoctorById(doctorId);

  return res.status(200).json(
    new ApiResponse("Doctor fetched successfully", doctor, true)
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

export const getAvailableDoctorsByDay = asyncHandler(async (req: Request, res: Response) => {
  const dayQuery = req.query.day as string;

  if (!dayQuery || !(dayQuery.toUpperCase() in DayOfWeek)) {
    throw new ApiError("A valid day of the week (e.g., 'MONDAY') is required.", 400);
  }
  
  const dayOfWeek = dayQuery.toUpperCase() as DayOfWeek;

  const doctors = await doctorService.getDoctorsByDay(dayOfWeek);

  return res.status(200).json(
    new ApiResponse("Available doctors fetched successfully", doctors, true)
  );
});


export const getDoctorAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== "string") {
        return res.status(400).json(
            new ApiResponse("Date parameter is required", null, false)
        );
    }

    const availability = await doctorService.getDoctorAvailability(doctorId!, date);

    return res.status(200).json(
        new ApiResponse(
            "Doctor availability retrieved successfully",
            availability,
            true
        )
    );
});

export const getDoctorsAvailableOnDate = asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
        return res.status(400).json(
            new ApiResponse("Date parameter is required", null, false)
        );
    }

    const doctors = await doctorService.getDoctorsAvailableOnDate(date);

    return res.status(200).json(
        new ApiResponse(
            "Available doctors retrieved successfully",
            { doctors },
            true
        )
    );
});