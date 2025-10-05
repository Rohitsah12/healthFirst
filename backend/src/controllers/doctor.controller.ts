import type { Request, Response } from "express";
import { UserRole } from "@prisma/client";

import asyncHandler from "../utils/asyncHandler.js";
import { createDoctorSchema, doctorIdParamSchema, updateDoctorSchema } from "../types/doctor.types.js";
import { hashPassword } from "../utils/hashingPassword.js";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { paginationSchema } from "../types/pagination.types.js";


export const addDoctor = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, specialisation, gender } = createDoctorSchema.parse(
        req.body
    );

    const emailLowerCase = email.toLowerCase();

    const newDoctorData = await prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findFirst({
            where: {
                OR: [{ email: emailLowerCase }, { phone: phone }],
            },
        });

        if (existingUser) {
            throw new ApiError("A user with this email or phone already exists", 409); 
        }

        const hashedPassword = await hashPassword("Doctor@123");

        const newUser = await tx.user.create({
            data: {
                name,
                email: emailLowerCase,
                phone,
                password: hashedPassword,
                role: UserRole.DOCTOR,
            },
        });

        const newDoctorProfile = await tx.doctor.create({
            data: {
                userId: newUser.id,
                specialisation,
                gender,
            },
            include: {
                user: true, 
            }
        });

        return newDoctorProfile;
    });

    const { password, ...userWithoutPassword } = newDoctorData.user;
    const sanitizedResponse = {
        ...newDoctorData,
        user: userWithoutPassword,
    };
    
    return res
        .status(201)
        .json(new ApiResponse("Doctor created successfully", sanitizedResponse, true));
});


export const getDoctors = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, isActive } = paginationSchema.parse(req.query);

  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (isActive !== 'all') {
    whereClause.isActive = isActive === 'true';
  }

  if (search) {
    whereClause.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { phone: { contains: search } } },
      { specialisation: { contains: search, mode: 'insensitive' } },
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
        _count: {
          select: {
            visits: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', 
      },
    }),
    prisma.doctor.count({ 
      where: whereClause 
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(200).json(
    new ApiResponse(
      'Doctors fetched successfully',
      {
        doctors,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
      true
    )
  );
});

export const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = doctorIdParamSchema.parse(req.params);

  const updateData = updateDoctorSchema.parse(req.body);

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
        _count: {
          select: { visits: true },
        },
      },
    });

    return updatedDoctorProfile;
  });

  return res.status(200).json(
    new ApiResponse("Doctor updated successfully", updatedDoctor, true)
  );
});


export const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { doctorId } = doctorIdParamSchema.parse(req.params);

  const isPermanent = req.query.permanent === 'true';

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

    return res.status(200).json(
      new ApiResponse("Doctor permanently deleted", null, true)
    );
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

    return res.status(200).json(
      new ApiResponse("Doctor deactivated successfully", deactivatedDoctor, true)
    );
  }
});
