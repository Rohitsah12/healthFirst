import { UserRole } from "@prisma/client";
import prisma from "../config/prisma.config.js";
import { ApiError } from "../utils/ApiError.js";
import { hashPassword } from "../utils/hashingPassword.js";
import type { StaffCreateInput, StaffUpdateInput } from "../types/staff.types.js";

const capitalizeName = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const createStaff = async (data: StaffCreateInput) => {
  const capitalizedName = capitalizeName(data.name);
  const emailLowerCase = data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: emailLowerCase },
  });

  if (existingUser) {
    throw new ApiError("User with this email already exists", 400);
  }

  const hashedPassword = await hashPassword(data.password);

  const newStaff = await prisma.user.create({
    data: {
      name: capitalizedName,
      email: emailLowerCase,
      password: hashedPassword,
      role: UserRole.STAFF,
      phone: data.phone,
    },
  });

  const { password: _, ...sanitizedNewStaff } = newStaff;
  return sanitizedNewStaff;
};

export const getAllStaff = async () => {
  const staffList = await prisma.user.findMany({
    where: { role: UserRole.STAFF },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return staffList;
};

export const updateStaff = async (staffId: string, updateData: StaffUpdateInput) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
  });

  if (!staff || staff.role !== UserRole.STAFF) {
    throw new ApiError("Staff not found", 404);
  }

  if (updateData.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: updateData.email.toLowerCase() },
    });

    if (emailExists && emailExists.id !== staffId) {
      throw new ApiError("Email already in use by another user", 400);
    }
  }

  const dataToUpdate: any = {};

  if (updateData.name) {
    dataToUpdate.name = capitalizeName(updateData.name);
  }

  if (updateData.email) {
    dataToUpdate.email = updateData.email.toLowerCase();
  }

  if (updateData.password) {
    dataToUpdate.password = await hashPassword(updateData.password);
  }

  if (updateData.phone) {
    dataToUpdate.phone = updateData.phone;
  }

  const updatedStaff = await prisma.user.update({
    where: { id: staffId },
    data: dataToUpdate,
  });

  const { password: _, ...sanitizedUpdatedStaff } = updatedStaff;
  return sanitizedUpdatedStaff;
};

export const deleteStaff = async (staffId: string) => {
  const staff = await prisma.user.findUnique({
    where: { id: staffId },
  });

  if (!staff || staff.role !== UserRole.STAFF) {
    throw new ApiError("Staff not found", 404);
  }

  await prisma.user.delete({
    where: { id: staffId },
  });

  return null;
};