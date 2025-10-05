import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { doctorIdParamSchema } from "../types/doctor.types.js";
import { 
  doctorScheduleSchema, 
  getScheduleQuerySchema 
} from "../types/doctorSchedule.types.js";


export const upsertDoctorSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { doctorId } = doctorIdParamSchema.parse(req.params);

    const { schedules } = doctorScheduleSchema.parse(req.body);

    const updatedSchedules = await prisma.$transaction(async (tx) => {
      const doctor = await tx.doctor.findUnique({
        where: { id: doctorId },
      });

      if (!doctor) {
        throw new ApiError("Doctor not found", 404);
      }

      const daysToUpdate = [...new Set(schedules.map((s) => s.dayOfWeek))];

      await tx.doctorSchedule.deleteMany({
        where: {
          doctorId,
          dayOfWeek: { in: daysToUpdate },
        },
      });

      const createdSchedules = await Promise.all(
        schedules.map((schedule) =>
          tx.doctorSchedule.create({
            data: {
              doctorId,
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            },
          })
        )
      );

      return createdSchedules;
    });

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

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { id: true, user: { select: { name: true } } },
    });

    if (!doctor) {
      throw new ApiError("Doctor not found", 404);
    }

    const whereClause: any = { doctorId };
    if (dayOfWeek) {
      whereClause.dayOfWeek = dayOfWeek;
    }

    const schedules = await prisma.doctorSchedule.findMany({
      where: whereClause,
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });

    return res.status(200).json(
      new ApiResponse(
        "Doctor schedule fetched successfully",
        {
          doctor: {
            id: doctor.id,
            name: doctor.user.name,
          },
          schedules,
        },
        true
      )
    );
  }
);


export const deleteDoctorSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { doctorId } = doctorIdParamSchema.parse(req.params);

    const { dayOfWeek } = getScheduleQuerySchema.parse(req.query);

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new ApiError("Doctor not found", 404);
    }

    const whereClause: any = { doctorId };
    if (dayOfWeek) {
      whereClause.dayOfWeek = dayOfWeek;
    }

    const deletedCount = await prisma.doctorSchedule.deleteMany({
      where: whereClause,
    });

    const message = dayOfWeek
      ? `Schedule for ${dayOfWeek} deleted successfully`
      : "All schedules deleted successfully";

    return res.status(200).json(
      new ApiResponse(message, { deletedCount: deletedCount.count }, true)
    );
  }
);