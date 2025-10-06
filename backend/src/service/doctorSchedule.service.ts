import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/ApiError.js";
import type { DoctorScheduleInput } from "../types/doctorSchedule.types.js";
export const upsertDoctorSchedule = async (doctorId: string,data: DoctorScheduleInput) => {
  const { schedules } = data;

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

  return updatedSchedules;
};

export const getDoctorSchedule = async (
  doctorId: string,
  dayOfWeek?: string
) => {
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
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return {
    doctor: {
      id: doctor.id,
      name: doctor.user.name,
    },
    schedules,
  };
};

export const deleteDoctorSchedule = async (
  doctorId: string,
  dayOfWeek?: string
) => {
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

  return {
    message,
    deletedCount: deletedCount.count,
  };
};