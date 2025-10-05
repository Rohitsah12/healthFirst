import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { staffCreateSchema, staffIdParamSchema, staffUpdateSchema } from "../types/staff.types.js";
import { UserRole } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../config/prisma.config.js";
import { hashPassword } from "../utils/hashingPassword.js";


export const addStaff = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = staffCreateSchema.parse(req.body);

    
    const capitalizedName = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    const emailLowerCase = email.toLowerCase();
    const existingUser = await prisma?.user.findUnique({
        where: { email: emailLowerCase },
    });

    if (existingUser) {
        throw new ApiError("User with this email already exists", 400);
    }

    const hashedPassword = await hashPassword(password);
    const newStaff = await prisma?.user.create({
        data: {
            name: capitalizedName,
            email: emailLowerCase,
            password: hashedPassword,
            role: UserRole.STAFF
        }
    });

    const { password: _, ...sanitizedNewStaff } = newStaff;

    return res.status(201).json(new ApiResponse("Staff created successfully", sanitizedNewStaff));
});

export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
    const staffList = await prisma?.user.findMany({
        where: { role: UserRole.STAFF },
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
    });

    return res.status(200).json(new ApiResponse("Staff retrieved successfully", staffList));
});


export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
    const { staffId: id } = staffIdParamSchema.parse(req.params);
    const { name, email, password } = staffUpdateSchema.parse(req.body);

    const staff = await prisma?.user.findUnique({
        where: { id }
    });
    if (!staff || staff.role !== UserRole.STAFF) {
        throw new ApiError("Staff not found", 404);
    }
    const capitalizedName = name!.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    const hashedPassword = password ? await hashPassword(password) : undefined;

    const emailExists = await prisma?.user.findUnique({
        where: { email: email!.toLowerCase() }
    });
    if (emailExists && emailExists.id !== id) {
        throw new ApiError("Email already in use by another user", 400);
    }
    const updatedStaff = await prisma?.user.update({
        where: { id },
        data: {
            name: capitalizedName!,
            email: email!.toLowerCase(),
            password:hashedPassword! 
        }
    });

    const { password: _, ...sanitizedUpdatedStaff } = updatedStaff;

    return res.status(200).json(new ApiResponse("Staff updated successfully", sanitizedUpdatedStaff));
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
    const { staffId: id } = staffIdParamSchema.parse(req.params);

    const staff = await prisma?.user.findUnique({
        where: { id }
    });
    if (!staff || staff.role !== UserRole.STAFF) {
        throw new ApiError("Staff not found", 404);
    }

    await prisma?.user.delete({
        where: { id }
    });

    return res.status(204).json(new ApiResponse("Staff deleted successfully", null));
});