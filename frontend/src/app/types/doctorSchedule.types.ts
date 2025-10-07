export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface DoctorScheduleItem {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

export interface DoctorScheduleInput {
  schedules: DoctorScheduleItem[];
}

export interface DoctorScheduleResponse {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface GetDoctorScheduleResponse {
  doctor: {
    id: string;
    name: string;
  };
  schedules: DoctorScheduleResponse[];
}