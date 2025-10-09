import { DayOfWeek, UserRole } from "@prisma/client";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword } from "../utils/hashingPassword.js";
import type { CreateDoctorInput, UpdateDoctorInput } from "../types/doctor.types.js";
import type { PaginationInput } from "../types/pagination.types.js";
import {  getDay, addMinutes, isBefore } from "date-fns";


export const createDoctor = async (data: CreateDoctorInput) => {
  const emailLowerCase = data.email.toLowerCase();

  const newDoctorData = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findFirst({
      where: {
        OR: [{ email: emailLowerCase }, { phone: data.phone }],
      },
    });

    if (existingUser) {
      throw new ApiError("A user with this email or phone already exists", 409);
    }

    const hashedPassword = await hashPassword("Doctor@123");

    const newUser = await tx.user.create({
      data: {
        name: data.name,
        email: emailLowerCase,
        phone: data.phone,
        password: hashedPassword,
        role: UserRole.DOCTOR,
      },
    });

    const newDoctorProfile = await tx.doctor.create({
      data: {
        userId: newUser.id,
        specialisation: data.specialisation,
        gender: data.gender,
      },
      include: {
        user: true,
      },
    });

    return newDoctorProfile;
  });

  const { password, ...userWithoutPassword } = newDoctorData.user;
  return {
    ...newDoctorData,
    user: userWithoutPassword,
  };
};

export const getDoctors = async (params: PaginationInput) => {
  const { page, limit, search, isActive } = params;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (isActive !== "all") {
    whereClause.isActive = isActive === "true";
  }

  if (search) {
    whereClause.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { phone: { contains: search } } },
      { specialisation: { contains: search, mode: "insensitive" } },
    ];
  }

  const [doctors, totalCount] = await Promise.all([
    prisma.doctor.findMany({
      skip: skip,
      take: limit,
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
          },
        },
        workingHours: {
          orderBy: {
            dayOfWeek: 'asc'
          }
        },
        _count: {
          select: {
            visits: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.doctor.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    doctors,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage,
      hasPrevPage,
    },
  };
};

export const getDoctorById = async (doctorId: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      workingHours: {
        orderBy: {
          dayOfWeek: 'asc'
        }
      },
      _count: {
        select: {
          visits: true,
        },
      },
    },
  });

  if (!doctor) {
    throw new ApiError("Doctor not found", 404);
  }

  return doctor;
};

export const updateDoctor = async (doctorId: string, updateData: UpdateDoctorInput) => {
  if (Object.keys(updateData).length === 0) {
    throw new ApiError("No update data provided", 400);
  }

  const updatedDoctor = await prisma.$transaction(async (tx) => {
    const existingDoctor = await tx.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (!existingDoctor) {
      throw new ApiError("Doctor not found", 404);
    }

    const userUpdateData: any = {};
    if (updateData.name) userUpdateData.name = updateData.name;
    if (updateData.email) {
      userUpdateData.email = updateData.email.toLowerCase();

      const emailExists = await tx.user.findFirst({
        where: {
          email: userUpdateData.email,
          id: { not: existingDoctor.userId },
        },
      });

      if (emailExists) {
        throw new ApiError("Email already in use by another user", 409);
      }
    }
    if (updateData.phone) {
      userUpdateData.phone = updateData.phone;

      const phoneExists = await tx.user.findFirst({
        where: {
          phone: updateData.phone,
          id: { not: existingDoctor.userId },
        },
      });

      if (phoneExists) {
        throw new ApiError("Phone already in use by another user", 409);
      }
    }

    if (Object.keys(userUpdateData).length > 0) {
      await tx.user.update({
        where: { id: existingDoctor.userId },
        data: userUpdateData,
      });
    }

    const doctorUpdateData: any = {};
    if (updateData.specialization) {
      doctorUpdateData.specialisation = updateData.specialization;
    }
    if (updateData.gender) {
      doctorUpdateData.gender = updateData.gender;
    }

    if (Object.keys(doctorUpdateData).length > 0) {
      await tx.doctor.update({
        where: { id: doctorId },
        data: doctorUpdateData,
      });
    }

    const updatedDoctorProfile = await tx.doctor.findUniqueOrThrow({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        workingHours: {
          orderBy: {
            dayOfWeek: 'asc'
          }
        },
        _count: {
          select: { visits: true },
        },
      },
    });

    return updatedDoctorProfile;
  });

  return updatedDoctor;
};

