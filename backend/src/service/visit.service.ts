import prisma from "../config/prisma.config.js";
import type { CreateVisitInput, VisitHistoryQuery } from "../types/visit.types.js";
import { Prisma, VisitStatus, VisitType } from '@prisma/client';
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