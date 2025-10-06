import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { doctorIdParamSchema } from "../types/doctor.types.js";
import {doctorScheduleSchema,getScheduleQuerySchema} from "../types/doctorSchedule.types.js";
import * as doctorScheduleService from "../service/doctorSchedule.service.js";

export const upsertDoctorSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { doctorId } = doctorIdParamSchema.parse(req.params);
    const scheduleData = doctorScheduleSchema.parse(req.body);

    const updatedSchedules = await doctorScheduleService.upsertDoctorSchedule(
      doctorId,
      scheduleData
    );

    return res.status(200).json(
      new ApiResponse(
        "Doctor schedule updated successfully",
        updatedSchedules,
        true
      )
    );
  }
);

export const getDoctorSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { doctorId } = doctorIdParamSchema.parse(req.params);
    const { dayOfWeek } = getScheduleQuerySchema.parse(req.query);

    const scheduleData = await doctorScheduleService.getDoctorSchedule(
      doctorId,
      dayOfWeek
    );

    return res.status(200).json(
      new ApiResponse("Doctor schedule fetched successfully", scheduleData, true)
    );
  }
);

export const deleteDoctorSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { doctorId } = doctorIdParamSchema.parse(req.params);
    const { dayOfWeek } = getScheduleQuerySchema.parse(req.query);

    const result = await doctorScheduleService.deleteDoctorSchedule(
      doctorId,
      dayOfWeek
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          result.message,
          { deletedCount: result.deletedCount },
          true
        )
      );
  }
);