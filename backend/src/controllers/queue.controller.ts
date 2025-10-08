import type { Request, Response } from 'express';
import  prisma  from '../config/prisma.config.js';
import  asyncHandler  from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { VisitStatus } from '@prisma/client'; // Import the enum from Prisma

export const getActiveQueue = asyncHandler(async (req: Request, res: Response) => {
  const queue = await prisma.visit.findMany({
    where: {
      currentStatus: {
        in: [VisitStatus.CHECKED_IN, VisitStatus.WITH_DOCTOR],
      },
    },
    include: {
      patient: true,
      doctor: {
        include: { user: true },
      },
    },
    orderBy: [
      { priority: 'desc' },      
      { checkInTime: 'asc' },   
    ],
  });

  return res.status(200).json(new ApiResponse("Active queue fetched successfully", queue, true));
});

export const updateVisitStatus = asyncHandler(async (req: Request, res: Response) => {
  const { visitId } = req.params;
  const { status } = req.body;

  if (!status || !Object.values(VisitStatus).includes(status as VisitStatus)) {
    throw new ApiError("Invalid status provided", 400);
  }

  const updatedVisitWithDetails = await prisma.$transaction(async (tx) => {
    const visit = await tx.visit.update({
      where: { id: visitId! },
      data: {
        currentStatus: status,
        ...(status === VisitStatus.CHECKED_IN && { checkInTime: new Date() }),
        ...(status === VisitStatus.WITH_DOCTOR && { withDoctorTime: new Date() }),
        ...(status === VisitStatus.COMPLETED && { completeTime: new Date() }),
      },
    });

    // 2. Create the detailed log entry
    await tx.visitLog.create({
      data: {
        visitId: visitId!,
        status: status,
      },
    });

    // 3. Fetch the full visit details to return
    return await tx.visit.findUnique({
      where: { id: visitId! },
      include: {
        patient: true,
        doctor: { include: { user: true } },
        logs: true,
      },
    });
  });

  return res.status(200).json(new ApiResponse("Visit status updated successfully", updatedVisitWithDetails, true));
});


