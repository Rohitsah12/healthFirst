import * as z from "zod";
import { DayOfWeek } from "@prisma/client";


const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format (e.g., 09:00, 14:30)")
  .transform((time) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours!), parseInt(minutes!), 0, 0);
    return date;
  });


const scheduleEntrySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek, {
    message: "Day must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY"
  }),
  startTime: timeSchema,
  endTime: timeSchema,
}).refine(
  (data) => data.startTime < data.endTime,
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);


export const doctorScheduleSchema = z.object({
  schedules: z
    .array(scheduleEntrySchema)
    .min(1, "At least one schedule entry is required")
    .refine(
      (schedules) => {
        // Check for duplicate days
        const days = schedules.map(s => s.dayOfWeek);
        const uniqueDays = new Set(days);
        return days.length === uniqueDays.size;
      },
      {
        message: "Duplicate days are not allowed. Each day can only appear once.",
      }
    )
    .refine(
      (schedules) => {
        // Check for overlapping times on the same day
        for (let i = 0; i < schedules.length; i++) {
          for (let j = i + 1; j < schedules.length; j++) {
            const s1 = schedules[i]!;
            const s2 = schedules[j]!;

            if (s1.dayOfWeek === s2.dayOfWeek) {
              if (
                (s1.startTime <= s2.startTime && s2.startTime < s1.endTime) ||
                (s2.startTime <= s1.startTime && s1.startTime < s2.endTime)
              ) {
                return false;
              }
            }
          }
        }
        return true;
      },
      {
        message: "Time slots cannot overlap on the same day",
      }
    ),
});

export type DoctorScheduleInput = z.infer<typeof doctorScheduleSchema>;


export const getScheduleQuerySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
});

export type GetScheduleQuery = z.infer<typeof getScheduleQuerySchema>;