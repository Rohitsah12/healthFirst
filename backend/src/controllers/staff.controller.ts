import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { staffCreateSchema, staffIdParamSchema, staffUpdateSchema } from "../types/staff.types.js";
import * as staffService from "../service/staff.service.js";

export const addStaff = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = staffCreateSchema.parse(req.body);

  const newStaff = await staffService.createStaff(validatedData);

  return res
    .status(201)
    .json(new ApiResponse("Staff created successfully", newStaff));
});

export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
  const staffList = await staffService.getAllStaff();

  return res
    .status(200)
    .json(new ApiResponse("Staff retrieved successfully", staffList));
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const { staffId } = staffIdParamSchema.parse(req.params);
  const updateData = staffUpdateSchema.parse(req.body);

  const updatedStaff = await staffService.updateStaff(staffId, updateData);

  return res
    .status(200)
    .json(new ApiResponse("Staff updated successfully", updatedStaff));
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const { staffId } = staffIdParamSchema.parse(req.params);

  await staffService.deleteStaff(staffId);

  return res
    .status(204)
    .json(new ApiResponse("Staff deleted successfully", null));
});