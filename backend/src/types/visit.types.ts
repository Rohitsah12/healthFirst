import { z } from 'zod';
import { VisitType, PriorityLevel, VisitStatus } from '@prisma/client';

export const createVisitSchema = z.object({
  patientId: z.string().uuid({ message: "Invalid patient ID" }),
  doctorId: z.string().uuid({ message: "Invalid doctor ID" }),
  visitType: z.nativeEnum(VisitType, {
    message: 'Invalid visit type. Must be SCHEDULED or WALK_IN.',
  }),
  priority: z.nativeEnum(PriorityLevel, {
    message: 'Invalid priority level. Must be NORMAL or URGENT.',
  }).default(PriorityLevel.NORMAL),
  scheduledTime: z.string().datetime().optional(),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;

export const visitHistoryQuerySchema = z.object({
  date: z.string().optional(), 
});


export type VisitHistoryQuery = z.infer<typeof visitHistoryQuerySchema>;