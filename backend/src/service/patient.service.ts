import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/ApiError.js";
import type { CreatePatientInput, UpdatePatientInput } from "../types/patient.types.js";
import type { PaginationInput } from "../types/pagination.types.js";
import type { Prisma } from "@prisma/client";

export const createPatient = async (data: CreatePatientInput) => {
  const phone = data.phone;

  const existing = await prisma.patient.findUnique({
    where: { phone },
  });

  if (existing) {
    throw new ApiError("A patient with this phone already exists", 409);
  }

  const patient = await prisma.patient.create({
    data: {
      name: data.name,
      phone: data.phone,
      gender: data.gender,
      dob: data.dob,
      address: data.address ?? null,
    },
    include: {
      _count: {
        select: { visits: true },
      },
    },
  });

  return patient;
};

export const getPatients = async (params: PaginationInput) => {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const [patients, totalCount] = await Promise.all([
    prisma.patient.findMany({
      skip,
      take: limit,
      where: whereClause,
      include: {
        _count: { select: { visits: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.patient.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    patients,
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

export const getPatientById = async (patientId: string) => {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      visits: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { visits: true },
      },
    },
  });

  if (!patient) {
    throw new ApiError("Patient not found", 404);
  }

  return patient;
};

export const updatePatient = async (patientId: string, updateData: UpdatePatientInput) => {
  if (Object.keys(updateData).length === 0) {
    throw new ApiError("No update data provided", 400);
  }

  const existing = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!existing) {
    throw new ApiError("Patient not found", 404);
  }

  if (updateData.phone && updateData.phone !== existing.phone) {
    const phoneExists = await prisma.patient.findUnique({
      where: { phone: updateData.phone },
    });
    if (phoneExists) {
      throw new ApiError("Phone already in use by another patient", 409);
    }
  }

  const dataToUpdate = {
  ...(updateData.name !== undefined && { name: updateData.name }),
  ...(updateData.phone !== undefined && { phone: updateData.phone }),
  ...(updateData.gender !== undefined && { gender: updateData.gender }),
  ...(updateData.dob !== undefined && { dob: updateData.dob }),
  ...(updateData.address !== undefined && { address: updateData.address }),
} as Prisma.PatientUpdateInput;

const updated = await prisma.patient.update({
  where: { id: patientId },
  data: dataToUpdate,
  include: {
    _count: { select: { visits: true } },
  },
});

  return updated;
};

export const deletePatient = async (patientId: string, isPermanent: boolean) => {
  // Only permanent supported as noted in controller
  const existing = await prisma.patient.findUnique({
    where: { id: patientId },
  });

  if (!existing) {
    throw new ApiError("Patient not found", 404);
  }

  const visitCount = await prisma.visit.count({
    where: { patientId },
  });

  if (visitCount > 0) {
    throw new ApiError("Cannot permanently delete patient with existing visit records. Consider archiving instead.", 400);
  }

  await prisma.patient.delete({
    where: { id: patientId },
  });

  return null;
};
