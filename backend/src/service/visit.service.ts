import prisma from "../config/prisma.config.js";
import type { CreateVisitInput, VisitHistoryQuery } from "../types/visit.types.js";
import { PriorityLevel, Prisma, VisitStatus, VisitType } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js'; // Make sure ApiError is imported

interface DateQuery {
    date?: string;
    startDate?: string;
    endDate?: string;
}
export const createVisit = async (data: CreateVisitInput) => {
  
  const existingActiveVisit = await prisma.visit.findFirst({
    where: {
      patientId: data.patientId,
      currentStatus: {
        in: [VisitStatus.CHECKED_IN, VisitStatus.WITH_DOCTOR],
      },
    },
  });

  if (existingActiveVisit) {
    throw new ApiError(
      "This patient is already in the queue or with a doctor and cannot be checked in again.",
      409 
    );
  }

  const newVisit = await prisma.$transaction(async (tx) => {
    const visit = await tx.visit.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        visitType: data.visitType,
        priority: data.priority,
        scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
        currentStatus: data.visitType === VisitType.WALK_IN 
            ? VisitStatus.CHECKED_IN 
            : VisitStatus.SCHEDULED,
        checkInTime: data.visitType === VisitType.WALK_IN ? new Date() : null,
      },
    });

    await tx.visitLog.create({
      data: {
        visitId: visit.id,
        status: visit.currentStatus,
        timestamp: new Date(),
      },
    });

    return visit;
  });

  const visitWithDetails = await prisma.visit.findUnique({
    where: { id: newVisit.id },
    include: {
        patient: true,
        doctor: { include: { user: true } },
        logs: true,
    },
  });

  return visitWithDetails;
};


export const getVisitHistory = async (query: VisitHistoryQuery) => {
    const { date } = query;

    // Default to today if no date is provided
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const where: Prisma.VisitWhereInput = {
        createdAt: {
            gte: startOfDay,
            lte: endOfDay,
        }
    };

    const visits = await prisma.visit.findMany({
        where,
        include: {
            patient: true,
            doctor: { include: { user: true } },
            logs: { orderBy: { timestamp: "asc" } },
        },
        orderBy: { createdAt: "desc" },
    });

    // Calculate summary statistics for the fetched visits
    const summary = {
        totalVisits: visits.length,
        completed: visits.filter(v => v.currentStatus === 'COMPLETED').length,
        cancelled: visits.filter(v => v.currentStatus === 'CANCELLED').length,
        walkIn: visits.filter(v => v.visitType === 'WALK_IN').length,
        urgent: visits.filter(v => v.priority === 'URGENT').length,
    };

    return { visits, summary };
};

export const getPatientCompleteHistory = async (patientId: string) => {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
    });

    if (!patient) {
        throw new ApiError("Patient not found", 404);
    }

    const visits = await prisma.visit.findMany({
        where: { patientId },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
            logs: {
                orderBy: {
                    timestamp: "asc",
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return visits;
};

// Get complete history for a specific doctor (all time)
export const getDoctorCompleteHistory = async (doctorId: string) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
    });

    if (!doctor) {
        throw new ApiError("Doctor not found", 404);
    }

    const visits = await prisma.visit.findMany({
        where: { doctorId },
        include: {
            patient: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    gender: true,
                    dob: true,
                },
            },
            logs: {
                orderBy: {
                    timestamp: "asc",
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return visits;
};


export const getPatientsOnDate = async (query: DateQuery) => {
    const { date, startDate, endDate } = query;

    // Build date filter
    const where: Prisma.VisitWhereInput = {};

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        where.createdAt = {
            gte: startOfDay,
            lte: endOfDay,
        };
    } else if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.createdAt.lte = end;
        }
    }

    // Get distinct patients who have visits
    const visits = await prisma.visit.findMany({
        where,
        select: {
            patient: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },
        },
        distinct: ["patientId"],
        orderBy: {
            patient: {
                name: "asc",
            },
        },
    });

    // Extract unique patients
    const patients = visits.map((v) => v.patient);

    return patients;
};

