import { DayOfWeek, UserRole } from "@prisma/client";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword } from "../utils/hashingPassword.js";
import type { CreateDoctorInput, UpdateDoctorInput } from "../types/doctor.types.js";
import type { PaginationInput } from "../types/pagination.types.js";

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


export const getDoctorAvailability = async (doctorId: string, date: string) => {
    // Validate doctor exists
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
    });

    if (!doctor) {
        throw new ApiError("Doctor not found", 404);
    }

    if (!doctor.isActive) {
        throw new ApiError("Doctor is not available", 400);
    }

    // Get day of week for the target date
    const targetDate = new Date(date);
    const dayOfWeek = targetDate
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase() as DayOfWeek;

    // Find doctor's schedule for this day
    const schedule = await prisma.doctorSchedule.findFirst({
        where: {
            doctorId,
            dayOfWeek,
        },
    });

    // If no schedule for this day, return empty slots
    if (!schedule) {
        return {
            availableSlots: [],
            workingHours: null,
        };
    }

    // Get existing appointments for this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.visit.findMany({
        where: {
            doctorId,
            scheduledTime: {
                gte: startOfDay,
                lte: endOfDay,
            },
            currentStatus: {
                notIn: ["CANCELLED", "COMPLETED"],
            },
        },
        select: {
            scheduledTime: true,
        },
    });

    // Create set of booked times
    const bookedTimes = new Set(
        existingAppointments.map((apt) => apt.scheduledTime!.getTime())
    );

    // Generate 30-minute time slots
    const availableSlots: string[] = [];
    const slotDuration = 30 * 60 * 1000; // 30 minutes in milliseconds

    // Parse schedule times - they are stored in UTC
    const scheduleStart = new Date(schedule.startTime);
    const scheduleEnd = new Date(schedule.endTime);
    
    // Get UTC hours and minutes
    const utcStartHour = scheduleStart.getUTCHours();
    const utcStartMinute = scheduleStart.getUTCMinutes();
    const utcEndHour = scheduleEnd.getUTCHours();
    const utcEndMinute = scheduleEnd.getUTCMinutes();

    // Convert UTC to IST (UTC + 5:30)
    let istStartHour = utcStartHour + 5;
    let istStartMinute = utcStartMinute + 30;
    let istEndHour = utcEndHour + 5;
    let istEndMinute = utcEndMinute + 30;

    // Handle minute overflow
    if (istStartMinute >= 60) {
        istStartHour += 1;
        istStartMinute -= 60;
    }
    if (istEndMinute >= 60) {
        istEndHour += 1;
        istEndMinute -= 60;
    }

    // Handle hour overflow (past midnight)
    istStartHour = istStartHour % 24;
    istEndHour = istEndHour % 24;

    // Create current time slot starting point in IST
    let currentTime = new Date(targetDate);
    currentTime.setHours(istStartHour, istStartMinute, 0, 0);

    // Create end time for the day in IST
    const endTime = new Date(targetDate);
    endTime.setHours(istEndHour, istEndMinute, 0, 0);

    // Current timestamp for filtering past slots (in IST)
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 min buffer

    // Generate slots
    while (currentTime < endTime) {
        // Only include slots that are:
        // 1. Not already booked
        // 2. In the future (or at least 15 mins from now for buffer)
        if (!bookedTimes.has(currentTime.getTime()) && currentTime > bufferTime) {
            availableSlots.push(currentTime.toISOString());
        }

        currentTime = new Date(currentTime.getTime() + slotDuration);
    }

    return {
        availableSlots,
        workingHours: {
            dayOfWeek,
            startTime: `${istStartHour.toString().padStart(2, '0')}:${istStartMinute.toString().padStart(2, '0')}`,
            endTime: `${istEndHour.toString().padStart(2, '0')}:${istEndMinute.toString().padStart(2, '0')}`,
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