export const deleteDoctor = async (doctorId: string, isPermanent: boolean) => {
  if (isPermanent) {
    await prisma.$transaction(async (tx) => {
      const existingDoctor = await tx.doctor.findUnique({
        where: { id: doctorId },
        include: { user: true },
      });

      if (!existingDoctor) {
        throw new ApiError("Doctor not found", 404);
      }

      const visitCount = await tx.visit.count({
        where: { doctorId },
      });

      if (visitCount > 0) {
        throw new ApiError(
          "Cannot permanently delete doctor with existing visit records. Consider deactivating instead.",
          400
        );
      }

      await tx.doctor.delete({
        where: { id: doctorId },
      });

      await tx.user.delete({
        where: { id: existingDoctor.userId },
      });
    });

    return null;
  } else {
    const deactivatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { isActive: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!deactivatedDoctor) {
      throw new ApiError("Doctor not found", 404);
    }

    return deactivatedDoctor;
  }
};


export const getDoctorsByDay = async (dayOfWeek: DayOfWeek) => {
  const doctors = await prisma.doctor.findMany({
    where: {
      isActive: true, // Only find active doctors
      workingHours: {
        some: {
          dayOfWeek: dayOfWeek,
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      workingHours: {
        where: {
          dayOfWeek: dayOfWeek, // Optionally, only return the relevant schedule
        },
      },
    },
    orderBy: {
      user: {
        name: 'asc',
      },
    },
  });

  return doctors;
};

const dayMap: { [key: number]: DayOfWeek } = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
};
export const getDoctorAvailability = async (doctorId: string, date: string) => {
    // 1. Validate doctor exists and is active
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
        throw new ApiError("Doctor not found", 404);
    }
    if (!doctor.isActive) {
        throw new ApiError("Doctor is not currently active", 400);
    }

    // 2. Determine the day of the week from the requested date
    const targetDate = new Date(date); // Creates a date at 00:00:00 UTC
    const dayOfWeek = dayMap[getDay(targetDate)]!;

    // 3. Find the doctor's schedule for that day
    
    const schedule = await prisma.doctorSchedule.findFirst({
        where: { doctorId, dayOfWeek },
    });

    // If the doctor doesn't work on this day, return empty results
    if (!schedule) {
        return { availableSlots: [], workingHours: null };
    }

    // 4. Construct the start and end of working hours in UTC
    // Since DB time is already UTC, we combine the target date with the schedule's time.
    const workingHoursStart = new Date(targetDate);
    workingHoursStart.setUTCHours(
        schedule.startTime.getUTCHours(),
        schedule.startTime.getUTCMinutes(),
        0, 0
    );

    const workingHoursEnd = new Date(targetDate);
    workingHoursEnd.setUTCHours(
        schedule.endTime.getUTCHours(),
        schedule.endTime.getUTCMinutes(),
        0, 0
    );

    // 5. Find all existing appointments for the doctor on that day to block those slots
    const existingVisits = await prisma.visit.findMany({
        where: {
            doctorId: doctorId,
            scheduledTime: {
                gte: workingHoursStart,
                lt: workingHoursEnd,
            },
            currentStatus: { notIn: ["CANCELLED", "COMPLETED"] },
        },
        select: { scheduledTime: true },
    });

    // Use a Set for efficient lookup of booked slots
    const bookedSlots = new Set(
        existingVisits.map(v => v.scheduledTime!.toISOString())
    );

    // 6. Generate time slots and filter out any that are booked or in the past
    const availableSlots: string[] = [];
    const slotDuration = 30; // 30 minutes
    let currentSlot = workingHoursStart;

    // Set a buffer to prevent booking appointments too close to the current time
    const nowInUTC = new Date();
    const bufferTime = addMinutes(nowInUTC, 15); // 15-minute buffer

    while (isBefore(currentSlot, workingHoursEnd)) {
        // A slot is available if it's not in the booked list AND it's after the buffer time
        if (!bookedSlots.has(currentSlot.toISOString()) && isBefore(bufferTime, currentSlot)) {
            availableSlots.push(currentSlot.toISOString());
        }
        currentSlot = addMinutes(currentSlot, slotDuration);
    }

    // 7. Format the working hours for a user-friendly response
    const formatTime = (date: Date) => {
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return {
        availableSlots,
        workingHours: {
            dayOfWeek: schedule.dayOfWeek,
            startTime: formatTime(schedule.startTime),
            endTime: formatTime(schedule.endTime),
        },
    };
};
export const getDoctorsAvailableOnDate = async (date: string) => {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase() as DayOfWeek;

    const doctors = await prisma.doctor.findMany({
        where: {
            isActive: true,
            workingHours: {
                some: {
                    dayOfWeek,
                },
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            workingHours: {
                where: {
                    dayOfWeek,
                },
            },
        },
        orderBy: {
            user: {
                name: "asc",
            },
        },
    });

    return doctors;
};