export const getDoctorsOnDate = async (query: DateQuery) => {
    const { date, startDate, endDate } = query;

    // Build date filter
    const where: Prisma.VisitWhereInput = {};

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        where.createdAt = {
            gte: startOfDay,
            lte: endOfDay,
        };
    } else if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.createdAt.lte = end;
        }
    }

    // Get distinct doctors who have visits
    const visits = await prisma.visit.findMany({
        where,
        select: {
            doctor: {
                select: {
                    id: true,
                    specialisation: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        distinct: ["doctorId"],
        orderBy: {
            doctor: {
                user: {
                    name: "asc",
                },
            },
        },
    });

    // Extract unique doctors
    const doctors = visits.map((v) => v.doctor);

    return doctors;
};

export const getAppointmentsByDate = async (date: string) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.visit.findMany({
        where: {
            visitType: "SCHEDULED",
            scheduledTime: {
                gte: startOfDay,
                lte: endOfDay,
            },
            currentStatus: {
                notIn: ["COMPLETED", "CANCELLED"],
            },
        },
        include: {
            patient: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    gender: true,
                    dob: true,
                },
            },
            doctor: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            logs: {
                orderBy: {
                    timestamp: "asc",
                },
            },
        },
        orderBy: {
            scheduledTime: "asc",
        },
    });

    return appointments;
};


export const bookAppointment = async (data: {
    patientId: string;
    doctorId: string;
    scheduledTime: string;
    priority?: PriorityLevel;
    notes?: string;
}) => {
    const { patientId, doctorId, scheduledTime, priority = "NORMAL", notes } = data;

    // Validate patient exists
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
    });
    if (!patient) {
        throw new ApiError("Patient not found", 404);
    }

    // Validate doctor exists and is active
    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId },
    });
    if (!doctor) {
        throw new ApiError("Doctor not found", 404);
    }
    if (!doctor.isActive) {
        throw new ApiError("Doctor is not available", 400);
    }

    // Check if scheduled time is in the future
    const appointmentTime = new Date(scheduledTime);
    if (appointmentTime <= new Date()) {
        throw new ApiError("Appointment time must be in the future", 400);
    }

    // Check if slot is already booked
    const existingAppointment = await prisma.visit.findFirst({
        where: {
            doctorId,
            scheduledTime: appointmentTime,
            currentStatus: {
                notIn: ["CANCELLED", "COMPLETED"],
            },
        },
    });

    if (existingAppointment) {
        throw new ApiError("This time slot is already booked", 409);
    }

    // Create appointment with transaction
    const appointment = await prisma.$transaction(async (tx) => {
        // Create visit
        const visit = await tx.visit.create({
            data: {
                patientId,
                doctorId,
                visitType: "SCHEDULED",
                priority,
                scheduledTime: appointmentTime,
                currentStatus: "SCHEDULED",
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        gender: true,
                        dob: true,
                    },
                },
                doctor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        // Create initial log entry
        await tx.visitLog.create({
            data: {
                visitId: visit.id,
                status: "SCHEDULED",
                notes: notes || "Appointment booked",
            },
        });

        return visit;
    });

    return appointment;
};


export const rescheduleAppointment = async (visitId: string, newScheduledTime: string) => {
    // Find existing visit
    const existingVisit = await prisma.visit.findUnique({
        where: { id: visitId },
        include: {
            doctor: true,
        },
    });

    if (!existingVisit) {
        throw new ApiError("Appointment not found", 404);
    }

    // Only scheduled appointments can be rescheduled
    if (existingVisit.visitType !== "SCHEDULED") {
        throw new ApiError("Only scheduled appointments can be rescheduled", 400);
    }

    // Cannot reschedule completed or cancelled appointments
    if (["COMPLETED", "CANCELLED"].includes(existingVisit.currentStatus)) {
        throw new ApiError("Cannot reschedule a completed or cancelled appointment", 400);
    }

    // Cannot reschedule if patient is already checked in
    if (["CHECKED_IN", "WITH_DOCTOR"].includes(existingVisit.currentStatus)) {
        throw new ApiError("Cannot reschedule - patient is already checked in", 400);
    }

    // Validate new time is in the future
    const newTime = new Date(newScheduledTime);
    if (newTime <= new Date()) {
        throw new ApiError("New appointment time must be in the future", 400);
    }

    // Check if new slot is available
    const conflictingAppointment = await prisma.visit.findFirst({
        where: {
            doctorId: existingVisit.doctorId,
            scheduledTime: newTime,
            currentStatus: {
                notIn: ["CANCELLED", "COMPLETED"],
            },
            id: {
                not: visitId, // Exclude current appointment
            },
        },
    });

    if (conflictingAppointment) {
        throw new ApiError("The new time slot is already booked", 409);
    }

    // Update appointment with transaction
    const updatedVisit = await prisma.$transaction(async (tx) => {
        // Update visit
        const visit = await tx.visit.update({
            where: { id: visitId },
            data: {
                scheduledTime: newTime,
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        gender: true,
                        dob: true,
                    },
                },
                doctor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                logs: {
                    orderBy: {
                        timestamp: "asc",
                    },
                },
            },
        });

        // Create log entry
        await tx.visitLog.create({
            data: {
                visitId: visit.id,
                status: "SCHEDULED",
                notes: `Rescheduled from ${existingVisit.scheduledTime?.toLocaleString()} to ${newTime.toLocaleString()}`,
            },
        });

        return visit;
    });

    return updatedVisit;
};

export const cancelAppointment = async (visitId: string, reason?: string) => {
    // Find existing visit
    const existingVisit = await prisma.visit.findUnique({
        where: { id: visitId },
    });

    if (!existingVisit) {
        throw new ApiError("Appointment not found", 404);
    }

    // Only scheduled appointments can be cancelled
    if (existingVisit.visitType !== "SCHEDULED") {
        throw new ApiError("Only scheduled appointments can be cancelled", 400);
    }

    // Cannot cancel already completed or cancelled appointments
    if (["COMPLETED", "CANCELLED"].includes(existingVisit.currentStatus)) {
        throw new ApiError("Appointment is already completed or cancelled", 400);
    }

    // Update appointment with transaction
    const cancelledVisit = await prisma.$transaction(async (tx) => {
        // Update visit status
        const visit = await tx.visit.update({
            where: { id: visitId },
            data: {
                currentStatus: "CANCELLED",
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        gender: true,
                        dob: true,
                    },
                },
                doctor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                logs: {
                    orderBy: {
                        timestamp: "asc",
                    },
                },
            },
        });

        // Create log entry
        await tx.visitLog.create({
            data: {
                visitId: visit.id,
                status: "CANCELLED",
                notes: reason || "Appointment cancelled",
            },
        });

        return visit;
    });

    return cancelledVisit;
};

export const checkInAppointment = async (visitId: string) => {
    // Find existing visit
    const existingVisit = await prisma.visit.findUnique({
        where: { id: visitId },
    });

    if (!existingVisit) {
        throw new ApiError("Appointment not found", 404);
    }

    // Only scheduled appointments can be checked in
    if (existingVisit.visitType !== "SCHEDULED") {
        throw new ApiError("Only scheduled appointments can be checked in", 400);
    }

    // Must be in SCHEDULED status
    if (existingVisit.currentStatus !== "SCHEDULED") {
        throw new ApiError(`Cannot check in - appointment status is ${existingVisit.currentStatus}`, 400);
    }

    // Check-in with transaction
    const checkedInVisit = await prisma.$transaction(async (tx) => {
        // Update visit status
        const visit = await tx.visit.update({
            where: { id: visitId },
            data: {
                currentStatus: "CHECKED_IN",
                checkInTime: new Date(),
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        gender: true,
                        dob: true,
                    },
                },
                doctor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                logs: {
                    orderBy: {
                        timestamp: "asc",
                    },
                },
            },
        });

        // Create log entry
        await tx.visitLog.create({
            data: {
                visitId: visit.id,
                status: "CHECKED_IN",
                notes: "Patient checked in",
            },
        });

        return visit;
    });

    return checkedInVisit;
};